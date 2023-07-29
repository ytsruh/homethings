import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next";
import { db, combinedDecodeToken } from "@/lib/helpers";
import { getToken } from "next-auth/jwt";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token: any = await combinedDecodeToken(req);
  if (!token) {
    res.status(401).json({ error: "Unauthorised" });
    return;
  }
  switch (req.method) {
    case "GET":
      try {
        const book = await db.book.findMany({
          where: {
            id: req.query.id?.toString(),
            userId: token.id,
          },
        });
        res.status(200).json({ data: book });
      } catch (error) {
        // For errors, log to console and send a 500 response back
        console.log(error);
        res.status(500).json({ error: "Something went wrong" });
      }
      break;

    case "PATCH":
      try {
        const { body } = req;
        const book = await db.book.updateMany({
          where: {
            id: req.query.id?.toString(),
            userId: token.id,
          },
          data: {
            name: body.name,
            isbn: body.isbn,
            author: body.author,
            genre: body.genre,
            wishlist: body.wishlist,
            read: body.read,
            rating: body.rating,
            image: body.image,
          },
        });
        res.status(200).json({ message: "success", data: book });
      } catch (error) {
        // For errors, log to console and send a 500 response back
        console.log(error);
        res.status(500).json({ error: "Something went wrong" });
      }
      break;

    case "DELETE":
      try {
        await db.book.deleteMany({
          where: {
            id: req.query.id?.toString(),
            userId: token.id,
          },
        });
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
  try {
    const book = await db.book.findMany({
      where: {
        id: ctx.query.id?.toString(),
        userId: token?.id as string,
      },
    });
    if (book) return book;
  } catch (err) {
    throw err;
  }
};
