const EXPIRES_IN = 60 * 60;

export async function generatePresignedUrl(
	bucketName: string,
	fileKey: string,
	contentType: string,
): Promise<string> {
	const accountId = process.env.CF_ACCOUNT_ID;
	const accessKeyId = process.env.R2_ACCESS_KEY_ID;
	const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

	if (!accountId || !accessKeyId || !secretAccessKey) {
		throw new Error("Missing R2 credentials");
	}

	const timestamp = Math.floor(Date.now() / 1000);
	const amzDate = new Date(timestamp * 1000).toISOString().replace(/[-:]/g, "");
	const credentialScope = `${timestamp}/auto/r2/aws4_request`;

	const region = "auto";

	const canonicalRequest = `GET\n/${bucketName}/${fileKey}\n\nhost:${bucketName}.${accountId}.r2.cloudflarestorage.com\nx-amz-content-sha256:UNSIGNED-PAYLOAD\nx-amz-date:${amzDate}\n\nhost;x-amz-content-sha256;x-amz-date\nUNSIGNED-PAYLOAD`;

	const canonicalRequestHash = await hashHex(canonicalRequest);
	const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${canonicalRequestHash}`;

	const signingKey = await getSigningKey(secretAccessKey, timestamp, region);
	const signature = await hmacSha256Hex(signingKey, stringToSign);

	const params = new URLSearchParams({
		"X-Amz-Algorithm": "AWS4-HMAC-SHA256",
		"X-Amz-Credential": `${accessKeyId}/${credentialScope}`,
		"X-Amz-Date": amzDate,
		"X-Amz-Expires": EXPIRES_IN.toString(),
		"X-Amz-SignedHeaders": "host;x-amz-content-sha256;x-amz-date",
		"X-Amz-Signature": signature,
		"response-content-disposition": "attachment",
		"response-content-type": contentType,
	});

	return `https://${bucketName}.${accountId}.r2.cloudflarestorage.com/${fileKey}?${params.toString()}`;
}

async function hashHex(data: string): Promise<string> {
	const buffer = await crypto.subtle.digest(
		"SHA-256",
		new TextEncoder().encode(data),
	);
	return Array.from(new Uint8Array(buffer))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

async function getSigningKey(
	key: string,
	timestamp: number,
	region: string,
): Promise<CryptoKey> {
	const kDate = await hmacSha256(`AWS4${key}`, timestamp.toString());
	const kRegion = await hmacSha256(kDate, region);
	const kService = await hmacSha256(kRegion, "r2");
	return await hmacSha256(kService, "aws4_request");
}

async function hmacSha256(
	key: string | CryptoKey,
	message: string,
): Promise<CryptoKey> {
	const msgBuffer = new TextEncoder().encode(message);
	const keyBuffer =
		typeof key === "string" ? new TextEncoder().encode(key) : key;

	const importedKey = await crypto.subtle.importKey(
		"raw",
		keyBuffer,
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);

	const signature = await crypto.subtle.sign("HMAC", importedKey, msgBuffer);

	return await crypto.subtle.importKey(
		"raw",
		signature,
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
}

async function hmacSha256Hex(key: CryptoKey, message: string): Promise<string> {
	const msgBuffer = new TextEncoder().encode(message);
	const signature = await crypto.subtle.sign("HMAC", key, msgBuffer);
	return Array.from(new Uint8Array(signature))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}
