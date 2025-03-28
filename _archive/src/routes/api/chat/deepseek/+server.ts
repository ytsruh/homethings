import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { OpenAI } from "openai";
import * as envs from "$env/static/private";
import type { RequestEvent } from "@sveltejs/kit";

type ChatMessage = {
  role: "system" | "user";
  content: string;
};

export const POST: RequestHandler = async (event: RequestEvent) => {
  if (!event.locals.user) {
    return error(401, "Unauthorized");
  }
  try {
    const body = (await event.request.json()) as { messages: ChatMessage[] };

    const openai = new OpenAI({
      apiKey: envs.CLOUDFLARE_API_KEY,
      baseURL: `https://api.cloudflare.com/client/v4/accounts/${envs.CLOUDFLARE_ACCOUNT_ID}/ai/v1`,
    });

    const chatStream = await openai.chat.completions.create({
      messages: body.messages,
      model: "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b",
      stream: true,
    });

    const { readable, writable } = new TransformStream();

    const writer = writable.getWriter();
    const encoder = new TextEncoder();
    const response = new Response(readable);

    (async () => {
      try {
        for await (const chunk of chatStream as any) {
          writer.write(encoder.encode(chunk.choices[0]?.delta?.content));
        }
        writer.close();
      } catch (e) {
        return new Response("Error while reading stream", { status: 500 });
      }
    })();

    return response;
  } catch (err: unknown) {
    // For errors, log to console and send a 500 response back
    console.log(err);
    error(400, "something went wrong");
  }
};
