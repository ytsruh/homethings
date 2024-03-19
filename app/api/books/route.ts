import { NextResponse, NextRequest } from "next/server";
import { combinedDecodeToken } from "@/lib/helpers";
import { db, books } from "@/db/schema";
import type { Book, NewBook } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const token: any = await combinedDecodeToken(req);
  if (!token) {
    return NextResponse.json({ error: "You are not authorised" }, { status: 401 });
  }
  try {
    const data: Book[] = await db
      .select()
      .from(books)
      .where(eq(books.userId, token.id))
      .orderBy(asc(books.name));
    return NextResponse.json({ count: data.length, data: books });
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
    const newBook: NewBook = {
      name: body.name,
      isbn: body.isbn,
      author: body.author,
      genre: body.genre,
      wishlist: body.wishlist,
      read: body.read,
      rating: body.rating,
      image: body.image,
      userId: token.id,
    };
    const results: Book[] = await db.insert(books).values(newBook).returning();
    return NextResponse.json({ message: "success", data: results[0] });
  } catch (error) {
    // For errors, log to console and send a 500 response back
    console.log(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
