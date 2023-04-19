const express = require("express");
const router = express.Router();
const Room = require("../models/room");
const Category = require("../models/category");
var moment = require("moment");

// GET: display all rooms
router.get("/", async (req, res) => {
  const successMsg = req.flash("success")[0]; // get success flash message
  const errorMsg = req.flash("error")[0]; // get error flash message
  const perPage = 8; // set the number of rooms to display per page
  let page = parseInt(req.query.page) || 1; // get the current page number or set to 1 if not provided

  try {
    // Find all rooms, sort them by creation date (newest first), and limit to the number of rooms to display per page
    const rooms = await Room.find({})
      .sort("-createdAt")
      .skip(perPage * page - perPage)
      .limit(perPage)
      .populate("category"); // populate the category field with the related category document

    // Get the total number of rooms
    const count = await Room.count();

    // Render the rooms index page with the room data, pagination information, and flash messages
    res.render("rooms/index", {
      pageName: "All Rooms", // set the page title
      rooms, // pass the room data to the view
      successMsg, // pass the success flash message to the view
      errorMsg, // pass the error flash message to the view
      current: page, // pass the current page number to the view
      breadcrumbs: null, // set the breadcrumbs to null
      home: "/rooms/?", // set the home page link
      pages: Math.ceil(count / perPage), // calculate the total number of pages needed for pagination and pass to the view
    });
  } catch (error) {
    console.log(error);
    res.redirect("/"); // if an error occurs, redirect to the home page
  }
});

//GET: get a certain category by its slug (this is used for the categories navbar)
router.get("/:slug", async (req, res) => {
  const successMsg = req.flash("success")[0];
  const errorMsg = req.flash("error")[0];
  const perPage = 8;
  let page = parseInt(req.query.page) || 1;
  try {
    const foundCategory = await Category.findOne({ slug: req.params.slug });
    const allRooms = await Room.find({ category: foundCategory.id })
      .sort("-createdAt")
      .skip(perPage * page - perPage)
      .limit(perPage)
      .populate("category");

    const count = await Room.count({ category: foundCategory.id });

    res.render("room/index", {
      pageName: foundCategory.title,
      currentCategory: foundCategory,
      rooms: allRooms,
      successMsg,
      errorMsg,
      current: page,
      breadcrumbs: req.breadcrumbs,
      home: "/rooms/" + req.params.slug.toString() + "/?",
      pages: Math.ceil(count / perPage),
    });
  } catch (error) {
    console.log(error);
    return res.redirect("/");
  }
});



module.exports = router;