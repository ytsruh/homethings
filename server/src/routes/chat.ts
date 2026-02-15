import { Hono } from "hono";
import { z } from "zod";
import { ai, type ChatOptions } from "~/lib/ai";
import { aiConfig, allModels, isModelAvailable } from "~/lib/ai/config";
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

chat.post("/chat", createValidator(chatSchema), async (c) => {
	const _user = c.get("user");
	const body = c.req.valid("json");

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

	const response = await ai.chat(
		[{ role: "user", content: body.message }],
		options,
	);

	return c.json({ response });
});

chat.post("/chat/stream", createValidator(chatSchema), async (c) => {
	const _user = c.get("user");
	const body = c.req.valid("json");

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
				controller.close();
			} catch (error) {
				controller.error(error);
			}
		},
	});

	c.header("Content-Type", "text/plain; charset=utf-8");
	c.header("Cache-Control", "no-cache");
	c.header("Connection", "keep-alive");

	return c.body(readable);
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
