// Import the Express library
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");

// Define an express application
const app = express();

// Create a binding for the port we will use
const port = 3000;

mongoose.connect("mongodb://localhost/an-auth");

let User = mongoose.model(
  "User",
  new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  })
);

app.set("view engine", "pug");
app.set("staticDirectory", path.join(__dirname, "static"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use("/static", express.static(app.get("staticDirectory")));

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  let user = new User(req.body);

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
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err || !user || req.body.password !== user.password) {
      return res.render("login", {
        error: "Incorrect email / password.",
      });
    }
    res.redirect("/dashboard");
  });
});

app.get("/dashboard", (req, res) => {
  res.render("dashboard");
});

// Tell Espress to start a web server on the port we defined earlier
// so we can run it locally and play around with it.
app.listen(port, () => {
  console.log("");
  console.log("The server is listening to port " + port);
  console.log("");
});
