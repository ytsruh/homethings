import type { NextApiRequest, NextApiResponse } from "next";
import { db, combinedDecodeToken } from "@/lib/helpers";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!req.headers.token) {
    res.status(401).json({ error: "Unauthorised" });
    return;
  }
  const token: string = await combinedDecodeToken(req);
  switch (req.method) {
    case "GET":
      try {
        const books = await db.book.findMany({
          where: {
            userId: token,
            read: true,
          },
          orderBy: [
            {
              name: "asc",
            },
          ],
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
