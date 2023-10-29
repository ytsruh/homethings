import { NextRequest, NextResponse } from "next/server";
import { combinedDecodeToken } from "@/lib/helpers";
import { deleteFile } from "@/lib/storage";
import { db, document } from "@/db/schema";
import type { Document } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token: any = await combinedDecodeToken(req);
  if (!token) {
    return NextResponse.json({ error: "You are not authorised" }, { status: 401 });
  }
  const queryParam = params.id;
  try {
    const documents: Document[] = await db
      .select()
      .from(document)
      .where(and(eq(document.id, queryParam), eq(document.accountId, token.accountId)));
    return NextResponse.json({ data: documents[0] });
  } catch (error) {
    // For errors, log to console and send a 500 response back
    console.log(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const token: any = await combinedDecodeToken(req);
  if (!token) {
    return NextResponse.json({ error: "You are not authorised" }, { status: 401 });
  }
  const queryParam = params.id;
  try {
    const body = await req.json();
    const documents: Document[] = await db
      .update(document)
      .set({ title: body.title, description: body.description })
      .where(and(eq(document.id, queryParam), eq(document.accountId, token.accountId)))
      .returning();
    return NextResponse.json({ message: "success", data: documents[0] });
  } catch (error) {
    // For errors, log to console and send a 500 response back
    console.log(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const token: any = await combinedDecodeToken(req);
  if (!token) {
    return NextResponse.json({ error: "You are not authorised" }, { status: 401 });
  }
  const queryParam = params.id;
  try {
    const results: Document[] = await db.delete(document).where(eq(document.id, queryParam)).returning();
    const deletedDoc = results[0];
    // Delete the file from storage
    const result = await deleteFile(deletedDoc.fileName);
    if (!result.success) {
      throw new Error(result.error as string);
    }
    return NextResponse.json({ deleted: "success" });
  } catch (error) {
    // For errors, log to console and send a 500 response back
    console.log(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
