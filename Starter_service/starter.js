const express = require("express");
const router = express.Router();
const db = require("../database/db.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const rateLimit = require("express-rate-limit");
const { authenticate } = require("../utils.js");

const AuthLimiter = rateLimit({
  windowMs: 30000, //each 5 mins,
  max: 100,
  message: "Too many Requests, please try again later",
});

router.post(
  "/stepper_finished",
  authenticate,
  AuthLimiter,
  async (req, res) => {
    console.log("here");
    try {
      const { age, height, weight } = req.analytics;
      const user = req.user;
      if (!checker([age, height, weight])) {
        return res.json({
          ok: 0,
          message: "Input Error",
          status: "400",
        });
      }
      age = parseInt(age);
      weight = parseInt(weight);
      height = parseInt(height);
      if (isNaN(age) || isNaN(height) || isNaN(weight)) {
        return res.json({
          ok: 0,
          message: "Input Error",
          status: "400",
        });
      }
      if (
        age > 200 ||
        age < 0 ||
        weight > 1000 ||
        weight < 0 ||
        height > 1000 ||
        height < 0
      ) {
        return res.json({
          ok: 0,
          message: "Input Error",
          status: "400",
        });
      }
      //all good
      const result = await db.query(
        "UPDATE users SET age=$3,weight=$2,height=$1,stepper=$5 WHERE email=$4;",
        [height, weight, age, user.email, false]
      );
      if (result.rowCount > 0) {
        //success
        return res.json({
          ok: 1,
          message: "Steppers Done Successfully",
          status: "200",
        });
      } else {
        return res.json({
          ok: 0,
          message: "Internal Error",
          status: "500",
        });
      }
    } catch (e) {
      return res.json({
        ok: 0,
        message: "Internal Error",
        status: "500",
      });
    }
  }
);

module.exports = router;
