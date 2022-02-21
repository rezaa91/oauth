import fetch from 'node-fetch';
import {Resource} from '../config';

type Book = {
  title: string;
  author: string;
}

export async function getBooks(accessToken: string): Promise<Book[]> {
  console.log('retrieving books from API');
  const headers = {
    'Authorization': `bearer ${accessToken}`,
    'Content-Type': 'application/x-www-form-urlencoded'
  };
  const response = await fetch(Resource.protected, {method: 'GET', headers});
  const data = await response.json();

  if (response.status >= 400) {
    throw new Error(data.error);
  }

  return data;
}

export async function insertBook(accessToken: string, book: {title: string, author: string}): Promise<Book[]> {
  console.log('Inserting book');
  const headers = {
    'Authorization': `bearer ${accessToken}`,
    'Content-Type': 'application/json'
  };
  const response = await fetch(Resource.protected, {
    method: 'POST',
    body: JSON.stringify(book),
    headers
  });

  const data = await response.json();
  if (response.status >= 400) {
    throw new Error(data.error);
  }
  return data;
}
