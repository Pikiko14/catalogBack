"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Service = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
class S3Service {
    constructor() {
        /**
         * List buckets
         * @returns
         */
        this.getBuckets = async () => {
            try {
                const command = new client_s3_1.ListBucketsCommand({});
                const { Buckets } = await this.client.send(command);
                Buckets.map((bucket) => this.setCoors(bucket.Name));
                return Buckets;
            }
            catch (error) {
                console.log(error.message);
            }
        };
        /**
         * set coors on bucket
         * @param bucket
         */
        this.setCoors = async (bucket) => {
            const command = new client_s3_1.PutBucketCorsCommand({
                Bucket: bucket,
                CORSConfiguration: {
                    CORSRules: [
                        {
                            AllowedHeaders: ["*"],
                            AllowedMethods: ["GET", "PUT", "POST", "DELETE"],
                            AllowedOrigins: [`${process.env.APP_URL_ADMIN}`, `${process.env.APP_URL}`],
                            ExposeHeaders: ["ETag"],
                            MaxAgeSeconds: 60,
                        },
                    ],
                },
            });
            try {
                const response = await this.client.send(command);
            }
            catch (err) {
                console.error(err);
            }
        };
        /**
         * Upload file to s3 server
         * @param { any } file
         */
        this.uploadSingleObject = async (file) => {
            try {
                // upload single file to aws
                const fileName = `${new Date().getTime()}${file.originalname}`;
                const params = {
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: fileName,
                    Body: file.buffer,
                };
                const response = await this.uploadFile(params);
                // Generar una URL firmada para el objeto recién cargado sin límite de tiempo de expiración
                if (response.ETag) {
                    let url = `${process.env.AWS_S3_URL}/${fileName}`;
                    return url;
                }
            }
            catch (error) {
                console.error(error);
                throw error.message;
            }
        };
        /**
         * Upload multiples files to s3 server
         * @param { any } files
         */
        this.uploadMultipleFiles = async (files) => {
            try {
                const filesArrys = [];
                const promises = files.map((file) => {
                    // Configura los parámetros para cada archivo
                    const fileName = `${new Date().getTime()}${file.originalname}`;
                    const params = {
                        Bucket: process.env.AWS_S3_BUCKET,
                        Key: fileName,
                        Body: file.buffer,
                    };
                    filesArrys.push(`${process.env.AWS_S3_URL}/${fileName}`);
                    return this.uploadFile(params);
                });
                // Espera a que todas las promesas de carga se completen
                await Promise.all(promises);
                return filesArrys;
            }
            catch (error) {
                console.error("Error uploading files to S3:", error);
                throw error;
            }
        };
        /**
         * Upload file
         * @param params
         * @returns
         */
        this.uploadFile = async (params) => {
            try {
                const command = new client_s3_1.PutObjectCommand(params);
                const response = await this.client.send(command);
                return response;
            }
            catch (error) {
                console.error("Error uploading file to S3:", error.message);
                throw error;
            }
        };
        /**
         * Delete file in s3 server
         * @param { string } fileKey
         */
        this.deleteSingleObject = async (fileKey) => {
            try {
                // prepare command for delete
                const command = new client_s3_1.DeleteObjectCommand({
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: fileKey,
                });
                const response = await this.client.send(command);
            }
            catch (error) {
                throw error.message;
            }
        };
        this.client = new client_s3_1.S3Client({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_KEY,
                secretAccessKey: process.env.AWS_SECRET,
            },
        });
        this.getBuckets();
    }
}
exports.S3Service = S3Service;
