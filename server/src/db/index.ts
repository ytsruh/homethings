import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const isRemote =
	process.env.TURSO_DATABASE_URL?.startsWith("libsql") ||
	process.env.TURSO_DATABASE_URL?.startsWith("https");

const turso = createClient({
	url: "file:local.db",
	syncUrl: isRemote ? process.env.TURSO_DATABASE_URL : undefined,
	authToken: isRemote ? process.env.TURSO_AUTH_TOKEN : undefined,
	syncInterval: isRemote ? 60 : undefined,
});

export const database = drizzle(turso, { schema });
