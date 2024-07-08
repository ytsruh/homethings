import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { Context } from "hono";

const getClient = (c: Context) => {
  return new S3Client({
    endpoint: c.env.STORAGE_ENDPOINT, // Find your endpoint in the control panel, under Settings. Prepend "https://".
    forcePathStyle: false, // Configures to use subdomain/virtual calling format.
    region: "auto",
    credentials: {
      accessKeyId: c.env.STORAGE_KEY as string, // Access key pair. You can create access key pairs using the control panel or API.
      secretAccessKey: c.env.STORAGE_SECRET as string, // Secret access key defined through an environment variable.
    },
  });
};

// const exampleBucketParams = {
//   Bucket: process.env.STORAGE_BUCKET,
//   Key: `webiliti/test.text`,
//   Body: "params.content",
//   ACL: "public-read", // Has to be set as the default setting is "private"
//   ContentType: "multipart/form-data",
// };

export const createS3GetUrl = async (c: Context, fileName: string, expiry: number = 3600) => {
  const command = new GetObjectCommand({
    Bucket: c.env.STORAGE_BUCKET,
    Key: `docs/${fileName}`,
  });
  const s3 = await getClient(c);
  return await getSignedUrl(s3, command, { expiresIn: expiry });
};

export const createS3PutUrl = async (c: Context, fileName: string, expiry: number = 3600) => {
  const command = new PutObjectCommand({
    Bucket: c.env.STORAGE_BUCKET,
    Key: `docs/${fileName}`,
    ACL: "public-read",
    ContentType: "multipart/form-data",
  });
  const s3 = await getClient(c);
  return await getSignedUrl(s3, command, { expiresIn: expiry });
};

export const deleteFile = async (c: Context, fileName: string) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: c.env.STORAGE_BUCKET, // required
      Key: `docs/${fileName}`, // required
    });
    const s3 = await getClient(c);
    await s3.send(command);
    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false, error };
  }
};
