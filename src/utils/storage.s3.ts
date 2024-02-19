import multer from 'multer';
import { S3Service } from "../services/aws/s3/s3.service";
import { NextFunction, Request, Response } from 'express';
import { deniedResponse } from './api.responser';

// instanciate s3 service
new S3Service();

// prepare multer
const storage = multer.memoryStorage();
const uploadS3 = multer({
    storage: storage,
});

// Middleware para validar el tamaño del archivo
const validateFileSize = (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
        return deniedResponse(res, {}, 'No file in request.');
    }
    if (req.file.size > 1000000) {
        return deniedResponse(res, {}, 'File size exceeds 1MB limit.');
    }
    next();
}

export {
    uploadS3,
    validateFileSize,
}
