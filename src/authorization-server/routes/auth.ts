import express from 'express';
import randomString from 'randomstring';
import {UntrustedRequest} from '../db';
import {clientScopeDisallowed, getClientByAccessToken, getClientByAuthCode, getClientById, insertAccessToken, updateClientScopes} from '../repositories/client';
import { insertCode, removeCode } from '../repositories/code';
import { deleteUntrustedRequest, getUntrustedRequestById, insertUntrustedRequest } from '../repositories/request';
import { getProtectedResourceById } from '../repositories/resource';

const router = express.Router();

router.get('/', (req, res) => {
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

  const requestedScopes = req.query.scope ? (req.query.scope as string).split(',') : [];
  // if (clientScopeDisallowed(client, requestedScopes)) {
  //   const params = new URLSearchParams({
  //     error: 'invalid scope'
  //   })
  //   res.redirect(`${req.query.redirect_uri}?${params.toString()}`);
  //   return;
  // }

  // insert request details to be retrieved and checked during the /approve request
  const reqId = insertUntrustedRequest(req.query as UntrustedRequest);
  res.render('approve', {client, reqId, scopes: requestedScopes});
});

router.post('/approve', (req, res) => {

  const reqId = req.body.reqId;
  const query = getUntrustedRequestById(reqId);

  if (!query) {
    res.status(500).json({success: false, message: 'unrecognised request'});
    return;
  }
  deleteUntrustedRequest(reqId);

  if (!req.body.approve) {
    const params = new URLSearchParams({
      error: 'access denied'
    });
    res.redirect(`${query.redirect_uri}?${params.toString()}`);
    return;
  }

  if (query.response_type === 'code') {
    const authorizationCode = randomString.generate(8);
    const scopes = Object.keys(req.body).filter(key => key.startsWith('scope_')).map(scope => scope.slice(6)).join(',');
    updateClientScopes(query.client_id, scopes);
    insertCode(query.client_id, authorizationCode);

    const params = new URLSearchParams({
      code: authorizationCode,
      state: query.state
    });
    res.redirect(`${query.redirect_uri}?${params.toString()}`);
    return;
  }

  const params = new URLSearchParams({
    error: 'unsupported response type'
  });
  res.redirect(`${query.redirect_uri}?${params.toString()}`);
  return;
});


router.post('/token', (req, res) => {
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


router.post('/introspect', (req, res) => {
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
      scope: client.scope.split(','),
      client: client.client_id
    })
    return;
  }

  res.status(404).json({success: false, message: 'no matching token found'});
});

export default router;
