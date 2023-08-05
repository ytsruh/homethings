import type { NextApiRequest, NextApiResponse } from "next";
import { db, combinedDecodeToken } from "@/lib/helpers";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token: any = await combinedDecodeToken(req);
  switch (req.method) {
    case "POST":
      try {
        const { body } = req;
        const feedback = await db.feedback.create({
          data: {
            title: body.title,
            body: body.body,
            userId: token.id,
          },
        });
        res.status(200).json({ message: "success", data: feedback });
      } catch (error) {
        // For errors, log to console and send a 500 response back
        console.log(error);
        res.status(500).json({ error: "Something went wrong" });
      }
      break;

    case "GET":
      try {
        const feedback = await db.feedback.findMany({
          where: {
            userId: token.id,
          },
        });
        res.status(200).json({ count: feedback.length, data: feedback });
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
