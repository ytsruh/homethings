import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { timeout } from "hono/timeout";
import { database } from "~/db";
import { files } from "~/db/schema";
import {
	FilePathSchema,
	FileResponseSchema,
	FilesListResponseSchema,
	FileUploadRequestSchema,
	FileUploadResponseSchema,
} from "~/lib/schemas";
import {
	createPresignedUrl,
	deleteFile,
	getPresignedDownloadUrl,
} from "~/lib/storage";
import { throwNotFound, throwServerError } from "~/middleware/http-exception";
import type { JWTPayload } from "~/middleware/jwt";
import { createValidator } from "~/middleware/validator";

const filesRoutes = new Hono<{ Variables: { user: JWTPayload } }>();

filesRoutes.use("*", timeout(10000));

filesRoutes.get("/files", async (c) => {
	const user = c.get("user");

	const userFiles = await database.query.files.findMany({
		where: eq(files.userId, user.userId),
	});

	const filesWithUrls = userFiles.map((file) => ({
		...file,
		presignedUrl: undefined,
	}));

	return c.json(FilesListResponseSchema.parse(filesWithUrls));
});

filesRoutes.post(
	"/files/upload",
	createValidator(FileUploadRequestSchema),
	async (c) => {
		const user = c.get("user");
		const body = c.req.valid("json");

		const fileId = crypto.randomUUID();
		const fileKey = `${user.userId}/${fileId}-${body.fileName}`;

		const presignedUrl = createPresignedUrl(fileKey);

		const now = new Date();
		await database.insert(files).values({
			id: fileId,
			userId: user.userId,
			fileKey: fileKey,
			fileName: body.fileName,
			fileType: body.fileType,
			fileSize: body.fileSize,
			createdAt: now,
		});

		const createdFile = await database
			.select()
			.from(files)
			.where(eq(files.id, fileId))
			.limit(1);

		if (!createdFile[0]) {
			throwServerError();
			return;
		}

		return c.json(
			FileUploadResponseSchema.parse({
				...createdFile[0],
				presignedUrl,
			}),
		);
	},
);

filesRoutes.get(
	"/files/:id",
	zValidator("param", FilePathSchema),
	async (c) => {
		const user = c.get("user");
		const params = c.req.valid("param");

		const file = await database.query.files.findFirst({
			where: and(eq(files.id, params.id), eq(files.userId, user.userId)),
		});

		if (!file) {
			throwNotFound("File not found");
			return;
		}

		const presignedUrl = getPresignedDownloadUrl(file.fileKey);

		return c.json(
			FileResponseSchema.parse({
				...file,
				presignedUrl,
			}),
		);
	},
);

filesRoutes.delete(
	"/files/:id",
	zValidator("param", FilePathSchema),
	async (c) => {
		const user = c.get("user");
		const params = c.req.valid("param");

		const file = await database.query.files.findFirst({
			where: and(eq(files.id, params.id), eq(files.userId, user.userId)),
		});

		if (!file) {
			throwNotFound("File not found");
			return;
		}

		await deleteFile(file.fileKey);
		await database.delete(files).where(eq(files.id, params.id));

		return c.json({ message: "File deleted successfully" });
	},
);

export { filesRoutes };
