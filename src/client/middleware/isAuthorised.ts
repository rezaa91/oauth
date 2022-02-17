import {Request, Response, NextFunction} from 'express';

export function isAuthorised(req: Request, res: Response, next: NextFunction): void {
  if (!req.cookies.access_token) {
    if (req.cookies.refresh_token) {
      // TODO
      // implement refresh access token
      res.render('error', {error: 'access denied'});
      return;
    } else {
      res.render('error', {error: 'access denied'});
      return;
    }
  }
  next();
}