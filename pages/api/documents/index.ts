import type { NextApiRequest, NextApiResponse } from "next";
import { db, combinedDecodeToken } from "@/lib/helpers";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!req.headers.token) {
    res.status(401).json({ error: "Unauthorised" });
    return;
  }
  const token: any = await combinedDecodeToken(req);
  switch (req.method) {
    case "GET":
      try {
        const documents = await db.document.findMany({
          where: {
            accountId: token.accountId,
          },
        });
        res.status(200).json({ count: documents.length, data: documents });
      } catch (error) {
        // For errors, log to console and send a 500 response back
        console.log(error);
        res.status(500).json({ error: "Something went wrong" });
      }
      break;

    case "POST":
      try {
        const { body } = req;
        const document = await db.document.create({
          data: {
            title: body.title,
            description: body.description,
            fileName: body.filePath,
            accountId: token.accountId,
          },
        });
        res.status(200).json({ message: "success", data: document });
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
