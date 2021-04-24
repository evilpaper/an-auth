// Import the Express library
const express = require("express");

// Import body parser, a Node.js middleware, make request bodies available under req.body property
const bodyParser = require("body-parser");

// Import path, provides utilities for working with files and directory paths
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Define an Express application
const app = express();

// Create a binding for the port we will use
const port = 3000;

const models = require("./models");

const settings = require("./settings");
const sessions = require("client-sessions");

mongoose.connect("mongodb://localhost/an-auth");

// let User =

app.set("view engine", "pug");
app.set("staticDirectory", path.join(__dirname, "static"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use("/static", express.static(app.get("staticDirectory")));
app.use(
  sessions({
    cookieName: "session",
    secret: settings.SESSION_SECRET_KEY,
    duration: settings.SESSION_DURATION,
  })
);
app.use((req, res, next) => {
  if (!(req.session && req.session.userId)) {
    return next();
  }

  models.User.findById(req.session.userId, (err, user) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return next();
    }

    user.password = undefined;

    req.user = user;
    res.locals.user = user;

    next();
  });
});

function loginRequired(req, res, next) {
  if (!req.user) {
    return res.redirect("/login");
  }

  next();
}

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  let hash = bcrypt.hashSync(req.body.password, 14);
  req.body.password = hash;

  let user = new models.User(req.body);

  user.save((err) => {
    if (err) {
      let error = "Darn, couldn't create an account. Please try again.";

      if (err.code === 11000) {
        error = "Snap, sorry, email is already taken, please try another.";
      }
      return res.render("register", { error: error });
    }
    res.redirect("/dashboard");
  });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  models.User.findOne({ email: req.body.email }, (err, user) => {
    if (err || !user || !bcrypt.compareSync(req.body.password, user.password)) {
      return res.render("login", {
        error: "Sorry, don't recongnise email or password",
      });
    }
    req.session.userId = user._id;
    res.redirect("/dashboard");
  });
});

app.get("/dashboard", loginRequired, (req, res, next) => {
  res.render("dashboard", { user: req.user });
});

app.post("/dashboard", function (req, res, next) {
  req.session.reset();
  res.redirect("/login");
});

// Tell Espress to start a web server on the port we defined earlier
app.listen(port, () => {
  console.log(
    "\n" + "\x1b[36m%s\x1b[0m",
    "The server is listening to port " + port + "\n"
  );
});
