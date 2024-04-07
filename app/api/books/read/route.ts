import { NextResponse, NextRequest } from "next/server";
import { decodeToken } from "@/lib/utils";
import { db, books } from "@/db/schema";
import type { Book } from "@/db/schema";
import { eq, asc, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const token: any = await decodeToken(req);
  if (!token) {
    return NextResponse.json({ error: "You are not authorised" }, { status: 401 });
  }
  try {
    const data: Book[] = await db
      .select()
      .from(books)
      .where(and(eq(books.userId, token.id), eq(books.read, true)))
      .orderBy(asc(books.name));
    return NextResponse.json({ count: data.length, data: books });
  } catch (error) {
    // For errors, log to console and send a 500 response back
    console.log(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
