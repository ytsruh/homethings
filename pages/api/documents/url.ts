import type { NextApiRequest, NextApiResponse } from "next";
import { combinedDecodeToken } from "@/lib/helpers";
import { createS3PutUrl, createS3GetUrl } from "@/lib/storage";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!req.headers.token) {
    res.status(401).json({ error: "Unauthorised" });
    return;
  }
  await combinedDecodeToken(req);
  if (!req.query.fileName) {
    res.status(400).json({ error: "Error with request" });
    return;
  }
  switch (req.method) {
    case "GET":
      try {
        const url = await createS3GetUrl(req.query.fileName as string);
        res.status(200).json({ url: url });
      } catch (error) {
        // For errors, log to console and send a 500 response back
        console.log(error);
        res.status(500).json({ error: "Something went wrong" });
      }
      break;

    case "PUT":
      try {
        const url = await createS3PutUrl(req.query.fileName as string);
        res.status(200).json({ url: url });
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
