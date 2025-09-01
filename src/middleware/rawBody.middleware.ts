import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to capture raw body for webhook signature verification
 */
export function rawBodyMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.headers['content-type'] === 'application/json') {
    let data = '';
    
    req.on('data', (chunk) => {
      data += chunk;
    });
    
    req.on('end', () => {
      req.body = data;
      next();
    });
  } else {
    next();
  }
}