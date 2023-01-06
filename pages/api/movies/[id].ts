import type { NextApiRequest, NextApiResponse } from "next";
import * as helpers from "@/lib/helpers";
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const auth = await helpers.checkAuth(req);
    if (auth) {
      const data = await db.movie.findUnique({ where: { id: req.query.id } });
      res.status(200).json(data);
    } else {
      res.status(401).json({ error: "Unauthorised" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "An error has occured" });
  }
}
