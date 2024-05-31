export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { decodeToken } from "@/lib/utils";
import { db, notes } from "@/db/schema";
import type { Note } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token: any = await decodeToken(req);
  if (!token) {
    return NextResponse.json({ error: "You are not authorised" }, { status: 401 });
  }
  const queryParam = params.id;
  try {
    const data: Note[] = await db
      .select()
      .from(notes)
      .where(and(eq(notes.id, queryParam), eq(notes.userId, token.id)));
    return NextResponse.json(data[0]);
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
    const data: Note[] = await db
      .update(notes)
      .set({ title: body.title, body: body.body })
      .where(and(eq(notes.id, queryParam), eq(notes.userId, token.id)))
      .returning();
    return NextResponse.json(data[0]);
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
    const results: Note[] = await db
      .delete(notes)
      .where(and(eq(notes.id, queryParam), eq(notes.userId, token.id)))
      .returning();
    if (results.length === 0) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }
    return NextResponse.json({ deleted: "success" });
  } catch (error) {
    // For errors, log to console and send a 500 response back
    console.log(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
