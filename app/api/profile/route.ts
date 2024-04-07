import { NextResponse, NextRequest } from "next/server";
import { filterUserData, decodeToken } from "@/lib/utils";
import { db, users } from "@/db/schema";
import type { User } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const token: any = await decodeToken(req);
  if (!token) {
    return NextResponse.json({ error: "You are not authorised" }, { status: 401 });
  }
  try {
    const data: User[] = await db.select().from(users).where(eq(users.id, token.id));
    if (data) {
      const filtered = await filterUserData(data[0] as User);
      return NextResponse.json(filtered);
    }
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const token: any = await decodeToken(req);
  if (!token) {
    return NextResponse.json({ error: "You are not authorised" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const data = await db
      .update(users)
      .set({
        name: body.name,
        email: body.email,
        profileImage: body.profileImage,
        showDocuments: body.showDocuments,
        showBooks: body.showBooks,
      })
      .where(eq(users.id, token.id));
    return NextResponse.json(data);
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
