import { NextRequest, NextResponse } from "next/server";
import { createS3GetUrl, createS3PutUrl } from "@/lib/storage";
import { decodeToken } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const token: any = await decodeToken(req);
  if (!token) {
    return NextResponse.json({ error: "You are not authorised" }, { status: 401 });
  }
  const searchParams = req.nextUrl.searchParams;
  const query = searchParams.get("fileName");
  try {
    const url = await createS3GetUrl(query as string);
    return NextResponse.json({ url: url });
  } catch (error) {
    // For errors, log to console and send a 500 response back
    console.log(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const token: any = await decodeToken(req);
  if (!token) {
    return NextResponse.json({ error: "You are not authorised" }, { status: 401 });
  }
  const searchParams = req.nextUrl.searchParams;
  const query = searchParams.get("fileName");
  try {
    const url = await createS3PutUrl(query as string);
    return NextResponse.json({ url: url });
  } catch (error) {
    // For errors, log to console and send a 500 response back
    console.log(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
