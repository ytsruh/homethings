import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next";
import { db, combinedDecodeToken } from "@/lib/helpers";
import { getToken } from "next-auth/jwt";
import { deleteFile } from "@/lib/storage";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token: any = await combinedDecodeToken(req);
  switch (req.method) {
    case "GET":
      try {
        const doc = await db.document.findMany({
          where: {
            id: req.query.id?.toString(),
            accountId: token.accountId,
          },
        });
        res.status(200).json({ data: doc });
      } catch (error) {
        // For errors, log to console and send a 500 response back
        console.log(error);
        res.status(500).json({ error: "Something went wrong" });
      }
      break;

    case "PATCH":
      try {
        const { body } = req;
        const doc = await db.document.updateMany({
          where: {
            id: req.query.id?.toString(),
            accountId: token.accountId,
          },
          data: {
            title: body.title,
            description: body.description,
          },
        });
        res.status(200).json({ message: "success", data: doc });
      } catch (error) {
        // For errors, log to console and send a 500 response back
        console.log(error);
        res.status(500).json({ error: "Something went wrong" });
      }
      break;

    case "DELETE":
      try {
        //Delete the file from the database
        await db.document.deleteMany({
          where: {
            id: req.query.id?.toString(),
            accountId: token.accountId,
          },
        });
        // Delete the file from storage
        const result = await deleteFile(req.query.id?.toString() as string);
        if (!result.success) {
          throw new Error(result.error as string);
        }
        res.status(200).json({ deleted: "success" });
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

export const getSingleDoc = async (ctx: GetServerSidePropsContext) => {
  const token = await getToken({ req: ctx.req });
  try {
    const document = await db.document.findMany({
      where: {
        id: ctx.query.id?.toString(),
        accountId: token?.accountId as string,
      },
    });
    if (document) return { data: document };
  } catch (err) {
    throw err;
  }
};
