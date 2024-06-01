import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { User } from "@/db/schema";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function setLocalUser(data: User) {
  await localStorage.setItem("user", JSON.stringify(data));
}

export async function getLocalUser() {
  const data = await localStorage.getItem("user");
  if (data) {
    const formatted: User = JSON.parse(data);
    return formatted;
  }
  return {};
}

export async function removeLocalUser() {
  await localStorage.removeItem("user");
}

export const decodeToken = async (req: NextRequest) => {
  const token = await getToken({ req });
  if (!token) {
    return null;
  }
  return {
    id: token.sub,
    name: token.name,
    email: token.email,
    accountId: token.accountId,
  };
};

export const filterUserData = async (data: User) => {
  return {
    name: data.name,
    email: data.email,
    profileImage: data.profileImage,
    showDocuments: data.showDocuments,
    showBooks: data.showBooks,
  };
};

export const filterOutPassword = (array: Array<User>) => {
  const filtered = array.map((data: User) => {
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      accountId: data.accountId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  });
  return filtered;
};
