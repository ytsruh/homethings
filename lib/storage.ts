import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const s3 = new S3Client({
  endpoint: process.env.STORAGE_ENDPOINT, // Find your endpoint in the control panel, under Settings. Prepend "https://".
  forcePathStyle: false, // Configures to use subdomain/virtual calling format.
  region: "auto", // Must be "us-east-1" when creating new Spaces. Otherwise, use the region in your endpoint (e.g. nyc3).
  credentials: {
    accessKeyId: process.env.STORAGE_KEY as string, // Access key pair. You can create access key pairs using the control panel or API.
    secretAccessKey: process.env.STORAGE_SECRET as string, // Secret access key defined through an environment variable.
  },
});

// const exampleBucketParams = {
//   Bucket: process.env.STORAGE_BUCKET,
//   Key: `webiliti/test.text`,
//   Body: "params.content",
//   ACL: "public-read", // Has to be set as the default setting is "private"
//   ContentType: "multipart/form-data",
// };

export const createS3GetUrl = async (fileName: string, expiry: number = 3600) => {
  const command = new GetObjectCommand({
    Bucket: process.env.STORAGE_BUCKET,
    Key: `homethings/docs/${fileName}`,
  });
  return await getSignedUrl(s3, command, { expiresIn: expiry });
};

export const createS3PutUrl = async (fileName: string, expiry: number = 3600) => {
  const command = new PutObjectCommand({
    Bucket: process.env.STORAGE_BUCKET,
    Key: `homethings/docs/${fileName}`,
    ACL: "public-read",
    ContentType: "multipart/form-data",
  });
  return await getSignedUrl(s3, command, { expiresIn: expiry });
};
