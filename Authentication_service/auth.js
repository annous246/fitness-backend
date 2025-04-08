const express = require("express");
const router = express.Router();
const db = require("../database/db.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { checker } = require("../utils");

const rateLimit = require("express-rate-limit");

const AuthLimiter = rateLimit({
  windowMs: 30000, //each 5 mins,
  max: 10,
  message: "Too many Requests, please try again later",
});

const passwordRegex = /^[a-zA-Z0-9]{8,20}$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const usernameRegex = /^[a-zA-Z0-9]{1,20}$/;

router.post("/sign-up", AuthLimiter, async (req, res) => {
  try {
    // await db.query(`DELETE FROM users ;`);
    const { email, username, password, confirmPassword } = {
      ...req.body,
    };

    console.log("check");
    if (!checker([email, username, password, confirmPassword]))
      return res.json({ ok: 0, message: "Input Error", status: "404" });

    if (!usernameRegex.test(username))
      return res.json({
        ok: 0,
        message: "Username is Alphanumeric between 1 and 20 characters",
        status: "400",
      });

    if (!emailRegex.test(email))
      return res.json({
        ok: 0,
        message: "Email Format Is wrong",
        status: "400",
      });

    if (!passwordRegex.test(password))
      return res.json({
        ok: 0,
        message:
          "Password Alphanumeric contains symbols between 8 and 20 characters",
        status: "400",
      });

    if (password != confirmPassword)
      return res.json({
        ok: 0,
        message: "Passwords Dont Match",
        status: "400",
      });

    //db check
    const emailResult = await db.query("SELECT * FROM users WHERE email=$1;", [
      email,
    ]);
    const usernameResult = await db.query(
      "SELECT * FROM users WHERE username=$1;",
      [username]
    );
    const emailRows = emailResult.rows;
    const usernameRows = usernameResult.rows;
    if (usernameRows.length > 0) {
      return res.json({
        ok: 0,
        message: "Username Already Taken",
        status: "400",
      });
    }

    if (emailRows.length > 0) {
      return res.json({
        ok: 0,
        message: "Email Already Exists",
        status: "400",
      });
    }

    //good to go

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertionResult = await db.query(
      `INSERT INTO users (username,email,password) VALUES ($1,$2,$3)`,
      [username, email, hashedPassword]
    );
    console.log(req.body);
    if (insertionResult.rowCount > 0) {
      console.log("done");
      return res.json({
        ok: 1,
        message: "Success ",
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
    console.log(e.message + " -> " + e.stack);

    return res.json({
      ok: 0,
      message: "Internal Error",
      status: "500",
    });
  }
});

router.post("/sign-in", AuthLimiter, async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!checker([email, password]))
    return res.json({
      status: 400,
      ok: 0,
      message: "Input Error",
    });

  const result = await db.query("SELECT * FROM users WHERE email=$1", [email]);
  const rows = result.rows;
  if (!rows.length)
    return res.json({
      status: 300,
      ok: 0,
      message: "Email Not Registered , Please Proceed to Register",
    });
  const user = rows[0];

  const check = await bcrypt.compare(password, user.password);

  if (!check)
    return res.json({
      status: 400,
      ok: 0,
      message: "Wrong Password",
    });

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    process.env.JWT_SECRET,
    { expiresIn: "10h" }
  );

  return res.json({
    status: 200,
    ok: 1,
    data: {
      token: token,
      user: { id: user.id, email: user.email, username: user.username },
    },
    message: "Logged In Successfully",
  });
});

function authenticate(req, res, next) {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token)
    return res.json({ status: 400, ok: 0, message: "Session Expired" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.json({ status: 400, ok: 0, message: "Session Expired" });
    }
    req.user = user;
    next();
  });
}

module.exports = router;
