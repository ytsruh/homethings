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
  showChat: boolean;
  showNotes: boolean;
  showWealth: boolean;
};

export type ProfileData = {
  name: string;
  email: string;
  showDocuments: boolean;
  showBooks: boolean;
  showNotes: boolean;
  showChat: boolean;
  showWealth: boolean;
  profileImage: string | null;
};

export type Document = {
  id: string;
  title: string;
  description: string;
  accountId: string;
  fileName: string;
  createdAt: number;
  updatedAt: number;
};

export type Book = {
  id: string;
  name: string;
  isbn: string;
  author: string;
  genre: string;
  rating: number;
  image: string;
  read: boolean;
  wishlist: boolean;
  userId: string;
  createdAt: number;
  updatedAt: number;
};
