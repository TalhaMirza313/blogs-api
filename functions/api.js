const express = require("express");
const mongoose = require("mongoose");
const routesEvent = require("../models/user");
const routesBlog = require("../models/blog");
const serverless = require("serverless-http");
const router = express.Router();
const jwt = require("jsonwebtoken");
const SECRET_KEY = "your_secret_key";
const jsConvert = require("js-convert-case");

const app = express();

app.use(express.json());

const dbURL =
  "mongodb+srv://talhamirza1453:talha1453@learningios.aralt.mongodb.net/LearningIOS?retryWrites=true&w=majority";

mongoose
  .connect(dbURL)
  .then((result) => {
    console.log("Connected  MongoDB");
    app.listen(3000, () => {
      console.log("Server started on port 3000");
    });
  })
  .catch((err) => {
    console.error("Could not connect to MongoDB:", err);
  });

app.post("/registerUser", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ msg: "All fields are required" });
    }
    const data = await routesEvent.create({
      username: username,
      email: email,
      password: password,
      role: role,
    });

    res.status(201).json({
      msg: "User created Successfully",
      data: {
        username: data.username,
        email: data.email,
        password: data.password,
        role: data.role,
      },
    });
  } catch (error) {
    res.status(400).json({
      msg: "error not registered",
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ msg: " username and password are required" });
    }

    const paramCaseUsername = jsConvert.toLowerCase(username);

    // Query the database for the converted username
    const user = await routesEvent.findOne({ username: paramCaseUsername });

    if (!username) {
      return res.status(404).json({ msg: "User not found" });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      msg: "User login Successfully",
      token,

      data: {
        username: user.username,
        password: user.password,
      },
    });
  } catch (error) {
    res.status(400).json({
      msg: "error not loggined.",
    });
  }
});

router.post("/createBlog", async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ msg: "title and content are required" });
    }
    const data = await routesBlog.create({
      title: title,
      content: content,
    });

    res.status(201).json({
      msg: "blog created Successfully",
      data: {
        title: data.title,
        content: data.content,
      },
    });
  } catch (error) {
    res.status(400).json({
      msg: "blog not registered",
    });
  }
});

router.get("/fetch", async (req, res) => {
  try {
    const data = await routesBlog.find();
    res.status(201).json(data);
  } catch (error) {
    res.status(400).status({
      msg: "no data found",
    });
  }
});

app.use("/.netlify/functions/api", router);

module.exports.handler = serverless(app);
