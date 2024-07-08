import { Hono } from "hono";
import type { GlobalVariables, GlobalBindings } from "../types";
import { OpenAI } from "openai";
import { streamText } from "hono/streaming";

type ChatMessage = {
  role: "system" | "user";
  content: string;
};

const app = new Hono<{ Bindings: GlobalBindings; Variables: GlobalVariables }>();

app.post("/", async (c) => {
  try {
    const body = await c.req.json<{ messages: ChatMessage[] }>();

    const openai = new OpenAI({
      apiKey: c.env.OPENAI_API_KEY,
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

export default app;
