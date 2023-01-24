import type { NextApiRequest, NextApiResponse } from "next";
import { db, checkAuth, filterUserData, decode } from "@/lib/helpers";

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
      const auth = await checkAuth(req);
      const id = await decode(req.headers.token);
      if (auth) {
        const data = await db.user.findUnique({ where: { id: id } });
        const filtered = await filterUserData(data);
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
      const auth = await checkAuth(req);
      const id = await decode(req.headers.token);
      if (auth) {
        const data = await db.user.update({
          where: {
            id: id,
          },
          data: req.body.profile,
        });
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
