import { S3Client, ListObjectsV2Command, PutObjectCommand } from "@aws-sdk/client-s3";
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';

// Initialize the S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const bucketName = process.env.AWS_S3_BUCKET;

    const params = {
      Bucket: bucketName,
    };

    try {
      const command = new ListObjectsV2Command(params);
      const response = await s3Client.send(command);
      const objects = response.Contents;

      if (objects) {
        const objectDetails = objects.map((obj) => ({
          key: obj.Key,
          lastModified: obj.LastModified,
          size: obj.Size,
        }));
        res.status(200).json(objectDetails);
      } else {
        res.status(200).json({ message: 'No objects found in the bucket.' });
      }
    } catch (error) {
      console.error('Error listing objects', error);
      res.status(500).json({ error: 'Error listing objects' });
    }
  } else if (req.method === 'POST') {
    const bucketName = process.env.AWS_S3_BUCKET;
    const key = req.headers['x-file-name'] as string;
    const contentType = req.headers['content-type'] as string;
    const contentLength = req.headers['content-length'] as string;

    try {
      const params = {
        Bucket: bucketName,
        Key: key,
        Body: req,
        ContentType: contentType,
        ContentLength: parseInt(contentLength, 10),
      };

      const command = new PutObjectCommand(params);
      await s3Client.send(command);
      res.status(200).json({ message: 'File uploaded successfully' });
    } catch (error) {
      console.error('Error uploading file', error);
      res.status(500).json({ error: 'Error uploading file' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}