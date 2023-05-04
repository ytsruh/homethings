import type { NextApiRequest, NextApiResponse } from "next";
import { db, combinedDecodeToken } from "@/lib/helpers";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!req.headers.token) {
    res.status(401).json({ error: "Unauthorised" });
    return;
  }
  switch (req.method) {
    case "GET":
      try {
        const token: string = await combinedDecodeToken(req);
        const feedback = await db.feedback.findMany({
          where: {
            id: req.query.id?.toString(),
            userId: token,
          },
        });
        res.status(200).json({ data: feedback });
      } catch (error) {
        // For errors, log to console and send a 500 response back
        console.log(error);
        res.status(500).json({ error: "Something went wrong" });
      }
      break;

    case "PATCH":
      try {
        const token: string = await combinedDecodeToken(req);
        const { body } = req;
        const feedback = await db.feedback.updateMany({
          where: {
            id: req.query.id?.toString(),
            userId: token,
          },
          data: {
            title: body.title,
            body: body.body,
            userId: token,
          },
        });
        res.status(200).json({ message: "success", data: feedback });
      } catch (error) {
        // For errors, log to console and send a 500 response back
        console.log(error);
        res.status(500).json({ error: "Something went wrong" });
      }
      break;

    case "DELETE":
      try {
        const token: string = await combinedDecodeToken(req);
        await db.feedback.deleteMany({
          where: {
            id: req.query.id?.toString(),
            userId: token,
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
