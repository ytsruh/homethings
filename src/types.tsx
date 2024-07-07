export type GlobalBindings = {
  AUTH_SECRET: string;
  TURSO_DATABASE_URL: string;
  TURSO_AUTH_TOKEN: string;
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
