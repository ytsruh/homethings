import type { NextApiRequest, NextApiResponse } from "next";
import { db, combinedDecodeToken } from "@/lib/helpers";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "POST":
      await controller.post(req, res);
      break;

    case "DELETE":
      await controller.delete(req, res);
      break;

    default:
      await controller.get(req, res);
      break;
  }
}

export const getFavourites = async (ctx: any) => {
  const token = await combinedDecodeToken(ctx);

  const favourites = await db.favourite.findMany({
    where: {
      userId: token as string,
    },
  });
  const items = favourites.map((f) => f.favourite);
  const favouriteMovies = await db.movie.findMany({
    where: {
      id: { in: items },
    },
  });
  const favouriteShows = await db.show.findMany({
    where: {
      id: { in: items },
    },
  });
  return { movies: favouriteMovies, shows: favouriteShows };
};

const controller = {
  get: async (req: NextApiRequest, res: NextApiResponse) => {
    const token = await combinedDecodeToken(req);
    if (token) {
      const favourites = await getFavourites(req);
      res.status(200).json(favourites);
    } else {
      res.status(401).json({ error: "Unauthorised" });
    }
  },
  post: async (req: NextApiRequest, res: NextApiResponse) => {
    const token = await combinedDecodeToken(req);
    if (token) {
      console.log(req.body);

      const favourite = await db.favourite.create({
        data: {
          favourite: req.body.id,
          type: req.body.type,
          userId: token as string,
        },
      });
      res.status(200).json(favourite);
    } else {
      res.status(401).json({ error: "Unauthorised" });
    }
  },
  delete: async (req: NextApiRequest, res: NextApiResponse) => {
    const token = await combinedDecodeToken(req);
    if (token) {
      const favourite = await db.favourite.deleteMany({
        where: {
          favourite: req.body.id,
          userId: token as string,
        },
      });
      res.status(200).json(favourite);
    } else {
      res.status(401).json({ error: "Unauthorised" });
    }
  },
};
