import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import { db, user } from "@/db/schema";
import type { User } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Look up a user in the database based on the email field sumitted in the body
    const users: User[] = await db.select().from(user).where(eq(user.email, body.email));
    const foundUser = users[0];
    //Compare the password with the encrypted one
    if (!foundUser) {
      return NextResponse.json({ error: "Unauthorised: Wrong username or password" }, { status: 401 });
    }
    const match = await bcrypt.compare(body.password, foundUser.password);
    //Send response based on result
    if (match) {
      const expiry = Math.floor(Date.now() / 1000) + 60 * 60 * 24; //Expires in 24 hours
      // Create a JSONWebToken with the minimal amout of data
      if (!process.env.NEXTAUTH_SECRET) {
        throw new Error("JWT_KEY must be defined");
      }
      const token = jsonwebtoken.sign(
        {
          data: {
            id: foundUser?.id,
            email: foundUser?.email,
            accountId: foundUser?.accountId,
          },
          exp: expiry,
        },
        process.env.NEXTAUTH_SECRET
      );
      // Send response back
      return NextResponse.json({ token, expiry });
    } else {
      // If password does not match send 401 error back
      return NextResponse.json({ error: "Unauthorised: Wrong username or password" }, { status: 401 });
    }
  } catch (error) {
    // For errors, log to console and send a 500 response back
    console.log(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
