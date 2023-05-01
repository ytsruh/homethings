import type { NextApiRequest, NextApiResponse } from "next";
import { db, combinedDecodeToken } from "@/lib/helpers";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!req.headers.token) {
    res.status(401).json({ error: "Unauthorised" });
    return;
  }
  switch (req.method) {
    case "POST":
      try {
        const token: string = await combinedDecodeToken(req);
        const { body } = req;
        const book = await db.book.create({
          data: {
            name: body.name,
            isbn: body.isbn,
            author: body.author,
            genre: body.genre,
            wishlist: body.wishlist,
            read: body.read,
            rating: body.rating,
            image: body.image,
            userId: token,
          },
        });
        res.status(200).json({ message: "success", data: book });
      } catch (error) {
        // For errors, log to console and send a 500 response back
        console.log(error);
        res.status(500).json({ error: "Something went wrong" });
      }
      break;

    case "GET":
      try {
        const token: string = await combinedDecodeToken(req);
        const books = await db.book.findMany({
          where: {
            userId: token,
          },
        });
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
