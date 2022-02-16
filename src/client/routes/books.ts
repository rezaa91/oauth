import express from 'express';
import { getBooks } from '../services/resource';
import {isAuthorised} from '../middleware/isAuthorised';

const router = express.Router();

router.get('/', isAuthorised, async(req, res) => {
  try {
    const books = await getBooks(req.cookies.access_token);
    res.render('data', {books});
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({success: false, message: 'an error occured fetching books'});
    return;
  }
});

export default router;
