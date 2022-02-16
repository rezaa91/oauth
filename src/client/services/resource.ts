import fetch from 'node-fetch';
import {Resource} from '../config';

export async function getBooks(accessToken: string): Promise<any> {
  console.log('retrieving books from API');
  const headers = {
    'Authorization': `bearer ${accessToken}`,
    'Content-Type': 'application/x-www-form-urlencoded'
  }
  const response = await fetch(Resource.protected, {method: 'GET', headers});
  return response.json();
}
