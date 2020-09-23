const express = require("express");
const exphbs = require("express-handlebars");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const User = require("./models/User");
const flash = require("connect-flash");
const session = require("express-session");
const coocieParser = require("cookie-parser");
const passport = require("passport");

const userRouter = require("./routes/users");

const app = express();
const PORT = 5000 || process.env.PORT;

//Flash Middlewares
app.use(coocieParser("passporTutorial"));
app.use(
  session({
    cookie: { maxAge: 60000 },
    resave: true,
    secret: "passporTutorial",
    saveUninitialized: true,
  })
);
app.use(flash());
//Passport Initiliaze - Middleware
app.use(passport.initialize());
app.use(passport.session());

//Global - Res.Locals - Middleware
app.use((req, res, next) => {
  //Our own flash
  res.locals.flashSuccess = req.flash("flashSuccess");
  res.locals.flashError = req.flash("flashError");

  //passport flash
  res.locals.passportFailure = req.flash("error");
  res.locals.passportSuccess = req.flash("success");

  //our logged in user
  res.locals.user = req.user;

  next();
});

//mongoDb Connection
mongoose.connect("mongodb://localhost/passportdb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection Error"));
db.once("open", () => {
  console.log("Connected to Database");
});

//Template Engine Middleware
app.engine("handlebars", exphbs({ defaultLayout: "mainLayout" }));
app.set("view engine", "handlebars");

//Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));

//Rouer Middleware

app.use(userRouter);

app.get("/", (req, res, next) => {
  User.find({}) //Get Users
    .lean()
    .then((users) => {
      res.render("pages/index", {
        users,
        flashSuccess: req.flash("flashSuccess"),
      });
    })
    .catch((err) => console.log(err));
});

app.use((req, res, next) => {
  res.render("static/404");
});

app.listen(PORT, () => {
  console.log("started");
});
