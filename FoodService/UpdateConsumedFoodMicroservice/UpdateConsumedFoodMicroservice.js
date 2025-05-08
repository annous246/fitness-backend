const express = require("express");
const router = express.Router();

const db = require("../../database/db.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { authenticate, numberChecker, checker } = require("../../utils.js");

router.post("/add", authenticate, async (req, res) => {
  const { id, servings } = req.body;
  if (id && servings) {
    const result = await db.query("SELECT * FROM foods WHERE id=$1", [id]);

    if (result.rowCount > 0) {
      //all good

      const foodObj = result.rows[0];
      console.log(foodObj);
      const next = await db.query(
        "INSERT INTO consumed_foods (id,protein,calories,carbs,portion,servings,name,userid) VALUES($8,$1,$2,$3,$4,$5,$6,$7);",
        [
          foodObj.protein,
          foodObj.calories,
          foodObj.carbs,
          foodObj.portion,
          servings,
          foodObj.name,
          foodObj.userid,
          foodObj.id,
        ]
      );
      if (!next.rowCount) {
        return res.json({
          status: 501,
          ok: 0,
          message: "Internal Error",
        });
      }
      return res.json({
        status: 201,
        ok: 1,
        message: "Consumed successfuly added",
      });
    } else {
      return res.json({
        status: 500,
        ok: 0,
        message: "Internal Error",
      });
    }
  } else {
    return res.json({
      status: 400,
      ok: 0,
      message: "Input Missing / Error",
    });
  }
});

router.post("/reset", authenticate, async (req, res) => {
  const id = req.user.id;
  if (id) {
    const result = await db.query(
      "DELETE  FROM consumed_foods WHERE userid=$1",
      [id]
    );

    if (result.rowCount > 0) {
      //all good

      return res.json({
        status: 201,
        ok: 1,
        message: "Consumed foods Successfully reset",
      });
    } else {
      return res.json({
        status: 500,
        ok: 0,
        message: "Internal Error",
      });
    }
  } else {
    return res.json({
      status: 400,
      ok: 0,
      message: "Input Missing / Error",
    });
  }
});

router.get("/read", authenticate, async (req, res) => {
  const id = req.user.id;
  if (id) {
    const result = await db.query(
      "SELECT * FROM consumed_foods WHERE userid=$1",
      [id]
    );

    if (result.rowCount > 0) {
      //all good
      return res.json({
        status: 201,
        ok: 1,
        data: result.rows,
        message: "Consumed foods pulled",
      });
    } else {
      return res.json({
        status: 500,
        ok: 0,
        message: "Internal Error",
      });
    }
  } else {
    return res.json({
      status: 400,
      ok: 0,
      message: "Input Missing / Error",
    });
  }
});

module.exports = router;
