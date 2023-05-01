import type { NextApiRequest, NextApiResponse } from "next";
import { db, filterUserData, combinedDecodeToken } from "@/lib/helpers";
import { UserSchema } from "@/lib/schema";
import type { User } from "@/lib/schema";

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
      const id = await combinedDecodeToken(req);
      if (id) {
        const userdata: User = UserSchema.parse(req.body);
        const data = await db.user.update({
          where: {
            id: id,
          },
          data: userdata,
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

export const getProfile = async (req: any) => {
  const id = await combinedDecodeToken(req);
  try {
    const data = await db.user.findUnique({ where: { id: id } });
    const filtered = await filterUserData(data);
    return filtered;
  } catch (err) {
    throw err;
  }
};
