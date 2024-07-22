/*
  Server Side
*/

export type GlobalBindings = {
  AUTH_SECRET: string;
  TURSO_DATABASE_URL: string;
  TURSO_AUTH_TOKEN: string;
  OPENAI_API_KEY: string;
};

export type GlobalVariables = {
  user: string;
};

export type UserToken = {
  id: string;
  name: string;
  accountId: string;
  exp: number;
  iat: number;
};

/*
  Client Side
*/

export type AppPreferences = {
  showDocuments: boolean;
  showBooks: boolean;
  profileImage: string | undefined;
  name: string | null;
  email: string | null;
};
