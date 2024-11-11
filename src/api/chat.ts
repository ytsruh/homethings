import { Hono } from "hono";
import { OpenAI } from "openai";
import { streamText } from "hono/streaming";
import type { GlobalVariables } from "./";
import { createClient } from "@libsql/client";
import * as envs from "$env/static/private";

type ChatMessage = {
  role: "system" | "user";
  content: string;
};

export const turso = createClient({
  url: envs.DATABASE_URL!,
  authToken: envs.DATABASE_AUTH_TOKEN!,
});

const app = new Hono<{ Variables: GlobalVariables }>();

app.post("/", async (c) => {
  try {
    const body = await c.req.json<{ messages: ChatMessage[] }>();

    const openai = new OpenAI({
      apiKey: envs.OPENAI_API_KEY,
    });

    const chatStream = await openai.chat.completions.create({
      messages: body.messages,
      model: "gpt-4",
      stream: true,
    });

    return streamText(c, async (stream) => {
      for await (const message of chatStream) {
        await stream.write(message.choices[0]?.delta.content ?? "");
      }
    });
  } catch (error) {
    // For errors, log to console and send a 500 response back
    console.log(error);
    return c.json({ error: "Something went wrong" }, { status: 500 });
  }
});

app.post("/svelte", async (c) => {
  try {
    const body = await c.req.json<{ messages: ChatMessage[] }>();

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
              text: "You are a helpful assistant that answers programming questions in the style of a southern belle from the southeast United States.",
            },
            {
              type: "text",
              text: "Svelte & SvelteKit are JavaScript libraries that you are an expert in. You will not answer questions that are not related to Svelte, SvelteKit, JavaScript or Typescript. If you are asked a question oustide of this then you should simply apologise and confirm you unable to answer. If you are not 100% sure of your answer then you will also apologise and confirm you are unable to answer.",
            },
            {
              type: "text",
              text: ragString || "",
            },
          ],
        },
        ...body.messages,
      ],
      model: "gpt-4",
      stream: true,
    });

    return streamText(c, async (stream) => {
      for await (const message of chatStream) {
        await stream.write(message.choices[0]?.delta.content ?? "");
      }
    });
  } catch (error) {
    // For errors, log to console and send a 500 response back
    console.log(error);
    return c.json({ error: "Something went wrong" }, { status: 500 });
  }
});

export default app;
