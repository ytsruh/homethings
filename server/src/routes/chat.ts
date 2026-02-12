import { Elysia } from "elysia";
import { z } from "zod";
import { ai, type ChatOptions } from "~/ai";
import { aiConfig, allModels, isModelAvailable } from "~/ai/config";
import { betterAuth } from "~/middleware/auth";

const chatSchema = z.object({
	message: z.string().min(1).max(10000),
	model: z.string().optional(),
});

const tokensSchema = z.object({
	text: z.string().min(1),
});

export const chat = new Elysia({ name: "chat", prefix: "/chat" })
	.use(betterAuth)
	.post(
		"/",
		async ({ body, user }) => {
			if (body.model && !isModelAvailable(body.model)) {
				return {
					error: `Model '${body.model}' is not available`,
					code: "INVALID_MODEL",
					availableModels: allModels,
				};
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

			return { response };
		},
		{
			body: chatSchema,
			auth: true,
			detail: {
				tags: ["Chat"],
				description: "Send a message to AI and get a response",
			},
		},
	)
	.post(
		"/stream",
		async ({ body, set, user }) => {
			if (body.model && !isModelAvailable(body.model)) {
				return {
					error: `Model '${body.model}' is not available`,
					code: "INVALID_MODEL",
					availableModels: allModels,
				};
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

			set.headers = {
				"Content-Type": "text/plain; charset=utf-8",
				"Cache-Control": "no-cache",
				Connection: "keep-alive",
			};

			return new Response(readable);
		},
		{
			body: chatSchema,
			auth: true,
			detail: {
				tags: ["Chat"],
				description: "Stream AI response to a message",
			},
		},
	)
	.get(
		"/models",
		() => {
			return {
				models: allModels,
				default: aiConfig.defaultModel,
			};
		},
		{
			auth: true,
			detail: {
				tags: ["Chat"],
				description: "List available AI models",
			},
		},
	)
	.post(
		"/tokens",
		async ({ body }) => {
			const count = await ai.countTokens(body.text);
			return { count };
		},
		{
			body: tokensSchema,
			auth: true,
			detail: {
				tags: ["Chat"],
				description: "Count tokens in text",
			},
		},
	);
