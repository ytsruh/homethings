import type { NextApiRequest, NextApiResponse } from "next";
import { db, combinedDecodeToken, filterOutPassword } from "@/lib/helpers";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    await controller.post(req, res);
  } else {
    await controller.get(req, res);
  }
}

const controller = {
  get: async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const id = await combinedDecodeToken(req);
      if (id) {
        const data = await db.user.findMany();
        const filtered = filterOutPassword(data);
        res.status(200).json(filtered);
      } else {
        res.status(401).json({ error: "Unauthorised" });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "An error has occured" });
    }
  },
  post: async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const id = await combinedDecodeToken(req);
      if (id) {
        const data = await db.user.create({ data: req.body });
        res.status(200).json(data);
      } else {
        res.status(401).json({ error: "Unauthorised" });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "An error has occured" });
    }
  },
};

export const getUsers = async () => {
  try {
    const data = await db.user.findMany();
    const filtered = filterOutPassword(data);
    return filtered;
  } catch (err) {
    throw err;
  }
};
