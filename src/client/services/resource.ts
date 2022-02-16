import fetch from 'node-fetch';
import {Resource} from '../config';

type Book = {
  title: string;
  author: string;
}

export async function getBooks(accessToken: string): Promise<{data: Book}> {
  console.log('retrieving books from API');
  const headers = {
    'Authorization': `bearer ${accessToken}`,
    'Content-Type': 'application/x-www-form-urlencoded'
  }
  const response = await fetch(Resource.protected, {method: 'GET', headers});
  return response.json();
}
