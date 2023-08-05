// @ts-nocheck
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import * as helpers from "@/lib/helpers";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60,
      },
      async authorize(credentials) {
        try {
          // Look up a unique admin in the database based on the email field sumitted in the body
          const user = await helpers.db.user.findUnique({
            where: {
              email: credentials.email,
            },
          });
          // Compare the password with the encrypted one
          const match = await bcrypt.compare(credentials.password, user.password);
          // If no error and we have user data, return it
          if (match) {
            return user;
          }
          // Return null if user data could not be retrieved
          return false;
        } catch (error) {
          return false;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async session({ session, user, token }) {
      session.user.accountId = token.accountId;
      return session;
    },
    async jwt({ token, user, account, profile, isNewUser }) {
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

export default NextAuth(authOptions);
