const db = require("./");

const seedUndo = async () => {
  //Users
  const users = await db.User.deleteMany();
  console.log(`Deleted : ${users.deletedCount} users`);
  //Movies
  const movies = await db.Movie.deleteMany();
  console.log(`Deleted : ${movies.deletedCount} movies`);
  //Shows
  const shows = await db.Show.deleteMany();
  console.log(`Deleted : ${shows.deletedCount} shows`);
  //Episodes
  const episodes = await db.Episode.deleteMany();
  console.log(`Deleted : ${episodes.deletedCount} episodes`);
  //Exit
  process.exit();
};

seedUndo();
