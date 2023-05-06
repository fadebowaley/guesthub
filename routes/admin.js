const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Hotel = require("../models/hotel");
const Review = require("../models/review");
const Room = require("../models/room");
const csrf = require("csurf");
const middleware = require("../middleware/confirm");

const csrfProtection = csrf();
router.use(csrfProtection);

/**
 * admin can view all bookings and those order by payments and date
 * admin can allocate rooms  for Customers - later fix
 * admin can edit user account and delete
 *
 */

//1.view all  Hotels if more than one
router.get("/hotels", middleware.isAdmin, async (req, res) => {
  try {
    const successMsg = req.flash("success")[0];
    const errorMsg = req.flash("error")[0];
    const hotels = await Hotel.find({}).populate("reviews").populate("rooms");

        const hotelRoomsCounts = hotels.map((hotel) => ({
          hotelName: hotel.name,
          availableRoomsCount: hotel.rooms.filter((room) => room.available)
            .length,
          unavailableRoomsCount: hotel.rooms.filter((room) => !room.available)
            .length,
        }));
    
    res.render("admin/hotels", {
      hotels,
      hotelRoomsCounts,
      successMsg,
      errorMsg,
      pageName: "Hotel Lists",
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to fetch user data");
    res.redirect("/");
  }
});

// Create a new hotel
router.get("/hotels/new", middleware.isAdmin, (req, res) => {
  const successMsg = req.flash("success")[0];
  const errorMsg = req.flash("error")[0];
  res.render("admin/createHotels", {
    pageName: "Create Hotel",
    successMsg,
    errorMsg,
  });
});

//get Hotel Data and create function
router.post("/hotels/create", middleware.isAdmin, (req, res) => {
  // Get the data
});

router.post("/hotels", middleware.isAdmin, async (req, res) => {
  try {
    const newHotel = await Hotel.create(req.body.hotel);
    req.flash("success", "New hotel created successfully");
    res.redirect("/hotels");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to create new hotel");
    res.redirect("/hotels/new");
  }
});

// Update an existing hotel
router.get("/hotels/:id/edit", middleware.isAdmin, async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    res.render("admin/edit-hotel", {
      hotel,
      pageName: "Edit Hotel",
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to fetch hotel data");
    res.redirect("/hotels");
  }
});

router.put("/hotels/:id", middleware.isAdmin, async (req, res) => {
  try {
    const updatedHotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      req.body.hotel,
      { new: true }
    );
    req.flash("success", "Hotel updated successfully");
    res.redirect("/hotels");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to update hotel");
    res.redirect(`/hotels/${req.params.id}/edit`);
  }
});

// Delete an existing hotel
router.get("/hotels/del/:id", middleware.isAdmin, async (req, res) => {
  try {
    await Hotel.findByIdAndDelete(req.params.id);
    req.flash("success", "Hotel deleted successfully");
    res.redirect("/admin/hotels");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to delete hotel");
    res.redirect("admin/hotels");
  }
});


//1. view all rooms on clicking hotels

router.get("/hotels/:hotelId/rooms", middleware.isAdmin, async (req, res) => {
  try {
    const { hotelId } = req.params;
    const successMsg = req.flash("success")[0];
    const errorMsg = req.flash("error")[0];

    // Find the hotel by ID and populate its rooms and roomtypes
    const hotel = await Hotel.findById(hotelId)
      .populate({
        path: "rooms",
        populate: {
          path: "roomType",
        },
      })
      .populate("roomtypes");

    if (!hotel) {
      return res.status(404).send("Hotel not found");
    }

    // Pagination logic
    const page = parseInt(req.query.page) || 1;
    const limit = 10; // Number of items per page
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const totalResults = hotel.rooms.length;

    const rooms = hotel.rooms.slice(startIndex, endIndex);
    const totalPages = Math.ceil(totalResults / limit);

    // Render the rooms view with the hotel and its rooms and roomtypes
    res.render("admin/hotelRooms", {
      hotel,
      rooms,
      roomtypes: hotel.roomtypes,
      pageName: "Rooms",
      successMsg,
      errorMsg,
      currentPage: page,
      totalPages,
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to fetch room data");
    res.redirect("/");
  }
});






//2. view all available rooms


//.3. view all rooms that expires today


//.4 View job report of crons


//5. crud for new Roomtype 

//6.add rooms to hotel room type


//.7 view all users


//.8 view alll Guests






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
