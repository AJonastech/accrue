import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const getEnv = (key: string) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

const bucket = () => getEnv("AWS_S3_BUCKET_NAME");

const createClient = () => {
  const endpoint = process.env.AWS_ENDPOINT_URL;
  const region = getEnv("AWS_DEFAULT_REGION");
  const accessKeyId = getEnv("AWS_ACCESS_KEY_ID");
  const secretAccessKey = getEnv("AWS_SECRET_ACCESS_KEY");

  return new S3Client({
    region,
    endpoint,
    forcePathStyle: Boolean(endpoint),
    credentials: { accessKeyId, secretAccessKey },
  });
};

export async function createPresignedUploadUrl(
  key: string,
  contentType: string,
) {
  const client = createClient();
  const command = new PutObjectCommand({
    Bucket: bucket(),
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(client, command, { expiresIn: 60 });
}

export async function createPresignedGetUrl(key: string) {
  const client = createClient();
  const command = new GetObjectCommand({
    Bucket: bucket(),
    Key: key,
  });
  return getSignedUrl(client, command, { expiresIn: 60 * 10 });
}

export async function getObjectStream(key: string) {
  const client = createClient();
  const command = new GetObjectCommand({
    Bucket: bucket(),
    Key: key,
  });
  const response = await client.send(command);
  return {
    body: response.Body,
    contentType: response.ContentType,
    contentLength: response.ContentLength,
  };
}
