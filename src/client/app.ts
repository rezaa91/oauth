import path from 'path';
import {AddressInfo} from 'net';
import express from 'express';
import bodyParser from 'body-parser';
import cons from 'consolidate';
import randomString from 'randomstring';
import qs from 'qs';
import fetch from 'node-fetch';

import {Client, Auth, Resource} from './config';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.engine('html', cons.underscore);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, '../../public/client'));


app.get('/', (req, res) => {
  res.render('index');
});

let state: string;
app.get('/authorize', (req, res) => {

  state = randomString.generate();
  const authParameters = new URLSearchParams({
    response_type: 'code',
    scope: Client.scope,
    client_id: Client.id,
    redirect_uri: Client.redirectURL,
    state
  });
  const authorizeURL = `${Auth.authorizeURL}?${authParameters.toString()}`;
  console.log('redirect', authorizeURL);
  res.redirect(authorizeURL);
});


// store tokens globally for ease of use
let accessToken: string;
let refreshToken: string;

app.get('/callback', async(req, res) => {
  if (req.query.error) {
    res.status(500).json({error: req.query.error});
    return;
  }

  const resState = req.query.state;
  if (resState !== state) {
    res.status(500).json({error: 'state values do not match!'});
    return;
  }

  const authCode = req.query.code;
  const formData = qs.stringify({
    grant_type: 'authorization_code',
    code: authCode,
    redirect_uri: Client.redirectURL
  });
  const headers = {
    'content-type': 'application/x-www-form-urlencoded',
    'authorization': 'basic ' + Buffer.from(Client.id + ':' + Client.secret).toString('base64')
  }

  console.log('requesting access token');
  const tokenResponse = await fetch(Auth.tokenURL, {method: 'POST', body: formData, headers});

  if (tokenResponse.status >= 200 && tokenResponse.status < 300) {
    const body = await tokenResponse.json();
    accessToken = body.access_token;
    console.log(`Got access token ${body.access_token}`);

    if (body.refresh_token) {
      refreshToken = body.refresh_token;
      console.log(`Got refresh token ${body.refresh_token}`);
    }

    res.redirect('fetch-resource');
    return;
  } else {
    console.log('No access token, asking the user to get a new one...');
    res.redirect('/authorize');
    return;
  }
});

app.get('/fetch-resource', async (req, res) => {
  if (!accessToken) {
    if (refreshToken) {
      // TODO
      // refreshAccessToken();
      return;
    } else {
      res.status(401).json({success: false, message: 'no access token'});
      return;
    }
  }

  console.log(`Making request to protected resource with access token ${accessToken}`);

  const headers = {
    'Authorization': 'bearer ' + accessToken,
    'Content-Type': 'application/x-www-form-urlencoded'
  };

  const resource = await fetch(Resource.protected, {method: 'GET', headers});
  console.log(resource);
  if (resource.status >= 200 && resource.status < 300) {
    const body = await resource.json();
    res.render('data', {resource: body});
    return;
  }

  res.status(500).json({success: false, message: 'an error occured fetching resource'});
});

const server = app.listen(5000, 'localhost', () => {
  const {address, port} = server.address() as AddressInfo;
  console.log(`Oauth client is listening at http://${address}:${port}`);
});
