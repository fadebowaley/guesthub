const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const User = require("../models/user");
const Hotel = require("../models/hotel");
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
 */



//1. Create Hotels -create, Read, update and Delete
router.get("/hotels", middleware.isAdmin, async (req, res) => {
  try {
    const hotels = await Hotel.find({});
    res.render("admin/hotels", {
      hotels,
      pageName: "Hotel Lists",
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to fetch user data");
    res.redirect("/");
  }
});


// Create a new hotel
router.get('/hotels/new', middleware.isAdmin, (req, res) => {
  res.render('admin/new-hotel', { pageName: 'Create Hotel' });
});

router.post('/hotels', middleware.isAdmin, async (req, res) => {
  try {
    const newHotel = await Hotel.create(req.body.hotel);
    req.flash('success', 'New hotel created successfully');
    res.redirect('/hotels');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to create new hotel');
    res.redirect('/hotels/new');
  }
});

// Update an existing hotel
router.get('/hotels/:id/edit', middleware.isAdmin, async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    res.render('admin/edit-hotel', {
      hotel,
      pageName: 'Edit Hotel',
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to fetch hotel data');
    res.redirect('/hotels');
  }
});

router.put('/hotels/:id', middleware.isAdmin, async (req, res) => {
  try {
    const updatedHotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      req.body.hotel,
      { new: true }
    );
    req.flash('success', 'Hotel updated successfully');
    res.redirect('/hotels');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to update hotel');
    res.redirect(`/hotels/${req.params.id}/edit`);
  }
});


// Delete an existing hotel
router.delete("/hotel/delete/:id", middleware.isAdmin, async (req, res) => {
  try {
    console.log(req.params.id);
    await Hotel.findByIdAndDelete(req.params.id);
    req.flash("success", "Hotel deleted successfully");
    res.redirect("/admin/hotels");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to delete hotel");
    res.redirect("/admin/hotels");
  }
});




//Get customers
router.get("/customers", middleware.isAdmin, async (req, res) => {
  var errorMsg = req.flash("error")[0];
  res.render("admin/customers", {
    errorMsg,
    pageName: "customers",
  });
});

//Get DashBoards
router.get("/dashboard", middleware.isAdmin, async (req, res) => {
  var errorMsg = req.flash("error")[0];
  res.render("admin/dashboard", {
    errorMsg,
    pageName: "Dashboard",
  });
});

//Get DashBoards
router.get("/setup", middleware.isAdmin, async (req, res) => {
  var errorMsg = req.flash("error")[0];
  res.render("admin/setup", {
    errorMsg,
    pageName: "Dashboard",
  });
});



//2. create RoomTypes from Hotels - create, Read, update and Delete
//3. create Rooms from RoomTypes - create, Read, update and Delete[Multiple, one]
//4. create Reviews by users - create, Read, update and Delete
//5. Carting System 

// GET: display the all paymanent Tables 
router.get("/payments", middleware.isNotLoggedIn, async (req, res) => {
  var errorMsg = req.flash("error")[0];
  res.render("user/signin", {
    csrfToken: req.csrfToken(),
    errorMsg,
    pageName: "Users Payment",
  });
});


//view all users as an Admin
router.get("/users", middleware.isAdmin, async (req, res) => {
  try {
    const users = await User.find({});
    res.render("admin/list", {
      users,
      pageName: "User Lists",
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to fetch user data");
    res.redirect("/");
  }
});




















module.exports = router;
