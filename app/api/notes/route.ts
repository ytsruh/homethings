import { NextResponse, NextRequest } from "next/server";
import { decodeToken } from "@/lib/utils";
import { db, notes } from "@/db/schema";
import type { Note, NewNote } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const token: any = await decodeToken(req);
  if (!token) {
    return NextResponse.json({ error: "You are not authorised" }, { status: 401 });
  }
  try {
    const data: Note[] = await db.select().from(notes).where(eq(notes.userId, token.id));
    if (data) {
      return NextResponse.json(data);
    }
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token: any = await decodeToken(req);
  if (!token) {
    return NextResponse.json({ error: "You are not authorised" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const newNote: NewNote = {
      title: body.title,
      body: body.body,
      userId: token.id,
    };
    const data: Note[] = await db.insert(notes).values(newNote).returning();
    return NextResponse.json({ message: "success", data: data });
  } catch (error) {
    // For errors, log to console and send a 500 response back
    console.log(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
