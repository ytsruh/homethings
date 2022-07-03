const mongoose = require("mongoose");
const Movie = require("./models/Movie");
const Show = require("./models/Show");
const Episode = require("./models/Episode");
const User = require("./models/User");

const connect = async () => {
  try {
    await mongoose.connect(process.env.NEXT_PUBLIC_MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.log("MongoDB error");
    console.log(err);
  }
};

connect();

module.exports = {
  Movie,
  Show,
  Episode,
  User,
};
