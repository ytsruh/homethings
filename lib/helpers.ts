import { PrismaClient, User } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import type { NextApiRequest, NextApiResponse } from "next";
import jsonwebtoken from "jsonwebtoken";

// Fix for having too many DB connections in development.
// https://github.com/prisma/prisma/issues/5007#issuecomment-618433162
// https://github.com/prisma/prisma/issues/5103
// https://www.prisma.io/docs/guides/database/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
export let db: PrismaClient;

if (process.env.NODE_ENV === "production") {
  db = new PrismaClient();
} else {
  let globalWithPrisma = global as typeof globalThis & {
    prisma: PrismaClient;
  };
  if (!globalWithPrisma.prisma) {
    globalWithPrisma.prisma = new PrismaClient();
  }
  db = globalWithPrisma.prisma;
}

export const combinedDecodeToken = async (req: NextApiRequest) => {
  // Check if Secret is set in ENV variables
  if (!process.env.NEXTAUTH_SECRET) {
    throw new Error("JWT_KEY must be defined");
  }
  try {
    // First try to get token in cookie from Next Auth
    const token = await getToken({ req });
    if (token) {
      // If token is found then return the user id
      return token.sub;
    } else {
      // If token is not found then check if a token from custom auth can be found in the headers
      if (!req.headers.token) {
        throw new Error("Unauthorised: Token not found");
      }
      // If token is found then verify it using custom auth
      const decoded: any = await jsonwebtoken.verify(
        req.headers.token?.toString(),
        process.env.NEXTAUTH_SECRET
      );
      if (decoded) {
        // If token is verified then return it
        return decoded.data.id;
      } else {
        // If logic gets to this stage we must assume that the token is invalid so throw error
        throw new Error("Unauthorised: Token not found");
      }
    }
  } catch (error) {
    console.log(error);
    // Token cannot be found or validated to return unauthorised
    return false;
  }
};

export const filterUserData = async (data: User) => {
  return {
    name: data.name,
    email: data.email,
    darkMode: data.darkMode,
    icon: data.icon,
  };
};

export const filterOutPassword = (array: Array<User>) => {
  const filtered = array.map((data: User) => {
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      darkMode: data.darkMode,
      icon: data.icon,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  });
  return filtered;
};
