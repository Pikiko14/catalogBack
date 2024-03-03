import {
  S3Client,
  ListBucketsCommand,
  PutBucketCorsCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import sharp from 'sharp';

export class S3Service {
  client: S3Client;

  constructor() {
    this.client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_KEY as string,
        secretAccessKey: process.env.AWS_SECRET as string,
      },
    });
    this.getBuckets();
  }

  /**
   * List buckets
   * @returns
   */
  getBuckets = async () => {
    try {
      const command = new ListBucketsCommand({});
      const { Buckets } = await this.client.send(command) as any;
      Buckets.map((bucket: any) => this.setCoors(bucket.Name));
      return Buckets;
    } catch (error: any) {
      console.log(error.message);
    }
  };

  /**
   * set coors on bucket
   * @param bucket 
   */
  setCoors = async (bucket: any) => {
    const command = new PutBucketCorsCommand({
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
    } catch (err: any) {
      console.error(err);
    }
  }

  /**
   * Upload file to s3 server
   * @param { any } file
   */
  uploadSingleObject = async (file: any): Promise<any> => {
    try {
      // upload single file to aws
      const fileName = `${new Date().getTime()}${file.originalname}`;
      const webpBuffer = await sharp(file.buffer).toFormat('webp').toBuffer();
      const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: fileName,
        Body: webpBuffer,
      };
      const response = await this.uploadFile(params);
      // Generar una URL firmada para el objeto recién cargado sin límite de tiempo de expiración
      if (response.ETag) {
        let url = `${process.env.AWS_S3_URL}/${fileName}`;
        return url;
      }
    } catch (error: any) {
      console.error(error);
      throw error.message;
    }
  }

  /**
   * Upload multiples files to s3 server
   * @param { any } files
   */
  uploadMultipleFiles = async (files: any) => {
    try {
      const filesArrys: string[] = [];
      const promises = files.map(async (file: any) => {
        // Configura los parámetros para cada archivo
        const fileName = `${new Date().getTime()}${file.originalname}`;
        const webpBuffer = await sharp(file.buffer).toFormat('webp').toBuffer();
        const params = {
          Bucket: process.env.AWS_S3_BUCKET,
          Key: fileName,
          Body: webpBuffer,
        };
        filesArrys.push(`${process.env.AWS_S3_URL}/${fileName}`);
        return this.uploadFile(params);
      });
      // Espera a que todas las promesas de carga se completen
      await Promise.all(promises);
      return filesArrys;
    } catch (error) {
      console.error("Error uploading files to S3:", error);
      throw error;
    }
  }

  /**
   * Upload file
   * @param params 
   * @returns 
   */
  uploadFile = async (params: any) => {
    try {
      const command = new PutObjectCommand(params);
      const response = await this.client.send(command);
      return response;
    } catch (error: any) {
      console.error("Error uploading file to S3:", error.message);
      throw error;
    }
  }

  /**
   * Delete file in s3 server
   * @param { string } fileKey
   */
  deleteSingleObject = async (fileKey: string): Promise<any> => {
    try {
      // prepare command for delete
      const command = new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: fileKey,
      });
      const response = await this.client.send(command);
    } catch (error: any) {
      throw error.message;
    }
  }
}