import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next";
import { db, combinedDecodeToken } from "@/lib/helpers";
import { getToken } from "next-auth/jwt";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token: any = await combinedDecodeToken(req);
  if (!token) {
    res.status(401).json({ error: "Unauthorised" });
    return;
  }
  switch (req.method) {
    case "GET":
      try {
        const books = await db.book.findMany({
          where: {
            userId: token.id,
            read: true,
          },
          orderBy: [
            {
              name: "asc",
            },
          ],
        });
        res.status(200).json({ count: books.length, data: books });
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

export const getReadBooks = async (ctx: GetServerSidePropsContext) => {
  const token = await getToken({ req: ctx.req });
  try {
    const books = await db.book.findMany({
      where: {
        userId: token?.sub as string,
        read: true,
      },
      orderBy: [
        {
          name: "asc",
        },
      ],
    });
    if (books) return { count: books.length, data: books };
  } catch (err) {
    throw err;
  }
};
