require("dotenv").config();
const db = require("../db");
const controller = require("./controller");

module.exports = async function (context, req) {
  if (req.method === "POST") {
    await controller.post(context, req);
  } else {
    await controller.get(context, req);
  }
};
