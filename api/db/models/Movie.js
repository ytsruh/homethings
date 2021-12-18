const mongoose = require("mongoose");

const MovieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      min: 2,
      max: 150,
    },
    description: {
      type: String,
      required: true,
      min: 5,
    },
    duration: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    imageName: {
      type: String,
      required: true,
    },
    releaseYear: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Movie", MovieSchema);
