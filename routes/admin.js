const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Hotel = require("../models/hotel");
const RoomType = require("../models/roomType");
const Review = require("../models/review");
const Room = require("../models/room");
const csrf = require("csurf");
const middleware = require("../middleware/confirm");


const multer = require("multer");
const upload = multer({ dest: "public/images" });

const fs = require('fs');
const path = require('path');


const csrfProtection = csrf();
router.use(csrfProtection);

const { Types } = require('mongoose');



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


// GET Create a new hotel
router.get("/hotels/new", middleware.isAdmin, (req, res) => {
  const successMsg = req.flash("success")[0];
  const errorMsg = req.flash("error")[0];
  res.render("admin/createHotels", {
    pageName: "Create Hotel",
    successMsg,
    errorMsg,
    csrfToken: req.csrfToken(),
  });
});


router.post("/create-hotel", middleware.isAdmin, async (req, res) => {
  try {

    console.log(req.body);

    const newHotel = await Hotel.create(req.body);

    req.flash("success", "New hotel created successfully");
    // Redirect or send a success response

    res.json({
      success: true,
      message: "Hotels created successfully",
      redirectUrl: `/admin/hotels`,
    });
  

  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to create new hotel");
    res.redirect("/admin/hotels/new");
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
    const hotelId = req.params.id;

    // Delete associated rooms
    await Room.deleteMany({ hotel: hotelId });

    // Delete associated room types
    await RoomType.deleteMany({ hotel: hotelId });

    // Delete the hotel itself
    await Hotel.findByIdAndDelete(hotelId);

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


// Route: GET /admin/walkin/:hotelId
router.get("/walkin/:hotelId/bookings/", async (req, res) => {
  try {
    const { hotelId } = req.params;

  // Fetch the selected hotel and populate the "rooms" and "roomtypes" fields
    const hotels = await Hotel.findById(hotelId)
      .populate({
        path: "rooms",
        populate: {
          path: "roomType",
          model: "RoomType"
        }
      })
      .populate("roomtypes");

      
       if (!hotels) {
      return res.status(404).json({ message: "Hotel not found" });
    }

      // Prepare an array to hold the room type information
    const roomTypeData = [];

    // Iterate over each room type in the hotel
    for (const roomType of hotels.roomtypes) {
      const { name, price } = roomType;
      const totalRooms = hotels.rooms.filter(room => room.roomType._id.equals(roomType._id)).length;
      const availableRooms = hotels.rooms.filter(room => room.roomType._id.equals(roomType._id) && room.available).length;
      const unavailableRooms = totalRooms - availableRooms;

      // Add the room type information to the array
      roomTypeData.push({
        name,
        price,
        totalRooms,
        availableRooms,
        unavailableRooms
      });
    }

    // Log the room type data
    res.render("admin/walkin", {
      hotels,
      roomTypeData,
      pageName:"Bookings Page"
    
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});


/**
 * Below routes view all Rooms based on a roomType
 * lock and Unlock a Room
 * Delete and Create a New Room
 * 
 */

//3. display rooms based on roomtypes
router.get("/roomtypes/:hotelId/rooms/:roomType", middleware.isAdmin, async (req, res) => {
  try {
    const successMsg = req.flash("success")[0];
    const errorMsg = req.flash("error")[0];

    const hotel = await Hotel.findById(req.params.hotelId)
      .populate({
        path: "rooms",
        populate: {
          path: "roomType",
          model: "RoomType",
        },
      });

    
    // console.log("All Hotels " + hotel);
    const roomTypeId = req.params.roomType;
    const filteredRooms = hotel.rooms.filter(room => room.roomType._id.toString() === roomTypeId); 


    // Pagination logic
    const page = parseInt(req.query.page) || 1;
    const limit = 10; // Number of items per page
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const totalResults = filteredRooms.length;

    const rooms = filteredRooms.slice(startIndex, endIndex);
    const totalPages = Math.ceil(totalResults / limit);

    const roomTypeName = filteredRooms.length > 0 ? filteredRooms[0].roomType.name : 'Page Name';

    
    res.render("admin/hotelRooms2", {
      rooms,
      pageName: roomTypeName,
      hotelName: hotel.name,
      currentPage: page,
      totalPages,
      successMsg,
      errorMsg,
      hotelId: req.params.hotelId,
      roomType: req.params.roomType
    
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to fetch room data");
    res.redirect(`/roomtypes/${req.params.hotelId}`);
  }
});


// Get all available rooms based on selected room type
router.get("/rooms/:roomTypeId", async (req, res) => {
  try {
    const { roomTypeId } = req.params;
    const availableRooms = await Room.find({ roomType: roomTypeId, available: true });
    res.json(availableRooms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});


//functions Lock rooms, deleterooms TODO edit rooms available rooms
router.get("/:hotelId/:roomTypeId/:roomId/lock", middleware.isAdmin, async (req, res) => {
  try {

    const roomId = req.params.roomId;
    // Find the room by ID
    const room = await Room.findById(roomId);

    if (!room) {
      req.flash("error", "Room not found");
      return res.redirect(`/admin/roomtypes/${req.params.hotelId}/rooms/${req.params.roomTypeId}`);
      
    }
    
    if (!room.lock) {      
      // Set the room.lock property to true
      room.lock = true;
      room.available = false;
      // Save the changes to the room
      await room.save();  
      // Redirect or render appropriate success response
      req.flash("success", "Room locked successfully");
    } else {
      // Set the room.lock property to true
      room.lock = false;
      room.available = true;
      // Save the changes to the room
      await room.save();
      // Redirect or render appropriate success response
      req.flash("success", "Room unlocked successfully");

      
    }

    res.redirect(`/admin/roomtypes/${req.params.hotelId}/rooms/${req.params.roomTypeId}`); // Redirect to the admin dashboard or appropriate page

    // Redirect or render appropriate response
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to lock the room");
    res.redirect(`/admin/roomtypes/${req.params.hotelId}/rooms/${req.params.roomTypeId}`); // Redirect to the admin dashboard or appropriate page

  }
});


//2. delete a room by Id
router.get("/:hotelId/:roomTypeId/:roomId/delete", middleware.isAdmin, async (req, res) => {
  try {
    const roomId = req.params.roomId;
    // Find the room by ID
    const room = await Room.findById(roomId);

    if (!room) {
      req.flash("error", "Room not found");
      return res.redirect(`/admin/roomtypes/${req.params.hotelId}/rooms/${req.params.roomTypeId}`);
    }

    // 2. Delete the room
    await room.remove();    
    req.flash("success", "Room deleted successfully");
    res.redirect(`/admin/roomtypes/${req.params.hotelId}/rooms/${req.params.roomTypeId}`); // Redirect to the admin dashboard or appropriate page

  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to delete the room");
    res.redirect(`/admin/roomtypes/${req.params.hotelId}/rooms/${req.params.roomTypeId}`); // Redirect to the admin dashboard or appropriate page
  }
});


// Create a new room GET
router.get("/:hotelId/:roomTypeId/new-room", middleware.isAdmin, async (req, res) => {
  const successMsg = req.flash("success")[0];
  const errorMsg = req.flash("error")[0];

  try {

const hotel = await Hotel.findById(req.params.hotelId);
const roomType = await RoomType.findById(req.params.roomTypeId);

  res.render("admin/addRooms", {
    pageName: "Create Rooms",
    hotelId: req.params.hotelId,
    roomTypeId: req.params.roomTypeId,
    csrfToken: req.csrfToken(),
    successMsg,
    errorMsg,
    hotel,
    roomType,
  });
 } catch (err) {
    console.log(err);
  }
});


//Create a new room POST
router.post("/:hotelId/:roomTypeId/new-room", middleware.isAdmin, async (req, res) => {
  try {
        
    const roomTypeId = Types.ObjectId(req.params.roomTypeId);
    const hotelId = Types.ObjectId( req.params.hotelId);
    
    const roomsData = req.body.roomsData;


    // Retrieve the corresponding hotel and room type
    const hotel = await Hotel.findById(req.params.hotelId);
    const roomType = await RoomType.findById(req.params.roomTypeId);

    
    // Iterate over the roomsData array and create the rooms
    for (const roomData of roomsData) {

    const room = new Room({
    roomID: roomData.roomId,
    roomType: roomTypeId,
    hotel: hotelId,
    available: true,
    checkIn: Date.now(),
    checkOut: Date.now(),
    // Set any other relevant properties of the room
    });
    
    // Save the room to the database
    await room.save();

    // Initialize hotel.rooms if it's undefined
    if (!hotel.rooms) {
      hotel.rooms = [];
    }
          
    hotel.rooms.push(room._id);
      await hotel.save();      

  // Update the roomType's rooms array
  if (!roomType.rooms) {
    roomType.rooms = []; // Initialize the rooms array if it's undefined
  }
    // Update the roomType's rooms array
    roomType.rooms.push(room._id);
      await roomType.save();
      
    }

    req.flash("success", "New rooms created successfully");

    // Redirect or send a success response
    res.json({
      success: true,
      message: "Rooms created successfully",
      redirect: `/admin/roomtypes/${hotelId}/rooms/${roomTypeId}`,
    });
  } catch (err) {
    console.error(err);
    // Handle any errors that occur during room creation
    res.status(500).json({ success: false, message: "Failed to create rooms" });
  }
});



/**
 * TODO 2. ROOMTYPE 
 * Below functions create a new RoomType  and add them up to each Hotels
 */

//1. view all roomtypes based on hotel
// Delete an existing hotel
router.get("/roomtypes/:id/:hotelId", middleware.isAdmin, async (req, res) => {
  try {
    const roomTypeId = req.params.id;

    // Find the room type by ID
    const roomType = await RoomType.findById(roomTypeId);

    if (!roomType) {
      req.flash("error", "Room type not found");
      res.redirect(`/admin/roomtypes/${hotelId}`);
      return;
    }

    const hotelId = roomType.hotel;

    // Delete associated rooms
    await Room.deleteMany({ roomType: roomTypeId });

    // Delete the room type
    await RoomType.findByIdAndDelete(roomTypeId);

    // Retrieve the hotel and update its room types by removing the deleted room type
    const hotel = await Hotel.findById(hotelId);
    const updatedRoomTypes = hotel.roomtypes.filter(id => id.toString() !== roomTypeId);
    hotel.roomtypes = updatedRoomTypes;
    await hotel.save();

    req.flash("success", "Room type and associated rooms deleted successfully");
    res.redirect(`/admin/roomtypes/${hotelId}`);
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to delete room type");
    res.redirect(`/admin/roomtypes/${hotelId}`);
  }
});


router.get("/roomtypes/:hotelId", middleware.isAdmin, async (req, res) => {
  try {
    const successMsg = req.flash("success")[0];
    const errorMsg = req.flash("error")[0];

    console.log(req.params.hotelId);

    const roomTypes = await RoomType.find({ hotel: req.params.hotelId });
    const hotel = await Hotel.findById(req.params.hotelId)
    console.log(hotel.name);

    let totalRooms = 0;
    let totalRoomsAvailable = 0;
    let totalRoomsOccupied = 0;
    let totalRoomsUnderLock = 0;

    const roomTypesMap = new Map(); // Map to store room types as keys and room count as values

    for (const roomType of roomTypes) {
      const roomsCount = await Room.countDocuments({ hotel: req.params.hotelId, roomType: roomType._id });

      roomTypesMap.set(roomType._id.toString(), roomsCount);

      totalRooms += roomsCount;

      const availableRoomsCount = await Room.countDocuments({ hotel: req.params.hotelId, roomType: roomType._id, available: true });
      const occupiedRoomsCount = roomsCount - availableRoomsCount;
      const underLockRoomsCount = await Room.countDocuments({ hotel: req.params.hotelId, roomType: roomType._id, lock: true });

      totalRoomsAvailable += availableRoomsCount;
      totalRoomsOccupied += occupiedRoomsCount;
      totalRoomsUnderLock += underLockRoomsCount;
    }

    const roomTypesData = [];

    for (const [roomTypeId, count] of roomTypesMap.entries()) {
      const roomType = await RoomType.findById(roomTypeId);

      if (roomType) {
        const roomTypeData = {
          name: roomType.name,
          price: roomType.price,
          id: roomTypeId,
          count,
          available: 0,
          unavailable: 0,
        };

        const availableRoomsCount = await Room.countDocuments({ hotel: req.params.hotelId, roomType: roomTypeId, available: true });
        const unavailableRoomsCount = count - availableRoomsCount;

        roomTypeData.available = availableRoomsCount;
        roomTypeData.unavailable = unavailableRoomsCount;

        roomTypesData.push(roomTypeData);
      }
    }

    console.log("Total Rooms:", totalRooms);
    console.log("Total Rooms Available:", totalRoomsAvailable);
    console.log("Total Rooms Occupied:", totalRoomsOccupied);
    console.log("Total Rooms Under Lock:", totalRoomsUnderLock);

    console.log("Room Types Data:", roomTypesData);

    res.render("admin/walkin", {
      hotelId: req.params.hotelId,
      roomTypes: roomTypesData,
      successMsg,
      errorMsg,
      hotel,
      pageName: "Hotel Details",
      totalRooms,
      totalRoomsAvailable,
      totalRoomsUnderLock,
      totalRoomsOccupied: totalRoomsOccupied - totalRoomsUnderLock,
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to fetch hotel data");
    res.redirect("/hotels");
  }
});



//2. create a new Roomtype GET
router.get("/:hotelId/roomType/new", middleware.isAdmin, async (req, res) => {

  const successMsg = req.flash("success")[0];
  const errorMsg = req.flash("error")[0];

  try {

const hotel = await Hotel.findById(req.params.hotelId);

  res.render("admin/addRoomType", {
    pageName: "Create Rooms",
    hotelId: req.params.hotelId,
    csrfToken: req.csrfToken(),
    successMsg,
    errorMsg,
    hotel,
  });
 } catch (err) {
    console.log(err);
  }
});





//3. post a RoomType with Post
router.post('/add/roomtypes/:hotelId', upload.any(), async (req, res) => {
  const hotelId = req.params.hotelId;
  const formDataItems = Array.isArray(req.body) ? req.body : [req.body]; // Check if multiple form submissions or a single form submission
  const myImages = req.files;
  console.log(hotelId);

  try {
    // Create an array to store the unique directory paths
    const directoryPaths = [];

    // Iterate through the formDataItems
    for (let i = 0; i < formDataItems.length; i++) {
      const formDataItem = formDataItems[i];
      const { name, description, price, maxNumberAdult, maxNumberChildren, hotelName, features } = formDataItem;
      const names = Array.isArray(name) ? name : [name];
      const descriptions = Array.isArray(description) ? description : [description];
      const prices = Array.isArray(price) ? price : [price];
      const maxNumberAdults = Array.isArray(maxNumberAdult) ? maxNumberAdult : [maxNumberAdult];
      const maxNumberChildrens = Array.isArray(maxNumberChildren) ? maxNumberChildren : [maxNumberChildren];
      const hotelNames = Array.isArray(hotelName) ? hotelName : [hotelName];

      // Handle features input
      let featuresList;
      if (typeof features === 'string') {
        // String input for a single form submission
        featuresList = features.split(',').map((name) => ({ name, value: '0' }));
      } else if (Array.isArray(features)) {
        // Array input for multiple form submissions
        featuresList = features.map((featureString) => {
          const featureNames = featureString.split(',');
          return featureNames.map((name) => ({ name, value: '0' }));
        });
      } else {
        console.log('Invalid features input format');
        continue; // Skip to the next iteration if features input is invalid
      }

      console.log('featuresList:', featuresList);

      // Iterate through the values of the current item
      for (let j = 0; j < names.length; j++) {
        const currentName = names[j];
        const currentDescription = descriptions[j];
        const currentPrice = prices[j];
        const currentMaxNumberAdult = maxNumberAdults[j];
        const currentMaxNumberChildren = maxNumberChildrens[j];
        const currentHotelName = hotelNames[j];
        const currentFeatures = featuresList[j];   

        const directoryPath = path.join(__dirname, '..', 'public', 'roomImages', currentHotelName.replace(/\s+/g, "_"), currentName.replace(/\s+/g, "_"));
        // Create the directory if it doesn't exist
        if (!fs.existsSync(directoryPath)) {
          fs.mkdirSync(directoryPath, { recursive: true });
        }

        const imagesToMove = req.files.splice(0, 3); 
          
        // Move the images to the corresponding directory
        for (let k = 0; k < imagesToMove.length; k++) {
        const image = imagesToMove[k];
        const imageName = `${currentName}-image${k + 1}.png`;           
        try {
          
          // fs.renameSync(image.path, imagePath);
        fs.renameSync(image.path, path.join(directoryPath, imageName.replace(/\s+/g, "_")));
        console.log('File saved successfully:', imagePath);
          
          } catch (error) {
          console.error('Error saving file:', error);
          }
        }

        directoryPaths.push(directoryPath);
        console.log('Directory path added to array:', directoryPath);
        
        // Create a new RoomType instance with the extracted data
        const roomType = new RoomType({
          name: currentName,
          image: `${currentName}-image1.png`.replace(/\s+/g, "_"),
          description: currentDescription,
          price: currentPrice,
          maxNumberChildren: currentMaxNumberChildren,
          detailedImage: [
            `${currentName}-image2.png`.replace(/\s+/g, "_"),
            `${currentName}-image3.png`.replace(/\s+/g, "_"),
          ],
          maxNumberAdult: currentMaxNumberAdult,
          features: currentFeatures,
          hotel: hotelId,
        });

        // Save the roomType instance to the database
        const savedRoomType = await roomType.save();

        // Find the corresponding hotel based on the hotelId
        const hotel = await Hotel.findById(hotelId);

        if (!hotel) {
          throw new Error('Hotel not found');
        }
        // Add the roomType to the hotel's roomtypes array
        hotel.roomtypes.push(savedRoomType);
        // Save the updated hotel to the database
        await hotel.save();
      }
    }

    req.flash('success', 'Room types created successfully');
    res.json({
      message: 'Data and files received and processed successfully.',
      redirectUrl: `/admin/roomtypes/${hotelId}`
    });
  } catch (error) {
    console.error('Error saving data:', error);
    req.flash('error', 'An error occurred.');
    res.status(500).json({ error: 'An error occurred.', redirectUrl: `/admin/roomtypes/${hotelId}` });
  }
});


// 2. create a new Roomtype POST
// 2. 1,2,3 functions Lock rooms, deleterooms TODO edit rooms available rooms
// 3. view all rooms that expires today
// 4. View job report of crons
// 5. crud for new Roomtype 
// 6. add rooms to hotel room type
// 7. view all users
// 8. view alll Guests






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

