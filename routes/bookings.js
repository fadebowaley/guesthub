const express = require("express");
const csrf = require("csurf");
const Hotel = require("../models/hotel");
const RoomType = require("../models/roomType");
const Room = require("../models/room");


const middleware = require("../middleware/confirm");
const router = express.Router();

const csrfProtection = csrf();
router.use(csrfProtection);


//Manage all the bookings and payments

router.get(
  "/new/:id/reservation",
  middleware.isLoggedIn,
  middleware.emailVerified,
  (req, res) => {
    const errorMsg = req.flash("error")[0];
    const successMsg = req.flash("success")[0];
    res.render("bookings/book", {
      csrfToken: req.csrfToken(),
      errorMsg,
      successMsg,
      pageName: "Reset Password",
    });
  }
);


router.get("/new/:id/checkout", middleware.isLoggedIn, (req, res) => {
  const errorMsg = req.flash("error")[0];
  const successMsg = req.flash("success")[0];



  
  res.render("bookings/cart", {
    csrfToken: req.csrfToken(),
    errorMsg,
    successMsg,
    pageName: "Reset Password",
  });
});






module.exports = router;
