import type { NextApiRequest, NextApiResponse } from "next";
import { db, combinedDecodeToken } from "@/lib/helpers";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = await combinedDecodeToken(req);
  try {
    if (token) {
      const data = await db.show.findUnique({
        where: { id: req?.query?.id?.toString() },
        include: {
          episodes: true,
        },
      });
      res.status(200).json(data);
    } else {
      res.status(401).json({ error: "Unauthorised" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "An error has occured" });
  }
}

export const getShow = async (id: any) => {
  try {
    const data = await db.show.findUnique({
      where: { id: id },
      include: {
        episodes: true,
      },
    });
    return data;
  } catch (err) {
    throw err;
  }
};
