import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client/web";
import * as schema from "./schema";

export const createDBClient = (url: string, token: string) => {
  const client = createClient({
    url: url,
    authToken: token,
  });
  return drizzle(client, { schema });
};
