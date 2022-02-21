import express from 'express';
import {getAccessToken, RequestWithAccessToken} from '../middleware/getAccessToken';
import {getBooks, insertBook} from '../repositories/book';

const router = express.Router();

router.get('/', getAccessToken, (req: RequestWithAccessToken, res) => {
  if (req.access_token?.scope.includes('read')) {
    res.status(200).json(getBooks());
    return;
  }
  res.status(403).send({success: false, error: 'access denied'});
  return;
});

router.post('/', getAccessToken, (req: RequestWithAccessToken, res) => {
  console.log(req.access_token?.scope);
  if (req.access_token?.scope.includes('write')) {
    console.log(req.body);
    insertBook(req.body);
    res.status(200).json(getBooks());
    return;
  }
  res.status(403).send({success: false, error: 'access denied'});
  return;
});

export default router;
