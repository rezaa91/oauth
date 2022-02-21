import db, {Book} from '../db';

export function getBooks(): Book[] {
  return db.books;
}

export function insertBook(book: Book): void {
  db.books.push(book);
}
