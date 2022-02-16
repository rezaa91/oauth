import {Request, Response, NextFunction} from 'express';
import {getTokenInfo} from '../services/auth';

export async function getAccessToken(req: Request, res: Response, next: NextFunction) {
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
  next();
}