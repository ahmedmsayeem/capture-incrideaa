import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { RekognitionClient, SearchFacesByImageCommand, IndexFacesCommand } from "@aws-sdk/client-rekognition";
import type { NextApiRequest, NextApiResponse } from 'next';

// AWS configuration
const REGION = process.env.AWS_REGION!;
const BUCKET_NAME = process.env.AWS_S3_BUCKET!;
const COLLECTION_ID = process.env.AWS_REKOGNITION_COLLECTION_ID;

// Create S3 and Rekognition clients
const s3Client = new S3Client({ region: REGION });
const rekognitionClient = new RekognitionClient({ region: REGION });

export const config = {
  api: {
    bodyParser: false,
  },
};

const bufferRequestBody = async (req: NextApiRequest): Promise<Buffer> => {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    req.on('data', (chunk) => {
      chunks.push(chunk);
    });
    req.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    req.on('error', (err) => {
      reject(err);
    });
  });
};

async function uploadBlob(req: NextApiRequest, key: string): Promise<string> {
  const body = await bufferRequestBody(req);
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: req.headers['content-type'] as string,
    ContentLength: body.length,
  };

  try {
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    return key;
  } catch (err) {
    console.log("Error uploading blob to S3:", err);
    throw err;
  }
}

async function indexFaces(key: string) {
  const indexParams = {
    CollectionId: COLLECTION_ID,
    Image: {
      S3Object: {
        Bucket: BUCKET_NAME,
        Name: key,
      },
    },
    DetectionAttributes: [],
  };

  try {
    const command = new IndexFacesCommand(indexParams);
    await rekognitionClient.send(command);
  } catch (error) {
    console.error("Error indexing faces:", error);
    throw error;
  }
}

async function searchFacesByImage(key: string) {
  const searchParams = {
    CollectionId: COLLECTION_ID,
    Image: {
      S3Object: {
        Bucket: BUCKET_NAME,
        Name: key,
      },
    },
    MaxFaces: 5,
    FaceMatchThreshold: 80,
    QualityFilter: "AUTO" as const,
  };

  try {
    const command = new SearchFacesByImageCommand(searchParams);
    const response = await rekognitionClient.send(command);
    return response;
  } catch (error) {
    console.error("Error searching faces by image:", error);
    throw error;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const key = req.headers['x-file-name'] as string;

    try {
      await uploadBlob(req, key);
      await indexFaces(key); // Index the image in the collection
      const searchResults = await searchFacesByImage(key);
      res.status(200).json(searchResults);
    } catch (error) {
      console.error('Error processing request', error);
      res.status(500).json({ error: 'Error processing request' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}