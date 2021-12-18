const mongoose = require("mongoose");

const EpisodeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      min: 2,
      max: 150,
    },
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Show",
    },
    description: {
      type: String,
      required: true,
      min: 5,
    },
    fileName: {
      type: String,
      required: true,
    },
    seasonNumber: {
      type: Number,
      required: true,
    },
    episodeNumber: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Episode", EpisodeSchema);
