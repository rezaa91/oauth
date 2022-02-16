import {Request, Response, NextFunction} from 'express';

export function isAuthorised(req: Request, res: Response, next: NextFunction): void {
  if (!req.cookies.access_token) {
    if (req.cookies.refresh_token) {
      // TODO
      // refresh access token
      res.status(500).json({success: false, message: 'need to implement refresh token'});
      return;
    } else {
      res.status(401).json({success: false, message: 'no access token'});
    }
  }
  next();
}