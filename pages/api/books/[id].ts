import type { NextApiRequest, NextApiResponse } from "next";
import { db, decodeToken } from "@/lib/helpers";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!req.headers.token) {
    res.status(401).json({ error: "Unauthorised" });
    return;
  }
  switch (req.method) {
    case "GET":
      try {
        const token: any = await decodeToken(req, res);
        const books = await db.book.findMany({
          where: {
            id: req.query.id?.toString(),
            userId: token.data.id,
          },
        });
        res.status(200).json({ data: books });
      } catch (error) {
        // For errors, log to console and send a 500 response back
        console.log(error);
        res.status(500).json({ error: "Something went wrong" });
      }
      break;

    case "PATCH":
      try {
        const token: any = await decodeToken(req, res);
        const { body } = req;
        const book = await db.book.updateMany({
          where: {
            id: req.query.id?.toString(),
            userId: token.data.id,
          },
          data: {
            name: body.name,
            isbn: body.isbn,
            author: body.author,
            genre: body.genre,
            rating: body.rating,
            review: body.review,
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
        const token: any = await decodeToken(req, res);
        await db.book.deleteMany({
          where: {
            id: req.query.id?.toString(),
            userId: token.data.id,
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