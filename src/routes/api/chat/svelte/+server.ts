import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { OpenAI } from "openai";
import * as envs from "$env/static/private";
import type { RequestEvent } from "@sveltejs/kit";
import { turso } from "@/lib/server/storage";

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

    const queryEmbedding = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: body.messages[0].content,
      encoding_format: "float",
    });

    const ragResults = await turso.execute(`SELECT * FROM
          vector_top_k('embeddings_index', vector32('[${queryEmbedding.data[0].embedding}]'), 10)
          JOIN svelte ON svelte.rowid = id`);

    const ragString = ragResults.rows.map((msg) => msg.text).join(". ");

    const chatStream = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: [
            {
              type: "text",
              text: "You are a helpful assistant that answers programming questions on Svelte & SvelteKit which are JavaScript libraries. You will not answer questions that are not related to Svelte, SvelteKit, JavaScript or Typescript. If you are asked a question oustide of this then you should simply apologise and confirm you unable to answer. If you are not 100% sure of your answer then you will also apologise and confirm you are unable to answer.",
            },
            {
              type: "text",
              text:
                "The following is a list of relvant information from the Svelte & SvelteKit docs that you can use to help answer the question: " +
                  ragString || "",
            },
          ],
        },
        ...body.messages,
      ],
      model: "gpt-4",
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
  } catch (err) {
    // For errors, log to console and send a 500 response back
    console.log(err);
    error(400, "something went wrong");
  }
};
