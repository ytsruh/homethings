import * as helpers from "@/lib/helpers";
import * as db from "@/lib/db";

export default async function handler(req, res) {
  try {
    const auth = await helpers.checkAuth(req);
    if (auth) {
      const show = await db.Show.findById(req.query.id);
      const episodes = await show.getEpisodes();
      const data = show.toObject();
      data.episodes = episodes;
      res.status(200).json(data);
    } else {
      res.status(401).json({ error: "Unauthorised" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "An error has occured" });
  }
}
