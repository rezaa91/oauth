import express from 'express';
import {getAccessToken} from '../middleware/getAccessToken';

const router = express.Router();

router.get('/', getAccessToken, (req, res) => {
  res.status(200).json({
    data: [
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
  })
})

export default router;
