import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import { db } from "@/lib/helpers";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "POST":
      try {
        const { body } = req;
        const user = await db.user.findUnique({
          where: {
            email: body.email,
          },
        });
        //Compare the password with the encrypted one
        if (!user) {
          res.status(401).json({ error: "Unauthorised: Wrong username or password" });
          return;
        }
        const match = await bcrypt.compare(body.password, user.password);
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
                id: user?.id,
                email: user?.email,
              },
              exp: expiry,
            },
            process.env.NEXTAUTH_SECRET
          );
          // Send response back
          res.status(200).json({ token, expiry });
        } else {
          // If password does not match send 401 error back
          res.status(401).json({ error: "Unauthorised: Wrong username or password" });
        }
      } catch (error) {
        // For errors, log to console and send a 500 response back
        console.log(error);
        res.status(500).json({ error: "Something went wrong" });
      }
      break;

    default:
      await res.status(404).send("");
      break;
  }
}
