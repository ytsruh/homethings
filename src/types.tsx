export type GlobalBindings = {
  VITE_AUTH_SECRET: string;
};

export type GlobalVariables = {
  user: string;
};

export type UserToken = {
  id: string;
  name: string;
  exp: number;
  iat: number;
};
