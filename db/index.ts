import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

const libsqlClient = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(libsqlClient);
