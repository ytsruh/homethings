import { NextRequest, NextResponse } from "next/server";
import { combinedDecodeToken } from "@/lib/helpers";
import { db, documents } from "@/db/schema";
import type { Document, NewDocument } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const token: any = await combinedDecodeToken(req);
  if (!token) {
    return NextResponse.json({ error: "You are not authorised" }, { status: 401 });
  }
  try {
    const data: Document[] = await db
      .select()
      .from(documents)
      .where(eq(documents.accountId, token.accountId));
    return NextResponse.json({ count: data.length, data: data });
  } catch (error) {
    // For errors, log to console and send a 500 response back
    console.log(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token: any = await combinedDecodeToken(req);
  if (!token) {
    return NextResponse.json({ error: "You are not authorised" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const newDocument: NewDocument = {
      title: body.title,
      description: body.description,
      fileName: body.fileName,
      accountId: token.accountId,
    };
    const data: Document[] = await db.insert(documents).values(newDocument).returning();
    return NextResponse.json({ message: "success", data: data });
  } catch (error) {
    // For errors, log to console and send a 500 response back
    console.log(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
