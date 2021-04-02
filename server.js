// Import the Express library
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

// Define an express application
const app = express();

// Create a binding for the port we will use
const port = 3000;

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
  res.json(req.body);
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/dashboard", (req, res) => {
  res.render("dashboard");
});

// Tell Espress to start a web server on the port we defined earlier
// so we can run it locally and play around with it.
app.listen(port, () => {
  console.log("The server is listening to port " + port);
  console.log("");
});
