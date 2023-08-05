import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next";
import { db, filterUserData, combinedDecodeToken } from "@/lib/helpers";
import { UserSchema } from "@/lib/schema";
import type { User } from "@/lib/schema";
import { getToken } from "next-auth/jwt";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = await combinedDecodeToken(req);
  if (req.method === "PATCH") {
    await controller.patch(req, res, token);
  } else {
    await controller.get(req, res, token);
  }
}

const controller = {
  get: async (req: NextApiRequest, res: NextApiResponse, token: any) => {
    try {
      if (token) {
        const data = await db.user.findUnique({ where: { id: token.id } });
        if (data) {
          const filtered = await filterUserData(data);
          res.status(200).json(filtered);
        }
      } else {
        res.status(401).json({ error: "Unauthorised" });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "An error has occured" });
    }
  },
  patch: async (req: NextApiRequest, res: NextApiResponse, token: any) => {
    try {
      if (token) {
        const userdata: User = UserSchema.parse(req.body);
        const data = await db.user.update({
          where: {
            id: token.id,
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

export const getProfile = async (ctx: GetServerSidePropsContext) => {
  const token = await getToken({ req: ctx.req });
  const id = token?.sub;
  try {
    const data = await db.user.findUnique({ where: { id: id } });
    if (data) {
      const filtered = await filterUserData(data);
      return filtered;
    }
  } catch (err) {
    throw err;
  }
};
