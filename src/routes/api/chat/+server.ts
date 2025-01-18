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
      apiKey: envs.OPENAI_API_KEY,
    });

    const chatStream = await openai.chat.completions.create({
      messages: body.messages,
      model: "gpt-4",
      stream: true,
    });

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of chatStream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(content);
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (err: unknown) {
    // For errors, log to console and send a 500 response back
    console.log(err);
    error(400, "something went wrong");
  }
};
