const mongoose = require("mongoose");
const Episode = require("./Episode");

const ShowSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      min: 2,
      max: 150,
    },
    imageName: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

//Statics are the methods defined on the Model. Methods are defined on the document (instance).
//Docs:https://mongoosejs.com/docs/guide.html#methods
ShowSchema.method("getEpisodes", async function () {
  const showId = this._id;
  const episodes = await Episode.find({
    show: showId,
  });
  return episodes;
});

module.exports = mongoose.model("Show", ShowSchema);
