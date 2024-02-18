import multer from 'multer';
import { S3Service } from "../services/aws/s3/s3.service";

// instanciate s3 service
new S3Service();

// prepare multer
const storage = multer.memoryStorage();
const uploadS3 = multer({ storage: storage });

export {
    uploadS3,
}
