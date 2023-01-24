// @ts-nocheck
const jwt = require("jsonwebtoken");
import { PrismaClient } from "@prisma/client";

// Fix for having too many DB connections in development.
// https://github.com/prisma/prisma/issues/5007#issuecomment-618433162
// https://github.com/prisma/prisma/issues/5103
// https://www.prisma.io/docs/guides/database/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
export let db: PrismaClient;
if (process.env.NODE_ENV === "production") {
  db = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  db = global.prisma;
}

export const checkAuth = async (req) => {
  try {
    const token = req.headers.token;
    if (!token) {
      return false;
    }
    //Check token is a valid user
    const decoded = jwt.verify(token, process.env.NEXT_PUBLIC_JWTSECRET);
    if (decoded) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.log(err);
    return false;
  }
};

export const decode = async (token) => {
  const decoded = jwt.verify(token, process.env.NEXT_PUBLIC_JWTSECRET);
  return decoded.data.id;
};

export const filterUserData = async (data) => {
  return {
    name: data.name,
    email: data.email,
    darkMode: data.darkMode,
    icon: data.icon,
  };
};

export const filterOutPassword = (array) => {
  const filtered = array.map((data) => {
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
