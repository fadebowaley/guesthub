const express = require("express");
const csrf = require("csurf");
// const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
const Product = require("../models/product");
const Hotel = require("../models/hotel");
const RoomType = require("../models/roomType");
const Cart = require("../models/cart");
const Order = require("../models/order");
const db = require("../config/dbb");
const middleware = require("../middleware/confirm");
const router = express.Router();

const csrfProtection = csrf();
router.use(csrfProtection);




// Hotel front Page
router.get("/", async (req, res) => {
  try {
    const hotels = await Hotel.find({}).populate("roomtypes");
    const successMsg = req.flash("success")[0];
    const errorMsg = req.flash("error")[0];
    const featureIcons = {
  "TV": "fal fa-tv-retro",
  "Free Wifi": "fal fa-wifi",
  "Air Condition": "fal fa-air-conditioner",
  "Heater": "fal fa-dumpster-fire",
  "Phone": "fal fa-phone-rotary",
  "Laundry": "fal fa-dryer-alt",
  "Adults": "fal fa-user",
  "Size": "fal fa-square",
  "Bed Type": "fal fa-bed"
};
    res.render("pages/_index", {
      hotels, featureIcons, csrfToken: req.csrfToken(),
    successMsg, errorMsg});
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

router.get("/activate-your-account", async (req, res, next) => {
  try {   
     const successMsg = req.flash("success")[0];
     const errorMsg = req.flash("error")[0];
      res.render("user/confirm", { successMsg, errorMsg, csrfToken: req.csrfToken() });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});


//routes to display Hotel Data and all its associated routes
router.get("/hotels/:id/roomtypes", middleware.emailVerified, async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id).populate("roomtypes");
    const roomTypes = hotel.roomtypes;
    res.render("pages/rooms", { roomTypes, hotelName: hotel.name });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});



module.exports = router;
