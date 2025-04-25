const express = require("express");
const router = express.Router();
const db = require("../database/db.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const rateLimiter = require("express-rate-limit");
const { authenticate, numberChecker, checker } = require("../utils.js");

const FoodAddLimiter = rateLimiter({
  windowMs: 30000, //each 5 mins,
  max: 10,
  message: "Too many Requests, please try again later",
});
//add

router.post("/create", authenticate, async (req, res) => {
  try {
    console.log("food create");
    const { kcal, protein, carbs, name, portion } = req.body;
    const id = req.user.id;
    if (
      !checker([name]) ||
      !numberChecker([kcal, protein, carbs, portion]) ||
      kcal < 0 ||
      protein < 0 ||
      carbs < 0 ||
      portion < 0
    ) {
      return res.json({
        status: 400,
        ok: 0,
        message: "Input Missing / Error",
      });
    }
    const result = await db.query(
      "INSERT INTO foods (calories,protein,carbs,name,userid,portion) VALUES($1,$2,$3,$4,$5,$6);",
      [kcal, protein, carbs, name, id, portion]
    );
    if (result.rowCount > 0) {
      //all good
      return res.json({
        status: 200,
        ok: 1,
        message: `${name} Successfully Added`,
      });
    } else {
      return res.json({
        status: 500,
        ok: 0,
        message: "Server Error",
      });
    }
  } catch (e) {
    console.log(e.message + " " + e.stack);
    return res.json({
      status: 500,
      ok: 0,
      message: "Server Error",
    });
  }
});

router.get("/read", authenticate, async (req, res) => {
  try {
    console.log("food get");

    const id = req.user.id;
    console.log(id);
    const result = await db.query("SELECT * FROM foods WHERE userId=$1", [id]);
    ///console.log(result.rows.length);
    if (result.rowCount > 0) {
      //all good
      console.log(result);

      return res.json({
        status: 201,
        ok: 1,
        data: result.rows,
        message: `food Successfully Pulled`,
      });
    } else {
      return res.json({
        status: 500,
        ok: 1,
        message: "Internal Error",
      });
    }
  } catch (e) {
    console.log(e.message + " " + e.stack);
    return res.json({
      status: 500,
      ok: 0,
      message: "Server Error",
    });
  }
});
router.get("/delete", async (req, res) => {});
router.get("/update", async (req, res) => {});
module.exports = router;
