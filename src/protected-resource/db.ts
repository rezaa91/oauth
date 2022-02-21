export type Book = {
  title: string;
  author: string;
}

type Db = {
  books: Book[];
}

const db: Db = {
  books: [
    {
      title: 'Harry Potter',
      author: 'JK Rowling'
    },
    {
      title: 'Game of Thrones',
      author: 'GRRM'
    },
    {
      title: 'Oauth in action',
      author: 'Justin Richer'
    }
  ]
}

export default db;
