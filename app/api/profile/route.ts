import { NextResponse, NextRequest } from "next/server";
import { filterUserData, combinedDecodeToken } from "@/lib/helpers";
import { db, user } from "@/db/schema";
import type { User } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const token: any = await combinedDecodeToken(req);
  if (!token) {
    return NextResponse.json({ error: "You are not authorised" }, { status: 401 });
  }
  try {
    const data: User[] = await db.select().from(user).where(eq(user.id, token.id));
    if (data) {
      const filtered = await filterUserData(data[0] as any);
      return NextResponse.json(filtered);
    }
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const token: any = await combinedDecodeToken(req);
  if (!token) {
    return NextResponse.json({ error: "You are not authorised" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const data = await db
      .update(user)
      .set({
        name: body.name,
        email: body.email,
        profileImage: body.profileImage,
        showDocuments: body.showDocuments,
        showBooks: body.showBooks,
      })
      .where(eq(user.id, token.id));
    return NextResponse.json(data);
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
