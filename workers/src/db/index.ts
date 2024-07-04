import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client/web";

export const createDBClient = (url: string, authToken: string) => {
  const client = createClient({
    url: url,
    authToken: authToken,
  });

  return drizzle(client);
};
