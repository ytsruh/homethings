require("dotenv").config();
const fs = require("fs");
const path = require("path");
const excelToJson = require("convert-excel-to-json");
const db = require("./");
const bcrypt = require("bcrypt");

const movies = excelToJson({
  source: fs.readFileSync(path.resolve(__dirname, "./data/movies.xlsx")),
  //Identify header row and exclude from data
  header: {
    rows: 1,
  },
  //Map the headers to object keys
  columnToKey: {
    A: "title",
    D: "description",
    F: "duration",
    H: "fileName",
    J: "imageName",
    L: "releaseYear",
  },
});
const shows = excelToJson({
  source: fs.readFileSync(path.resolve(__dirname, "./data/shows.xlsx")),
  //Identify header row and exclude from data
  header: {
    rows: 1,
  },
  //Map the headers to object keys
  columnToKey: {
    A: "title",
    D: "imageName",
  },
});
const episodes = excelToJson({
  source: fs.readFileSync(path.resolve(__dirname, "./data/episodes.xlsx")),
  //Identify header row and exclude from data
  header: {
    rows: 1,
  },
  //Map the headers to object keys
  columnToKey: {
    A: "title",
    D: "show",
    F: "description",
    H: "fileName",
    J: "episodeNumber",
    L: "seasonNumber",
  },
});

const createUser = async () => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(process.env.USER_PASSWORD, salt);
  const user = {
    email: process.env.USER_EMAIL,
    name: process.env.USER_NAME,
    password: hashedPassword,
  };
  return user;
};

const seed = async () => {
  const queryUsers = await db.User.find();
  const queryMovies = await db.Movie.find();
  const queryShows = await db.Show.find();
  const queryEpisodes = await db.Episode.find();
  //Check Users
  if (queryUsers.length > 0) {
    console.log("Completed : No action taken as Users already exist");
  } else {
    const user = await createUser();
    const saveUser = await db.User.create(user);
    console.log(`Completed: Seed user inserted into Database`);
  }
  //Check Movies
  if (queryMovies.length > 0) {
    console.log("Completed : No action taken as Movies already exist");
  } else {
    const saveMovies = await db.Movie.insertMany(movies.movies);
    console.log(`Completed: ${saveMovies.length} movies inserted into Database`);
  }
  //Check Shows
  if (queryShows.length > 0) {
    console.log("Completed : No action taken as Shows already exist");
  } else {
    const saveShows = await db.Show.insertMany(shows.shows);
    console.log(`Completed: ${saveShows.length} shows inserted into Database`);
  }
  //Check Episodes
  if (queryEpisodes.length > 0) {
    console.log("Completed : No action taken as Episodes already exist");
  } else {
    const saveEpisodes = await db.Episode.insertMany(episodes.episodes);
    console.log(`Completed: ${saveEpisodes.length} episodes inserted into Database`);
  }
  process.exit();
};

seed();
