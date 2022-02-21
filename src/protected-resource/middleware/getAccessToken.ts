import {Request, Response, NextFunction} from 'express';
import {getTokenInfo, TokenInfo} from '../services/auth';

export type RequestWithAccessToken = Request & {
  access_token?: TokenInfo;
}

export async function getAccessToken(req: RequestWithAccessToken, res: Response, next: NextFunction) {
  const auth = req.headers['authorization'];
  const token = auth?.slice(7); // 'bearer '

  if (!token) {
    console.log('no access token found');
    res.status(401).json({success: false, message: 'no access token'});
    return;
  }

  const tokenInfo = await getTokenInfo(token);
  console.log(tokenInfo);
  if (!tokenInfo.active) {
    res.status(401).json({success: false, message: 'invalid access token'});
    return;
  }
  req.access_token = tokenInfo;
  next();
}