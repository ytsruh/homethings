const ALLOWED_TYPES = new Set([
	// Images
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/webp",
	// Documents
	"application/pdf",
	"application/vnd.ms-excel",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	"application/vnd.ms-powerpoint",
	"application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function validateFileType(type: string): boolean {
	return ALLOWED_TYPES.has(type);
}

export function validateFileSize(size: number): boolean {
	return size <= MAX_FILE_SIZE;
}

export function generateFileKey(userId: string, originalName: string): string {
	const ext = originalName.split(".").pop() || "";
	const timestamp = Date.now();
	const uuid = crypto.randomUUID();
	return `uploads/${userId}/${timestamp}-${uuid}.${ext}`;
}
