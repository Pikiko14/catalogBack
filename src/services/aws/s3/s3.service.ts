import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  S3Client,
  ListBucketsCommand,
  PutBucketCorsCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

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
      const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: fileName,
        Body: file.buffer,
      });
      const response = await this.client.send(command);
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
      console.log(response);
    } catch (error: any) {
      throw error.message;
    }
  }
}