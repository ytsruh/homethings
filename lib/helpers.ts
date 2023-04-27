import { PrismaClient } from "@prisma/client";
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

export const checkAuth = async (req: NextApiRequest) => {
  try {
    const token = await getToken({ req });
    if (token) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    return false;
  }
};

export const decode = async (req: NextApiRequest) => {
  const token = await getToken({ req });
  return token?.sub;
};

export const decodeToken = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!process.env.NEXTAUTH_SECRET) {
    throw new Error("JWT_KEY must be defined");
  }
  try {
    if (!req.headers.token) {
      throw new Error("Unauthorised: Token not found");
    }
    const decoded = await jsonwebtoken.verify(req.headers.token?.toString(), process.env.NEXTAUTH_SECRET);
    return decoded;
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: "unauthorised" });
  }
};

export const filterUserData = async (data: any) => {
  return {
    name: data.name,
    email: data.email,
    darkMode: data.darkMode,
    icon: data.icon,
  };
};

export const filterOutPassword = (array: any) => {
  const filtered = array.map((data: any) => {
    return {
      _id: data._id,
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
