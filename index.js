const express = require("express");
app = express();
const bp = require("body-parser");
const cors = require("cors");
const http = require("http");
const socketBuilder = require("socket.io");
const server = http.createServer(app);
const io = socketBuilder(server);
const rateLimit = require("express-rate-limit");

const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many Requests, please try again later",
});
const AuthRouter = require("./Authentication_service/auth");
const StarterRouter = require("./Starter_service/starter");
require("dotenv").config();

server.listen(process.env.PORT, () =>
  console.log(`listening on port ${process.env.PORT}`)
);

app.use(bp.urlencoded({ extended: false }));
app.use(bp.json());

app.use(cors());
app.use(express.static("public"));

app.use("/auth", AuthRouter);

app.use("/starter", StarterRouter);
