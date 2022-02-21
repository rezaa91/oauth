import fetch from 'node-fetch';
import qs from 'qs';
import {Auth, Resource} from '../config';

export type TokenInfo = {
  active: boolean;
  iss: string;
  scope: string[];
}

export async function getTokenInfo(token: string): Promise<TokenInfo> {
  console.log(`getting info for token ${token}`);
  const body = qs.stringify({token});
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': 'Basic ' + Buffer.from(`${Resource.id}:${Resource.secret}`).toString('base64')
  }

  const response = await fetch(Auth.introspectURL, {method: 'POST', headers, body});
  return response.json();
}
