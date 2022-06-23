import * as helpers from "@/lib/helpers";
import * as db from "@/lib/db";

export default async function handler(req, res) {
  if (req.method === "POST") {
    await controller.post(req, res);
  } else {
    await controller.get(req, res);
  }
}

const controller = {
  get: async (req, res) => {
    try {
      const auth = await helpers.checkAuth(req);
      const id = await helpers.decode(req.headers.token);
      if (auth) {
        const data = await db.User.findById(id);
        const filtered = await helpers.filterUserData(data);
        res.status(200).json(filtered);
      } else {
        res.status(401).json({ error: "Unauthorised" });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "An error has occured" });
    }
  },
  post: async (req, res) => {
    try {
      const auth = await helpers.checkAuth(req);
      const id = await helpers.decode(req.headers.token);
      if (auth) {
        const options = {
          returnDocument: "after",
        };
        const data = await db.User.findOneAndUpdate({ _id: id }, req.body.profile, {
          new: true,
        });
        res.status(200).json(data);
      } else {
        res.status(401).json({ error: "Unauthorised" });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "An error has occured" });
    }
  },
};
