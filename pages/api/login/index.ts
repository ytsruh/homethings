import type { NextApiRequest, NextApiResponse } from "next";
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
import * as db from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      //find user & validate password
      const user = await db.User.findOne({ email: req.body.email });
      const match = await bcrypt.compare(req.body.password, user.password);
      //Send response based on result
      if (match) {
        const expiry = Math.floor(Date.now() / 1000) + 60 * 60 * 24; //Expires in 24 hours
        const token = jwt.sign(
          {
            data: {
              id: user.id,
              username: user.username,
            },
            exp: expiry,
          },
          process.env.NEXT_PUBLIC_JWTSECRET
        );
        const userData = {
          name: user.name,
          icon: user.icon,
          darkMode: user.darkMode,
        };
        res.status(200).json({ token, expiry, userData });
      } else {
        res.status(401).json({ error: "Log In Failed" });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "An error has occured" });
    }
  }
}
