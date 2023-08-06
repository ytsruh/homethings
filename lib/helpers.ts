import { getToken } from "next-auth/jwt";
import { User } from "@/db/schema";
import type { NextApiRequest } from "next";
import jsonwebtoken from "jsonwebtoken";

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
      return { id: token.sub, accountId: token.accountId };
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
      console.log(decoded);
      if (decoded) {
        console.log(decoded);

        // If token is verified then return it
        return { id: decoded.data.id, accountId: decoded.data.accountId };
      }
      // If logic gets to this stage we must assume that the token is invalid so throw error
      throw new Error("Unauthorised: Token not found");
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
