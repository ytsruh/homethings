import { getToken } from "next-auth/jwt";
import { User } from "@/db/schema";
import { NextRequest } from "next/server";

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
