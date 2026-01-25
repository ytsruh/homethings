import { generatePresignedUrl } from "./presigned";
import {
	generateFileKey,
	validateFileSize,
	validateFileType,
} from "./validation";

export interface UploadedFile {
	fileKey: string;
	fileName: string;
	fileType: string;
	fileSize: number;
}

export async function uploadFile(
	file: File,
	userId: string,
): Promise<UploadedFile> {
	if (!validateFileType(file.type)) {
		throw new Error("INVALID_FILE_TYPE");
	}

	if (!validateFileSize(file.size)) {
		throw new Error("FILE_TOO_LARGE");
	}

	const accountId = process.env.CF_ACCOUNT_ID;
	const accessKeyId = process.env.R2_ACCESS_KEY_ID;
	const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
	const bucketName = process.env.R2_BUCKET_NAME;

	if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
		throw new Error("MISSING_R2_CREDENTIALS");
	}

	const fileKey = generateFileKey(userId, file.name);
	const arrayBuffer = await file.arrayBuffer();

	const url = `https://${bucketName}.${accountId}.r2.cloudflarestorage.com/${fileKey}`;
	const response = await fetch(url, {
		method: "PUT",
		body: arrayBuffer,
		headers: {
			"Content-Type": file.type,
			"Content-Length": file.size.toString(),
		},
		s3: {
			accessKeyId,
			secretAccessKey,
			region: "auto",
		},
	});

	if (!response.ok) {
		throw new Error("UPLOAD_FAILED");
	}

	return {
		fileKey,
		fileName: file.name,
		fileType: file.type,
		fileSize: file.size,
	};
}

export function deleteFile(fileKey: string): Promise<Response> {
	const accountId = process.env.CF_ACCOUNT_ID;
	const accessKeyId = process.env.R2_ACCESS_KEY_ID;
	const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
	const bucketName = process.env.R2_BUCKET_NAME;

	if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
		throw new Error("MISSING_R2_CREDENTIALS");
	}

	const url = `https://${bucketName}.${accountId}.r2.cloudflarestorage.com/${fileKey}`;

	return fetch(url, {
		method: "DELETE",
		s3: {
			accessKeyId,
			secretAccessKey,
			region: "auto",
		},
	});
}

export async function deleteFiles(fileKeys: string[]): Promise<void> {
	await Promise.all(fileKeys.map((key) => deleteFile(key)));
}

export { generatePresignedUrl };
