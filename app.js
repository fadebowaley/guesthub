"use strict";
require("dotenv").config();

const cors = require('cors');
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;
const flash = require("connect-flash");
const Cart = require("./models/cart");
const User = require("./models/user");
const {conn} = require("./config/dbb");
var MongoStore = require("connect-mongo")(session);

//schedule cron
// const CronJob = require("cron").CronJob;
// const { checkOutRooms, updateRoomAvailability } = require("./worker/hotelCron");




const app = express();
require("./config/passport");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(logger("dev"));
app.use(cors());
app.use(flash());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
      mongooseConnection:conn,
    }),
    //session expires after 3 hours
    cookie: { maxAge: 60 * 1000 * 60 * 3 },
  })
);


passport.use('local.signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, email, password, done) => {
    try {
        const { title, firstname, lastname, phone } = req.body; // get the firstname and lastname fields from the request body
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return done(null, false, { message: 'Email already exists' });
        }
      const user = new User({
            title,
            firstname,
            lastname,
            email, 
            phone,
            password
        });
      user.setPassword(password);
        await user.save();
        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));


passport.use("local.signin", new LocalStrategy({
  usernameField: "identifier", // use a custom field to accept either email or username
  passwordField: "password",
}, async (identifier, password, done) => {
  try {
    const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] });
    if (!user) {
      return done(null, false, { message: "Invalid email or username" });
    }
    const isMatch = await user.validPassword(password);
    if (!isMatch) {
      return done(null, false, { message: "Incorrect password" });
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));


app.use(passport.initialize());
app.use(passport.session());


// Global variables across routes
app.use(async (req, res, next) => {
  try {
    res.locals.currentUrl = req.originalUrl;
    res.locals.login = req.isAuthenticated();
    res.locals.session = req.session;
    res.locals.currentUser = req.user;

    //update cart items numbers on the bubbles
    let cartItemsCount = 0;
    if (req.user) {
      const cart = await Cart.findOne({ user: req.user._id }).lean();
      //console.log(cart);
      if (cart) {
        cartItemsCount = cart.items.reduce((acc, item) => acc + item.idNo, 0);
        console.log(cartItemsCount);
      }
    } else if (req.session.cart) {
      cartItemsCount = req.session.cart.items.reduce((acc, item) => acc + item.idNo, 0);
    }
    res.locals.cartItemsCount = cartItemsCount;   
    next();
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

//routes config
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/user");
const pagesRouter = require("./routes/pages");
const adminRouter = require("./routes/admin");
const roomRouter = require("./routes/room");
const searchRouter = require("./routes/search");
const bookRouter = require("./routes/bookings");


//use the  routes  configurations declared 
app.use("/", indexRouter);
app.use("/rooms", roomRouter);
app.use("/user", usersRouter);
app.use("/pages", pagesRouter);
app.use("/admin", adminRouter);
app.use("/search", searchRouter);
app.use("/bookings", bookRouter);




// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};



  // render the error page
  res.status(err.status || 500);
  res.render("error");
});



// new CronJob(
//   "0 0 0 * * *",
//   function () {
//     updateRoomAvailability();
//     // run your function here every day at 12:00 AM Lagos time
//   },
//   null,
//   true,
//   "Africa/Lagos"
// );

// updateRoomAvailability();
// checkOutRooms();

// new CronJob(
//   "0 */2 * * * *",
//   function () {
//     updateRoomAvailability();
//     checkOutRooms();
//     // run your function here every 30 minutes
//   },
//   null,
//   true,
//   "Africa/Lagos"
// );

//Checkout guest every 12:00pm
// new CronJob(
//   "0 0 12 * * *",
//   function () {
//     checkOutRooms();
//     // run your function here every day at 12:00 PM Lagos time
//   },
//   null,
//   true,
//   "Africa/Lagos"
// );

const port = process.env.PORT;
app.set("port", port);
app.listen(port, () => {
  console.log("Server running at port " + port);
  const used = process.memoryUsage().heapUsed / 1024 / 1024;
  const max = process.memoryUsage().heapTotal / 1024 / 1024;
  console.log(`Max heap size: ${max} MB  current Heap usage: ${used} MB`);
});



module.exports = app;
