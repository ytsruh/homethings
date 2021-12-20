const db = require("../db");
const helpers = require("../helpers");

module.exports = {
  get: async (context, req) => {
    try {
      const auth = await helpers.checkAuth(req);
      if (auth) {
        const data = await db.Show.find();
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
        const show = await db.Show.findById(req.params.id);
        const episodes = await show.getEpisodes();
        const data = show.toObject();
        data.episodes = episodes;
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
