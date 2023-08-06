import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next";
import { combinedDecodeToken } from "@/lib/helpers";
import { getToken } from "next-auth/jwt";
import { db, document } from "@/db/schema";
import type { Document, NewDocument } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check auth
  const token: any = await combinedDecodeToken(req);
  switch (req.method) {
    case "GET":
      try {
        const documents: Document[] = await db
          .select()
          .from(document)
          .where(eq(document.accountId, token.accountId));
        res.status(200).json({ count: documents.length, data: documents });
      } catch (error) {
        // For errors, log to console and send a 500 response back
        console.log(error);
        res.status(500).json({ error: "Something went wrong" });
      }
      break;

    case "POST":
      try {
        const { body } = req;
        const newDocument: NewDocument = {
          title: body.title,
          description: body.description,
          fileName: body.fileName,
          accountId: token.accountId,
        };
        const data: Document[] = await db.insert(document).values(newDocument).returning();
        res.status(200).json({ message: "success", data: data });
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

export const getDocs = async (ctx: GetServerSidePropsContext) => {
  const token = await getToken({ req: ctx.req });
  try {
    const documents: Document[] = await db
      .select()
      .from(document)
      .where(eq(document.accountId, token?.accountId as string));
    if (documents) return { count: documents.length, data: documents };
  } catch (err) {
    throw err;
  }
};
