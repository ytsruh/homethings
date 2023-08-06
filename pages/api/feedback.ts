import type { NextApiRequest, NextApiResponse } from "next";
import { combinedDecodeToken } from "@/lib/helpers";
import { db, feedback } from "@/db/schema";
import type { Feedback, NewFeedback } from "@/db/schema";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token: any = await combinedDecodeToken(req);
  switch (req.method) {
    case "POST":
      try {
        const { body } = req;
        const newFeedback: NewFeedback = {
          title: body.title,
          body: body.body,
          userId: token.id,
        };
        const data: Feedback[] = await db.insert(feedback).values(newFeedback).returning();
        res.status(200).json({ message: "success", data: data });
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
