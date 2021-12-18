require("dotenv").config();
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = async function (context, req) {
  try {
    //find user & validate password
    const user = await db.User.findOne({ email: req.body.email });
    const match = await bcrypt.compare(req.body.password, user.password);
    //Send response based on result
    if (match) {
      const token = jwt.sign(
        {
          data: {
            id: user.id,
            username: user.username,
          },
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, //Expires in 24 hours
        },
        process.env.JWTSECRET
      );
      context.res = {
        status: 200,
        body: token,
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
