const formValidation = require("../validation/formValidation");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const passport = require("passport");

require("../authentication/passport/local")

module.exports.getUserLogin = (req, res, next) => {
  res.render("pages/login");
};

module.exports.getUserLogout = (req, res, next) => {
    req.logout();
    req.flash("success", "Successfully Logout");
    res.redirect("/login");
  };

module.exports.getUserRegister = (req, res, next) => {
  res.render("pages/register");
};

module.exports.postUserLogin = (req, res, next) => {
  //res.send("login attempted");

  //req.flash("error")
  //req.flash("success")
  passport.authenticate("local",{
      successRedirect: "/",
      failureRedirect: "/login",
      failureFlash: true,
      successFlash: true
  })(req,res,next);
};

module.exports.postUserRegister = (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  const errors = [];

  const validationErrors = formValidation.registerValidation(
    username,
    password
  );

  //Server-side validation
  if (validationErrors.length > 0) {
    return res.render("pages/register", {
      username: username,
      password: password,
      errors: validationErrors,
    });
  }
  User.findOne({ username })
    .then((user) => {
      if (user) {
        //Email validation
        errors.push({ message: "User already in use" });
        return res.render("pages/register", {
          username,
          password,
          errors,
        });
      }

      bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(password, salt, function (err, hash) {
          // Store hash in your password DB.
          if (err) throw err;

          const newUser = new User({
            username : username,
            password : hash
          });
          newUser
            .save()
            .then(() => {
              console.log("successfully");
              req.flash('flashSuccess', 'successfully registered')
              res.redirect("/");
            })
            .catch((err) => {
              console.log(err);
            });
        });
      });
    })
    .catch((err) => console.log(err));
};
