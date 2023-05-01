import type { NextApiRequest, NextApiResponse } from "next";
import { db, combinedDecodeToken } from "@/lib/helpers";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = await combinedDecodeToken(req);
    if (token) {
      const data = await db.movie.findMany();
      res.status(200).json(data);
    } else {
      res.status(401).json({ error: "Unauthorised" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "An error has occured" });
  }
}

export const getMovies = async () => {
  try {
    const data = await db.movie.findMany();
    return data;
  } catch (err) {
    throw err;
  }
};
