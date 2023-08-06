import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next";
import { combinedDecodeToken } from "@/lib/helpers";
import { getToken } from "next-auth/jwt";
import { deleteFile } from "@/lib/storage";
import { db, document } from "@/db/schema";
import type { Document, NewDocument } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token: any = await combinedDecodeToken(req);
  const queryParam: string = req.query.id?.toString() as string;
  switch (req.method) {
    case "GET":
      try {
        const documents: Document[] = await db
          .select()
          .from(document)
          .where(and(eq(document.id, queryParam), eq(document.accountId, token.accountId)));
        res.status(200).json({ data: documents[0] });
      } catch (error) {
        // For errors, log to console and send a 500 response back
        console.log(error);
        res.status(500).json({ error: "Something went wrong" });
      }
      break;

    case "PATCH":
      try {
        const { body } = req;
        const documents: Document[] = await db
          .update(document)
          .set({ title: body.title, description: body.description })
          .where(and(eq(document.id, queryParam), eq(document.accountId, token.accountId)))
          .returning();
        const doc = documents[0];
        res.status(200).json({ message: "success", data: doc });
      } catch (error) {
        // For errors, log to console and send a 500 response back
        console.log(error);
        res.status(500).json({ error: "Something went wrong" });
      }
      break;

    case "DELETE":
      try {
        const results: Document[] = await db.delete(document).where(eq(document.id, queryParam)).returning();
        const deletedDoc = results[0];
        // Delete the file from storage
        const result = await deleteFile(deletedDoc.fileName);
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
    const queryParam = ctx.query.id?.toString() as string;
    const results: Document[] = await db
      .select()
      .from(document)
      .where(and(eq(document.id, queryParam), eq(document.accountId, token?.accountId as string)));
    if (results)
      return {
        data: results,
      };
  } catch (err) {
    throw err;
  }
};
