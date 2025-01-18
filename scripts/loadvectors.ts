import "dotenv/config";
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { createClient } from "@libsql/client";

export const turso = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN!,
});

const openai = new OpenAI();

const getAllFiles = (
  dirPath: string,
  arrayOfFiles: string[] = [],
): string[] => {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else if (file.endsWith(".md")) {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
};

const generateSimpleChunks = (input: string): string[] => {
  // Split the input string into chunks based on periods
  const chunks = input
    .trim()
    .split(".")
    .filter((i) => i !== "");

  // remove carriage returns from the end of each chunk
  chunks.forEach((chunk, index) => {
    chunks[index] = chunk.replace(/\n/g, "");
  });

  return chunks;
};

const chunkMarkdownToSentences = (markdown: string): string[] => {
  // Remove markdown headers (# Title, ## Title, etc)
  const withoutHeaders = markdown.replace(/^#{1,6}.*$/gm, "");

  // Remove markdown links - both [text](url) and <url> formats
  const withoutLinks = withoutHeaders
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // Remove [text](url)
    .replace(/<[^>]*>/g, ""); // Remove <url>

  // Remove other common markdown syntax
  const plainText = withoutLinks
    .replace(/[#*`_~]/g, "") // Remove basic markdown formatting
    .replace(/\n+/g, " ") // Replace newlines with spaces
    .replace(/\s+/g, " ") // Normalize spaces
    .trim();

  // Split into sentences - handles common sentence endings (., !, ?)
  // while avoiding splitting on decimals, abbreviations, etc.
  const sentences =
    plainText.match(/[^.!?]+[.!?]+/g)?.map((sentence) => sentence.trim()) ?? [];

  // Filter out sentences that are too short
  return sentences.filter((sentence) => sentence.length > 50);
};

async function loadVectors() {
  const type = "kit";
  const markdownFiles = getAllFiles(`./scripts/tmp/${type}/`);
  // const maxCount = 1;
  // let count = 0;
  for (const file of markdownFiles) {
    console.log(file);
    // if (count >= maxCount) {
    //   console.log("Reached max count, breaking");
    //   break;
    // }
    // read the file into memory
    const contents = fs.readFileSync(file, "utf-8");
    const chunks = chunkMarkdownToSentences(contents);
    // loop over each chunk
    for (const chunk of chunks) {
      // Get embedding for each chunk
      const embedding = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: chunk,
        encoding_format: "float",
      });
      // Insert into database
      await turso.execute({
        sql: `INSERT INTO svelte (type, text, full_emb) VALUES (?, ?, ?)`,
        args: [
          type,
          chunk,
          new Float32Array(embedding.data[0].embedding).buffer as ArrayBuffer,
        ],
      });
    }
    // Increase file count
    //count++;
  }
}

//await turso.execute(`DROP TABLE IF EXISTS svelte`);
await turso.execute(`CREATE TABLE IF NOT EXISTS svelte (
    type    TEXT,
    text    TEXT,
    full_emb F32_BLOB(1536)
  )
`);
await turso.execute(`CREATE INDEX IF NOT EXISTS embeddings_index
    ON svelte (
        libsql_vector_idx(full_emb)
    );`);

await loadVectors();
