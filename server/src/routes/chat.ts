import { Hono } from "hono";
import { z } from "zod";
import { ai, type ChatOptions } from "~/ai";
import { aiConfig, allModels, isModelAvailable } from "~/ai/config";
import type { JWTPayload } from "~/middleware/jwt";

const chatSchema = z.object({
	message: z.string().min(1).max(10000),
	model: z.string().optional(),
});

const tokensSchema = z.object({
	text: z.string().min(1),
});

export const chat = new Hono<{ Variables: { user: JWTPayload } }>();

chat.post("/chat", async (c) => {
	const _user = c.get("user");
	const body = await c.req.json();

	const parsed = chatSchema.parse(body);

	if (parsed.model && !isModelAvailable(parsed.model)) {
		return c.json({
			error: `Model '${parsed.model}' is not available`,
			code: "INVALID_MODEL",
			availableModels: allModels,
		});
	}

	const options: ChatOptions = {
		model: parsed.model || aiConfig.defaultModel,
		temperature: aiConfig.temperature,
		maxTokens: aiConfig.maxTokens,
	};

	const response = await ai.chat(
		[{ role: "user", content: parsed.message }],
		options,
	);

	return c.json({ response });
});

chat.post("/chat/stream", async (c) => {
	const _user = c.get("user");
	const body = await c.req.json();

	const parsed = chatSchema.parse(body);

	if (parsed.model && !isModelAvailable(parsed.model)) {
		return c.json({
			error: `Model '${parsed.model}' is not available`,
			code: "INVALID_MODEL",
			availableModels: allModels,
		});
	}

	const options: ChatOptions = {
		model: parsed.model || aiConfig.defaultModel,
		temperature: aiConfig.temperature,
		maxTokens: aiConfig.maxTokens,
	};

	const stream = ai.chatStream(
		[{ role: "user", content: parsed.message }],
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

chat.post("/chat/tokens", async (c) => {
	const body = await c.req.json();
	const parsed = tokensSchema.parse(body);

	const count = await ai.countTokens(parsed.text);
	return c.json({ count });
});
