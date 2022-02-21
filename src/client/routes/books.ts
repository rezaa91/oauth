import express from 'express';
import {getBooks, insertBook} from '../services/resource';
import {isAuthorised} from '../middleware/isAuthorised';

const router = express.Router();

router.get('/', isAuthorised, async(req, res) => {
  try {
    const books = await getBooks(req.cookies.access_token);
    res.render('books', {books});
    return;
  } catch (error: any) {
    console.log(error);
    res.render('error', {error: error.message ?? 'an error occured fetching books'});
    return;
  }
});

router.post('/', isAuthorised, async(req, res) => {
  try {
    const book = {title: req.body.title, author: req.body.author};
    const books = await insertBook(req.cookies.access_token, book);
    res.render('books', {books});
    return;
  } catch (error: any) {
    console.log(error);
    res.render('error', {error: error.message ?? 'an error occured fetching books'});
    return;
  }
});

export default router;
