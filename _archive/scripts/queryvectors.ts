import "dotenv/config";
import OpenAI from "openai";
import { createClient } from "@libsql/client";
import * as readline from "readline";

export const turso = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN!,
});

const openai = new OpenAI();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function getData(searchQuery: string) {
  if (!searchQuery) {
    console.error("Please provide a search query");
    process.exit(1);
  }

  const embedding = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: searchQuery,
    encoding_format: "float",
  });

  const data = await turso.execute(`SELECT * FROM
        vector_top_k('embeddings_index', vector32('[${embedding.data[0].embedding}]'), 10)
        JOIN svelte ON svelte.rowid = id`);
  console.log("Embedding rows: " + data.rows.length);
  //console.log(data.rows);
  const all = await turso.execute(`SELECT * FROM svelte`);
  console.log("Rows: " + all.rows.length);
}

rl.question("Enter your query: ", async (answer) => {
  if (!answer) {
    console.error("Please provide a search query");
    process.exit(1);
  }
  await getData(answer);
  rl.close();
});
