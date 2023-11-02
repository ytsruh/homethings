import { NextResponse, NextRequest } from "next/server";
import { combinedDecodeToken } from "@/lib/helpers";
import { db, book } from "@/db/schema";
import type { Book } from "@/db/schema";
import { eq, asc, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const token: any = await combinedDecodeToken(req);
  if (!token) {
    return NextResponse.json({ error: "You are not authorised" }, { status: 401 });
  }
  try {
    const books: Book[] = await db
      .select()
      .from(book)
      .where(and(eq(book.userId, token.id), eq(book.wishlist, true)))
      .orderBy(asc(book.name));
    return NextResponse.json({ count: books.length, data: books });
  } catch (error) {
    // For errors, log to console and send a 500 response back
    console.log(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
