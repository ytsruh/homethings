import { S3Client } from "bun";

let s3Client: S3Client | null = null;

export function getS3Client(): S3Client {
	if (!s3Client) {
		s3Client = new S3Client({
			accessKeyId: process.env.STORAGE_KEY,
			secretAccessKey: process.env.STORAGE_SECRET,
			bucket: process.env.STORAGE_BUCKET,
			endpoint: process.env.STORAGE_ENDPOINT,
			region: "auto",
		});
	}
	return s3Client;
}

export const createPresignedUrl = (key: string) => {
	const client = getS3Client();
	return client.presign(key, {
		expiresIn: 3600, // 1 hour
		method: "PUT",
		type: "application/octet-stream",
	});
};

export const getPresignedDownloadUrl = (key: string) => {
	const client = getS3Client();
	return client.presign(key, {
		expiresIn: 3600, // 1 hour
		method: "GET",
	});
};

interface S3Object {
	key: string;
	lastModified?: string;
	size?: number;
	etag?: string;
}

export async function listObjectsWithPrefix(
	prefix: string,
): Promise<S3Object[]> {
	const client = getS3Client();
	const objects: S3Object[] = [];
	try {
		const uploads = await client.list({
			prefix: prefix,
			maxKeys: 500,
			fetchOwner: true,
		});

		if (uploads.contents) {
			uploads.contents.forEach((item) => {
				if (item.key) {
					objects.push({
						key: item.key,
						lastModified: item.lastModified,
						size: item.size,
						etag: item.eTag,
					});
				}
			});
		}

		return objects;
	} catch (error) {
		console.error("Error listing S3 objects:", error);
		throw error;
	}
}

export async function storeImg(key: string, data: Buffer) {
	const client = getS3Client();
	try {
		await client.write(key, data, {
			type: "image/png",
		});
	} catch (error) {
		console.error("Error storing image:", error);
		throw error;
	}
}

export async function storeJSON(key: string, data: Buffer) {
	const client = getS3Client();
	try {
		await client.write(key, data, {
			type: "application/json",
		});
	} catch (error) {
		console.error("Error storing image:", error);
		throw error;
	}
}

export async function deleteImg(key: string) {
	const client = getS3Client();
	try {
		await client.delete(key);
	} catch (error) {
		console.error("Error deleting image:", error);
		throw error;
	}
}

export const deleteFile = deleteImg;
