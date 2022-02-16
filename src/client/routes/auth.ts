import express from 'express';
import randomString from 'randomstring';
import {Client, Auth} from '../config';
import {getToken} from '../services/auth';

const router = express.Router();

let state: string;
router.get('/', (req, res) => {
  state = randomString.generate();
  const authParameters = new URLSearchParams({
    response_type: 'code',
    scope: Client.scope,
    client_id: Client.id,
    redirect_uri: Client.redirectURL,
    state
  });
  const authorizeURL = `${Auth.authorizeURL}?${authParameters.toString()}`;
  res.redirect(authorizeURL);
});

router.get('/callback', async (req, res) => {
  if (req.query.error) {
    res.status(500).json({error: req.query.error});
    return;
  }

  if (req.query.state !== state) {
    res.status(500).json({error: 'state values do not match!'});
    return;
  }

  try {
    const authCode = req.query.code as string;
    const token = await getToken(authCode);
    console.log(`received access token ${token.access_token}`);
    res.cookie('access_token', token.access_token, {maxAge: 86400, httpOnly: true});
    res.cookie('refresh_token', token.refresh_token, {maxAge: 86400 * 30, httpOnly: true});
    res.redirect('/books');
  } catch (error) {
    console.log(error);
    res.redirect('/auth');
    return;
  }
})

export default router;
