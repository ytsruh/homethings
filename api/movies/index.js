require("dotenv").config();
const controller = require("./controller");

module.exports = async function (context, req) {
  if (req.params.id) {
    await controller.getOne(context, req);
  } else {
    await controller.get(context, req);
  }
};
