require("dotenv").config();
const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports = async function (context, req) {
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
        process.env.JWTSECRET
      );
      const userData = {
        name: user.name,
        icon: user.icon,
        darkMode: user.darkMode,
      };
      context.res = {
        status: 200,
        body: JSON.stringify({ token, expiry, userData }),
        headers: {
          "Content-Type": "application/json",
        },
      };
    } else {
      context.res = {
        status: 401,
        body: JSON.stringify({ error: "Log In Failed" }),
        headers: {
          "Content-Type": "application/json",
        },
      };
    }
  } catch (err) {
    console.log(err);
    context.res = {
      status: 500,
      body: { error: "An error has occured" },
      headers: {
        "Content-Type": "application/json",
      },
    };
  }
};
