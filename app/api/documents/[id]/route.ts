import { NextRequest, NextResponse } from "next/server";
import { decodeToken } from "@/lib/helpers";
import { deleteFile } from "@/lib/storage";
import { db, documents } from "@/db/schema";
import type { Document } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token: any = await decodeToken(req);
  if (!token) {
    return NextResponse.json({ error: "You are not authorised" }, { status: 401 });
  }
  const queryParam = params.id;
  try {
    const data: Document[] = await db
      .select()
      .from(documents)
      .where(and(eq(documents.id, queryParam), eq(documents.accountId, token.accountId)));
    return NextResponse.json({ data: data[0] });
  } catch (error) {
    // For errors, log to console and send a 500 response back
    console.log(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const token: any = await decodeToken(req);
  if (!token) {
    return NextResponse.json({ error: "You are not authorised" }, { status: 401 });
  }
  const queryParam = params.id;
  try {
    const body = await req.json();
    const data: Document[] = await db
      .update(documents)
      .set({ title: body.title, description: body.description })
      .where(and(eq(documents.id, queryParam), eq(documents.accountId, token.accountId)))
      .returning();
    return NextResponse.json({ message: "success", data: data[0] });
  } catch (error) {
    // For errors, log to console and send a 500 response back
    console.log(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const token: any = await decodeToken(req);
  if (!token) {
    return NextResponse.json({ error: "You are not authorised" }, { status: 401 });
  }
  const queryParam = params.id;
  try {
    const results: Document[] = await db.delete(documents).where(eq(documents.id, queryParam)).returning();
    const deletedDoc = results[0];
    // Delete the file from storage
    const result = await deleteFile(deletedDoc.fileName as string);
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
