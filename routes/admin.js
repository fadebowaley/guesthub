const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const User = require("../models/user");
const Order = require("../models/order");
const Category = require("../models/category");
const Cart = require("../models/cart");
const csrf = require("csurf");
const middleware = require("../middleware");



const csrfProtection = csrf();
router.use(csrfProtection);


/**
 * admin can view all bookings and those order by payments and date
 * admin can allocate rooms  for Customers - laterfix
 * admin can edit user account and delete 
 *  
 * 
 */


// GET: display the all paymanent Tables 
router.get("/payments", middleware.isNotLoggedIn, async (req, res) => {
  var errorMsg = req.flash("error")[0];
  res.render("user/signin", {
    csrfToken: req.csrfToken(),
    errorMsg,
    pageName: "Sign In",
  });
});


//view all payment as an Admin
router.get("/payment", middleware.isAdmin, async (req, res) => {
  try {
    const users = await User.find({});
    res.render("admin/list", {
      users,
      pageName: "Payment Data",
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to fetch user data");
    res.redirect("/");
  }
});




















module.exports = router;
