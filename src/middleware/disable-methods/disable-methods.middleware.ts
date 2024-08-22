import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class DisableMethodsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (['POST', 'PATCH', 'DELETE'].includes(req.method)) {
      throw new ForbiddenException(`Method ${req.method} is not allowed.`);
    }
    next();
  }
}
