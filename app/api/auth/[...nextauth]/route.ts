// @ts-nocheck
import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db, users } from "@/db/schema";
import type { User } from "@/db/schema";
import { eq } from "drizzle-orm";

const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60,
      },
      async authorize(credentials: any) {
        try {
          // Look up a user in the database based on the email field sumitted in the body
          const data: User[] = await db.select().from(users).where(eq(users.email, credentials.email));
          const foundUser = data[0];
          // Compare the password with the encrypted one
          const match = await bcrypt.compare(credentials.password, foundUser.password);
          // If no error and we have user data, return it
          if (match) {
            return foundUser;
          }
          // Return false if user data could not be retrieved
          return false;
        } catch (error) {
          console.log(error);
          return false;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }: any) {
      return true;
    },
    async redirect({ url, baseUrl }: any) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async session({ session, user, token }: any) {
      session.user.accountId = token.accountId;
      return session;
    },
    async jwt({ token, user, account, profile, isNewUser }: any) {
      if (user) {
        token.accountId = user.accountId;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
    error: "/500",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
