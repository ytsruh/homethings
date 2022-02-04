require("dotenv").config();
const db = require("../db");
const helpers = require("../helpers");

module.exports = async function (context, req) {
  try {
    const auth = await helpers.checkAuth(req);
    const id = await helpers.decode(req.headers.token);
    if (auth) {
      console.log(auth);
      const data = await db.User.findById(id);
      context.res = {
        status: 200,
        body: data,
        headers: {
          "Content-Type": "application/json",
        },
      };
    } else {
      context.res = {
        status: 401,
        body: { error: "Unauthorised" },
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
