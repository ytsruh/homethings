import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next";
import { combinedDecodeToken } from "@/lib/helpers";
import { db, book } from "@/db/schema";
import { getToken } from "next-auth/jwt";
import type { Book } from "@/db/schema";
import { eq, asc, and } from "drizzle-orm";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token: any = await combinedDecodeToken(req);
  if (!token) {
    res.status(401).json({ error: "Unauthorised" });
    return;
  }
  switch (req.method) {
    case "GET":
      try {
        const books: Book[] = await db
          .select()
          .from(book)
          .where(and(eq(book.userId, token.id), eq(book.wishlist, true)))
          .orderBy(asc(book.name));
        res.status(200).json({ count: books.length, data: books });
      } catch (error) {
        // For errors, log to console and send a 500 response back
        console.log(error);
        res.status(500).json({ error: "Something went wrong" });
      }
      break;

    default:
      await res.status(404).send("");
      break;
  }
}

export const getWishlist = async (ctx: GetServerSidePropsContext) => {
  const token = await getToken({ req: ctx.req });
  try {
    const books: Book[] = await db
      .select()
      .from(book)
      .where(and(eq(book.userId, token?.sub as string), eq(book.wishlist, true)))
      .orderBy(asc(book.name));
    if (books) return { count: books.length, data: books };
  } catch (err) {
    throw err;
  }
};
