import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { timeout } from "hono/timeout";
import { z } from "zod";
import { ai, type ChatOptions } from "~/lib/ai";
import { aiConfig, allModels, isModelAvailable } from "~/lib/ai/config";
import { AIError } from "~/lib/ai/errors";
import { throwBadRequest } from "~/middleware/http-exception";
import type { JWTPayload } from "~/middleware/jwt";
import { createValidator } from "~/middleware/validator";

const chatSchema = z.object({
	message: z.string().min(1).max(10000),
	model: z.string().optional(),
});

const tokensSchema = z.object({
	text: z.string().min(1),
});

export const chat = new Hono<{ Variables: { user: JWTPayload } }>();

// Set longer timeout for chat routes
chat.use("*", timeout(60000));
chat.post("/chat", createValidator(chatSchema), async (c) => {
	const _user = c.get("user");
	const body = c.req.valid("json");

	if (!process.env.OPENROUTER_API_KEY) {
		throw new HTTPException(503, { message: "AI service not configured" });
	}

	if (body.model && !isModelAvailable(body.model)) {
		throwBadRequest(`Model '${body.model}' is not available`, {
			code: "INVALID_MODEL",
			availableModels: allModels,
		});
	}

	const options: ChatOptions = {
		model: body.model || aiConfig.defaultModel,
		temperature: aiConfig.temperature,
		maxTokens: aiConfig.maxTokens,
	};

	try {
		const response = await ai.chat(
			[{ role: "user", content: body.message }],
			options,
		);
		return c.json({ response });
	} catch (error) {
		console.error("Chat error:", error);
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

chat.post("/chat/stream", createValidator(chatSchema), async (c) => {
	const _user = c.get("user");
	const body = c.req.valid("json");

	if (!process.env.OPENROUTER_API_KEY) {
		throw new HTTPException(503, { message: "AI service not configured" });
	}

	if (body.model && !isModelAvailable(body.model)) {
		throwBadRequest(`Model '${body.model}' is not available`, {
			code: "INVALID_MODEL",
			availableModels: allModels,
		});
	}

	const options: ChatOptions = {
		model: body.model || aiConfig.defaultModel,
		temperature: aiConfig.temperature,
		maxTokens: aiConfig.maxTokens,
	};

	try {
		const stream = ai.chatStream(
			[{ role: "user", content: body.message }],
			options,
		);

		const readable = new ReadableStream({
			async start(controller) {
				try {
					for await (const chunk of stream) {
						controller.enqueue(new TextEncoder().encode(chunk));
					}
					if (controller.desiredSize !== null) {
						controller.close();
					}
				} catch (error) {
					console.error("Stream error:", error);
					const message =
						error instanceof AIError
							? error.message
							: error instanceof Error
								? error.message
								: "An error occurred";
					if (controller.desiredSize !== null) {
						controller.enqueue(new TextEncoder().encode(`Error: ${message}`));
						controller.close();
					}
				}
			},
		});

		c.header("Content-Type", "text/plain; charset=utf-8");
		c.header("Cache-Control", "no-cache");
		c.header("Connection", "keep-alive");

		return c.body(readable);
	} catch (error) {
		console.error("Stream handler error:", error);
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

chat.get("/chat/models", (c) => {
	return c.json({
		models: allModels,
		default: aiConfig.defaultModel,
	});
});

chat.post("/chat/tokens", createValidator(tokensSchema), async (c) => {
	const body = c.req.valid("json");
	const count = await ai.countTokens(body.text);
	return c.json({ count });
});
