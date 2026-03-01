import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { timeout } from "hono/timeout";
import { z } from "zod";
import { ai } from "~/lib/ai";
import { AIError } from "~/lib/ai/errors";
import {
	defaultImageModel,
	imageModels,
	isImageModel,
} from "~/lib/ai/image-models";
import { throwBadRequest } from "~/middleware/http-exception";
import type { JWTPayload } from "~/middleware/jwt";
import { createValidator } from "~/middleware/validator";

const ASPECT_RATIOS = ["1:1", "3:2", "3:4", "16:9", "9:16"] as const;

const generateImageSchema = z.object({
	prompt: z.string().min(1).max(10000),
	model: z.string().optional(),
	aspectRatio: z.enum(ASPECT_RATIOS).optional(),
});

export const images = new Hono<{ Variables: { user: JWTPayload } }>();

images.use("*", timeout(60000));

images.post("/images/generate", createValidator(generateImageSchema), async (c) => {
	const _user = c.get("user");
	const body = c.req.valid("json");

	if (!process.env.OPENROUTER_API_KEY) {
		throw new HTTPException(503, { message: "AI service not configured" });
	}

	if (body.model && !isImageModel(body.model)) {
		throwBadRequest(`Model '${body.model}' is not an image generation model`, {
			code: "INVALID_MODEL",
			availableModels: imageModels,
		});
	}

	try {
		const result = await ai.generateImage(body.prompt, {
			model: body.model || defaultImageModel,
			aspectRatio: body.aspectRatio,
		});
		return c.json(result);
	} catch (error) {
		console.error("Image generation error:", error);
		if (error instanceof AIError) {
			throw new HTTPException(error.statusCode as any, {
				message: error.message,
				cause: { code: error.code },
			});
		}
		if (error instanceof Error) {
			throw new HTTPException(500, { message: error.message });
		}
		throw error;
	}
});

images.get("/images/models", (c) => {
	return c.json({
		models: imageModels,
		default: defaultImageModel,
	});
});
