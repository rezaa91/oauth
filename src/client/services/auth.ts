import fetch from 'node-fetch';
import qs from 'qs';
import {Auth, Client} from '../config';

type TokenResponse = {
  access_token: string;
  token_type: string;
  refresh_token?: string;
  expiry?: number;
}

export async function getToken(code: string): Promise<TokenResponse> {
  console.log('requesting access token...');
  const body = qs.stringify({
    grant_type: 'authorization_code',
    code,
    redirect_uri: Client.redirectURL
  });

  const headers = {
    'content-type': 'application/x-www-form-urlencoded',
    'authorization': 'basic ' + Buffer.from(`${Client.id}:${Client.secret}`).toString('base64')
  };

  const response = await fetch(Auth.tokenURL, {method: 'POST', body, headers});
  return response.json();
}

