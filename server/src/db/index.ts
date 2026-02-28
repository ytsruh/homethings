import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const turso = createClient({
	url: "file:local.db",
	syncUrl: process.env.TURSO_DATABASE_URL,
	authToken: process.env.TURSO_AUTH_TOKEN,
	syncInterval: 60,
});

export const database = drizzle(turso, { schema });
