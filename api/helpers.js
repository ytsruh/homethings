require("dotenv").config();
const db = require("./db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports = {
  checkAuth: async (req) => {
    try {
      const token = req.headers.token;
      if (!token) {
        return false;
      }
      //Check token is a valid user
      const decoded = jwt.verify(token, process.env.JWTSECRET);
      if (decoded) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.log(err);
      return false;
    }
  },
  decode: async (token) => {
    const decoded = jwt.verify(token, process.env.JWTSECRET);
    return decoded.data.id;
  },
  filterUserData: async (data) => {
    return {
      name: data.name,
      email: data.email,
      darkMode: data.darkMode,
      icon: data.icon,
    };
  },
};