import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client/web";

const client = createClient({
  url: import.meta.env.VITE_TURSO_DATABASE_URL!,
  authToken: import.meta.env.VITE_TURSO_AUTH_TOKEN!,
});

export const db = drizzle(client);
