import {AddressInfo} from 'net';
import express, { Response, Request, NextFunction } from 'express';
import bodyParser from 'body-parser';
import qs from 'qs';
import fetch from 'node-fetch';

import {Resource, Auth} from './config';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

async function getAccessToken(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers['authorization'];
  const token = auth?.toLowerCase().slice('bearer '.length);

  if (!token) {
    console.log('no access token found');
    res.status(401).json({success: false, message: 'no access token'});
    return;
  }

  console.log(`incoming token ${token}`);

  const body = qs.stringify({token});
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': 'Basic ' + Buffer.from(Resource.id + ':' + Resource.secret).toString('base64')
  }

  const tokenResponse = await fetch(Auth.introspectURL, {method: 'POST', headers, body});
  if (tokenResponse.status >= 200 && tokenResponse.status < 300) {
    const body = await tokenResponse.json();
    console.log(`introspect response: ${body}`);
    if (!body.active) {
      res.status(401).json({success: false, message: 'invalid access token'});
      return;
    }
  }

  next();
}

app.get('/resource', getAccessToken, (req, res) => {
  console.log('endpoint hit');
  // TODO - for now just send successful resposne
  res.status(200).json({data: 'This is a protected resource woooop'});


  /**
   * TODO:
   * get token from authorization header
   * using own client_id and secret, ping the auth server introspection endpoint to validate token
   */
});

const server = app.listen(5002, () => {
  const {address, port} = server.address() as AddressInfo;
  console.log(`Resource server listening at http://${address}:${port}`);
});
