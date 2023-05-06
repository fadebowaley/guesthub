"use strict";
require("dotenv").config();


const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");
const Hotel = require("./models/hotel");
const {conn} = require("./config/dbb");
var MongoStore = require("connect-mongo")(session);

//schedule cron
// const CronJob = require("cron").CronJob;
// const { checkOutRooms, updateRoomAvailability } = require("./worker/hotelCron");



// mongodb configuration as a global variable
// connectToDatabase();
// connectDB();

const app = express();
require("./config/passport");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(logger("dev"));
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
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Global variables across routes
app.use(async (req, res, next) => {
  try {
    res.locals.currentUrl = req.originalUrl;
    res.locals.login = req.isAuthenticated();
    res.locals.session = req.session;
    res.locals.currentUser = req.user;
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
