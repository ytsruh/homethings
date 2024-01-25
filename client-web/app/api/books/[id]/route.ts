import { NextResponse, NextRequest } from "next/server";
import { combinedDecodeToken } from "@/lib/helpers";
import { db, book } from "@/db/schema";
import type { Book } from "@/db/schema";
import { eq, asc, and } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token: any = await combinedDecodeToken(req);
  if (!token) {
    return NextResponse.json({ error: "You are not authorised" }, { status: 401 });
  }
  const queryParam = params.id;
  try {
    const results: Book[] = await db
      .select()
      .from(book)
      .where(and(eq(book.id, queryParam), eq(book.userId, token.id)))
      .orderBy(asc(book.name));
    return NextResponse.json({ data: results[0] });
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
    const result: Book[] = await db
      .update(book)
      .set({
        name: body.name,
        isbn: body.isbn,
        author: body.author,
        genre: body.genre,
        wishlist: body.wishlist,
        read: body.read,
        rating: body.rating,
        image: body.image,
      })
      .where(and(eq(book.id, queryParam), eq(book.userId, token.id)))
      .returning();
    const updatedBook = result[0];
    return NextResponse.json({ message: "success", data: updatedBook });
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
    await db.delete(book).where(eq(book.id, queryParam)).returning();
    return NextResponse.json({ deleted: "success" });
  } catch (error) {
    // For errors, log to console and send a 500 response back
    console.log(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
