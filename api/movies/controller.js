const db = require("../db");
const helpers = require("../helpers");

module.exports = {
  get: async (context, req) => {
    try {
      const auth = await helpers.checkAuth(req);
      if (auth) {
        const data = await db.Movie.find();
        context.res = {
          status: 200,
          body: { data },
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
  },
  getOne: async (context, req) => {
    try {
      const auth = await helpers.checkAuth(req);
      if (auth) {
        const data = await db.Movie.findById(req.params.id);
        context.res = {
          status: 200,
          body: { data },
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
  },
};