import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next";
import { combinedDecodeToken } from "@/lib/helpers";
import { getToken } from "next-auth/jwt";
import { db, book } from "@/db/schema";
import type { Book, NewBook } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

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
          .where(eq(book.userId, token.id))
          .orderBy(asc(book.name));
        res.status(200).json({ count: books.length, data: books });
      } catch (error) {
        // For errors, log to console and send a 500 response back
        console.log(error);
        res.status(500).json({ error: "Something went wrong" });
      }
      break;

    case "POST":
      try {
        const { body } = req;
        const newBook: NewBook = {
          name: body.name,
          isbn: body.isbn,
          author: body.author,
          genre: body.genre,
          wishlist: body.wishlist,
          read: body.read,
          rating: body.rating,
          image: body.image,
          userId: token.id,
        };
        const results: Book[] = await db.insert(book).values(newBook).returning();
        res.status(200).json({ message: "success", data: results[0] });
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

export const getBooks = async (ctx: GetServerSidePropsContext) => {
  const token = await getToken({ req: ctx.req });
  try {
    const books: Book[] = await db
      .select()
      .from(book)
      .where(eq(book.userId, token?.sub as string))
      .orderBy(asc(book.name));

    if (books) return { count: books.length, data: books };
  } catch (err) {
    throw err;
  }
};
