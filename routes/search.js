const express = require("express");
const csrf = require("csurf");
const Hotel = require("../models/hotel");
const RoomType = require("../models/roomType");
const Room = require("../models/room");

const router = express.Router();

const csrfProtection = csrf();
router.use(csrfProtection);

// POST route for accepting search form data
router.post("/availability", async (req, res) => {
  // Extract Search parameters from form data
  
  const { checkin, checkout, adults, children, roomNo } = req.body;

   console.log(checkin, checkout, adults, children, roomNo);

  // Redirect to GET route for displaying search results with pagination
  res.redirect(`/search/availability/results?page=1&checkin=${checkin}&checkout=${checkout}&adults=${adults}&children=${children}&roomNo=${roomNo}`);
});

/** 
// GET route for displaying search results with pagination
router.get("/availability/", async (req, res) => {
  // Extract search parameters and pagination parameters from query string or default to page 1

  const { checkin, checkout, adults, children, roomNo } = req.query;
  console.log(checkin, checkout, adults, children, roomNo);

  const perPage = 5;
  const page = parseInt(req.query.page) || 1;

  try {
    // Query the database for available rooms based on search parameters and pagination parameters
    const totalRooms = await Room.countDocuments({
      $or: [{ available: true },
        { checkOut: { $lt: new Date(checkin) } },
        
      ],
    });
    const rooms = await Room.find({
      $or: [{ available: true }, { checkOut: { $lt: new Date(checkin) } }],
    })
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .populate({
        path: "roomType",
        populate: { path: "hotel" },
      });
    
    // Render search results in the search.ejs template with pagination metadata
    res.render("pages/searchPage", {
      rooms,
      checkin,
      checkout, 
      adults,
      children,
      roomNo,
      totalRooms,
      currentPage: page,
      pages: Math.ceil(totalRooms / perPage),
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});
*/

// GET route for displaying search results with pagination
router.get("/availability/", async (req, res) => {
  // Extract search parameters and pagination parameters from query string or default to page 1
  const { checkin, checkout, adults, children, roomNo } = req.query;
  const perPage = 5;
  const page = parseInt(req.query.page) || 1;

  try {
    // Query the database for available rooms based on search parameters and pagination parameters
    const totalRooms = await Room.countDocuments({
      $or: [
        { "roomType.maxNumberAdult": { $gte: parseInt(adults) } },
        { $or: [{ available: true }, { checkOut: { $lt: new Date(checkin) } }] },
      ],
    });
    const rooms = await Room.find({
      $or: [
        { "roomType.maxNumberAdult": { $gte: parseInt(adults) } },
        { $or: [{ available: true }, { checkOut: { $lt: new Date(checkin) } }] },
      ],
    })
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .populate({
        path: "roomType",
        populate: { path: "hotel" },
      });
    
    // Render search results in the search.ejs template with pagination metadata
    res.render("pages/searchPage", {
      rooms,
      checkin,
      checkout, 
      adults,
      children,
      roomNo,
      totalRooms,
      currentPage: page,
      pages: Math.ceil(totalRooms / perPage),
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});



module.exports = router;
