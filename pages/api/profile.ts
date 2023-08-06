import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next";
import { filterUserData, combinedDecodeToken } from "@/lib/helpers";
import { getToken } from "next-auth/jwt";
import { db, user } from "@/db/schema";
import type { User } from "@/db/schema";
import { eq } from "drizzle-orm";

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
        const data: User[] = await db.select().from(user).where(eq(user.id, token.id));
        if (data) {
          const filtered = await filterUserData(data[0] as any);
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
        const data = await db
          .update(user)
          .set({
            name: req.body.name,
            email: req.body.email,
            profileImage: req.body.profileImage,
            showDocuments: req.body.showDocuments,
            showBooks: req.body.showBooks,
          })
          .where(eq(user.id, token.id));
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
    const data: User[] = await db
      .select()
      .from(user)
      .where(eq(user.id, id as string));
    if (data) {
      const filtered = await filterUserData(data[0] as any);
      return filtered;
    }
  } catch (err) {
    throw err;
  }
};
