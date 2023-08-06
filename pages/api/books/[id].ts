import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next";
import { combinedDecodeToken } from "@/lib/helpers";
import { getToken } from "next-auth/jwt";
import { db, book } from "@/db/schema";
import type { Book } from "@/db/schema";
import { eq, asc, and } from "drizzle-orm";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token: any = await combinedDecodeToken(req);
  const queryParam: string = req.query.id?.toString() as string;
  switch (req.method) {
    case "GET":
      try {
        const results: Book[] = await db
          .select()
          .from(book)
          .where(and(eq(book.id, queryParam), eq(book.userId, token.id)))
          .orderBy(asc(book.name));
        res.status(200).json({ data: results[0] });
      } catch (error) {
        // For errors, log to console and send a 500 response back
        console.log(error);
        res.status(500).json({ error: "Something went wrong" });
      }
      break;

    case "PATCH":
      try {
        const { body } = req;
        const result: Book[] = await db
          .update(book)
          .set({
            name: body.name,
            isbn: body.isbn,
            author: body.author,
            genre: body.genre,
            wishlist: body.wishlist,
            read: body.read,
            rating: body.rating,
            image: body.image,
          })
          .where(and(eq(book.id, queryParam), eq(book.userId, token.id)))
          .returning();
        const updatedBook = result[0];
        res.status(200).json({ message: "success", data: updatedBook });
      } catch (error) {
        // For errors, log to console and send a 500 response back
        console.log(error);
        res.status(500).json({ error: "Something went wrong" });
      }
      break;

    case "DELETE":
      try {
        await db.delete(book).where(eq(book.id, queryParam)).returning();
        res.status(200).json({ deleted: "success" });
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

export const getBook = async (ctx: GetServerSidePropsContext) => {
  const token = await getToken({ req: ctx.req });
  const queryParam = ctx.query.id?.toString() as string;
  try {
    const results: Book[] = await db
      .select()
      .from(book)
      .where(and(eq(book.id, queryParam), eq(book.userId, token?.sub as string)))
      .orderBy(asc(book.name));
    if (book) return results;
  } catch (err) {
    throw err;
  }
};
