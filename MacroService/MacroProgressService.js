const express = require("express");
const router = express.Router();

const db = require("../database/db.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { authenticate, numberChecker, checker } = require("../utils.js");

router.get("/read", authenticate, async (req, res) => {
  try {
    const id = req.user.id;
    console.log(id);
    const result = await db.query("SELECT * FROM users WHERE id=$1", [id]);
    ///console.log(result.rows.length);
    if (result.rowCount > 0) {
      //all good
      console.log(result);
      console.log(result.rows[0]);
      return res.json({
        status: 201,
        ok: 1,
        data: {
          calories_progress: result.rows[0].calories_progress,
          carbs_progress: result.rows[0].carbs_progress,
          protein_progress: result.rows[0].protein_progress,
        },
        message: `progress Successfully Pulled`,
      });
    } else {
      return res.json({
        status: 500,
        ok: 0,
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
router.post("/update_progress", authenticate, async (req, res) => {
  try {
    const { calories, carbs, protein } = req.body;
    const id = req.user.id;
    if (
      calories != undefined &&
      numberChecker([calories]) &&
      id &&
      calories > -1 &&
      carbs != undefined &&
      numberChecker([carbs]) &&
      id &&
      carbs > -1 &&
      protein != undefined &&
      numberChecker([protein]) &&
      id &&
      protein > -1
    ) {
      const result = await db.query(
        "UPDATE users SET calories_progress=calories_progress+$1,carbs_progress=carbs_progress+$3,protein_progress=protein_progress+$4 WHERE id=$2",
        [calories, id, carbs, protein]
      );
      if (result.rowCount > 0) {
        return res.json({
          status: 201,
          ok: 1,
          message: "macros Updated",
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
  } catch (e) {
    console.log(e.message + " " + e.stack);
  }
});
module.exports = router;
