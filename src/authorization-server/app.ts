import path from 'path';
import {AddressInfo} from 'net';
import express from 'express';
import bodyParser from 'body-parser';
import cons from 'consolidate';
import randomString from 'randomstring';

import db, { UntrustedRequest } from './db';
import {
  getClientById,
  clientScopeDisallowed,
  getClientByAuthCode,
  insertCode,
  insertUntrustedRequest,
  getUntrustedRequestById,
  deleteUntrustedRequest,
  removeCode,
  insertAccessToken,
  getProtectedResourceById,
  getClientByAccessToken
} from './repository';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.engine('html', cons.underscore);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, '../../public/authorization-server'));


app.get('/', (req, res) => {
  res.render('index', {clients: db.clients});
});

app.get('/authorize', (req, res) => {
  const client = getClientById(req.query.client_id as string);
  if (!client) {
    console.log(`Unknown client ${req.query.client_id}`);
    res.status(404).json({success: false, message: 'Unknown client'});
    return;
  }

  if (client.redirect_uri !== req.query.redirect_uri) {
    console.log(`Mismatched redirect URI. Expected ${client.redirect_uri} got ${req.query.redirect_uri}`);
    res.status(401).json({success: false, message: 'Mismatched redirect URI'});
    return;
  }

  const requestedScopes = req.query.scope ? (req.query.scope as string).split(' ') : [];
  if (clientScopeDisallowed(client, requestedScopes)) {
    const params = new URLSearchParams({
      error: 'invalid_scope'
    })
    res.redirect(`${req.query.redirect_uri}?${params.toString()}`);
    return;
  }

  const reqId = insertUntrustedRequest(req.query as UntrustedRequest);
  res.render('approve', {client, reqId, scopes: requestedScopes});
});


app.post('/approve', (req, res) => {

  const reqId = req.body.reqId;
  const query = getUntrustedRequestById(reqId);

  if (!query) {
    res.status(500).json({success: false, message: 'unrecognised request'});
    return;
  }
  deleteUntrustedRequest(reqId);

  if (!req.body.approve) {
    const params = new URLSearchParams({
      error: 'access_denied'
    });
    res.redirect(`${query.redirect_uri}?${params.toString()}`);
    return;
  }

  if (query.response_type === 'code') {
    const authorizationCode = randomString.generate(8);
    insertCode(query.client_id, authorizationCode);

    const params = new URLSearchParams({
      code: authorizationCode,
      state: query.state
    });
    res.redirect(`${query.redirect_uri}?${params.toString()}`);
    return;
  }

  if (query.response_type === 'token') {
    // implicit grant
  }

  const params = new URLSearchParams({
    error: 'unsupported_response_type'
  });
  res.redirect(`${query.redirect_uri}?${params.toString()}`);
  return;
});


app.post('/token', (req, res) => {

  const auth = req.headers['authorization'];
  if (!auth) {
    res.status(401).json({success: false, message: 'unauthenticated'});
    return;
  }

  const [clientId, clientSecret] = Buffer.from(auth.slice('basic '.length), 'base64').toString().split(':');
  const client = getClientById(clientId);

  if (!client) {
    console.log('Unknown client');
    res.status(401).json({success: false, message: 'invalid_client'});
    return;
  }

  if (client.client_secret !== clientSecret) {
    console.log('Mismatched client secret');
    res.status(401).json({success: false, message: 'invalid_client'});
    return;
  }

  if (req.body.grant_type === 'authorization_code') {
    const code = req.body.code;
    if (!code) {
      res.status(400).json({success: false, message: 'unknown_code'});
      return;
    }

    const clientCheck = getClientByAuthCode(code);
    if (!clientCheck || clientCheck !== client) {
      res.status(400).json({success: false, message: 'client_mismatch'});
      return;
    }
    removeCode(code);

    const accessToken = randomString.generate();
    insertAccessToken(client.client_id, accessToken);
    console.log(`Issuing access token: ${accessToken}`);
    res.status(200).json({
      access_token: accessToken,
      token_type: 'Bearer',
      scope: client.scope
    });
  }
});


app.post('/introspect', (req, res) => {
  const auth = req.headers['authorization'];
  const resourceCredentials = auth && Buffer.from(auth.slice('Basic '.length), 'base64').toString().split(':');
  const resourceId = resourceCredentials?.[0];
  const resourceSecret = resourceCredentials?.[1];

  const resource = getProtectedResourceById(resourceId);
  if (!resource || resourceSecret !== resource.secret) {
    res.status(404).json({success: false, message: 'resource server not found'});
    return;
  }

  const token = req.body.token;
  console.log(`introspecting token ${token}`);
  const client = getClientByAccessToken(token);

  if (client) {
    res.status(200).json({
      active: true,
      iss: 'http://localhost:5001',
      scope: client.scope,
      client: client.client_id
    })
    return;
  }

  res.status(404).json({success: false, message: 'no matching token found'});
});


const server = app.listen(5001, 'localhost', () => {
  const {address, port} = server.address() as AddressInfo;
  console.log(`Oauth authorization server listening at http://${address}:${port}`);
})
