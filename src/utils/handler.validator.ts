import { validationResult  } from 'express-validator';
import { unProcesableEntityResponse } from './api.responser';
import { Request, Response } from 'express';
import { NextFunction } from 'express';

export const handlerValidator  = (req: Request, res: Response, next: NextFunction) => {
    try {
        validationResult(req).throw();
        return next();
    } catch (error: any) {
        return unProcesableEntityResponse(res, error.array(), 'Error request body')
    }
}