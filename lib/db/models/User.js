const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      min: 2,
      max: 150,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      min: 6,
    },
    icon: {
      type: String,
      default: "BsFillEmojiSmileUpsideDownFill",
    },
    darkMode: {
      type: String,
      default: "system",
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", function (next) {
  // Cannot use arrow function. Arrow functions use lexical 'this'
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions
  // 'this' refers to the document.
  console.log(this);
  const salt = bcrypt.genSaltSync();
  this.password = bcrypt.hashSync(this.password, salt);
  next();
});

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
