import { NextResponse, NextRequest } from "next/server";
import { decodeToken } from "@/lib/helpers";
import { db, feedback } from "@/db/schema";
import type { Feedback, NewFeedback } from "@/db/schema";

export async function PATCH(req: NextRequest) {
  const token: any = await decodeToken(req);
  if (!token) {
    return NextResponse.json({ error: "You are not authorised" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const newFeedback: NewFeedback = {
      title: body.title,
      body: body.body,
      userId: token.id,
    };
    const data: Feedback[] = await db.insert(feedback).values(newFeedback).returning();
    return NextResponse.json({ message: "success", data: data });
  } catch (error) {
    // For errors, log to console and send a 500 response back
    console.log(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
