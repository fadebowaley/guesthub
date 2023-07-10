const express = require("express");
const csrf = require("csurf");
const Hotel = require("../models/hotel");
const RoomType = require("../models/roomType");
const Room = require("../models/room");
const Cart = require("../models/cart");
const Guest = require("../models/guest");
const Order = require("../models/order");
const mongoose = require('mongoose');



const { ObjectId } = require('mongoose').Types;
const middleware = require("../middleware/confirm");
const router = express.Router();
const generateReceipt = require("../middleware/receipt");

const {
  sendOrderEmailInBackground,
} = require("../worker/workers");




const csrfProtection = csrf();
router.use(csrfProtection);




//Manage all the bookings and payments
router.get(
  "/new/:id/reservation",
  middleware.isLoggedIn,
  middleware.emailVerified,
  async (req, res) =>   {
    try{
    const errorMsg = req.flash("error")[0];
      const successMsg = req.flash("success")[0];
      // const room = await RoomType.findById(req.params.id);
      const room = await RoomType.findById(req.params.id).populate('hotel');

    res.render("bookings/bookie", {
      csrfToken: req.csrfToken(),
      room,
      errorMsg,
      successMsg,
      pageName: "Bookings ",
    });

    } catch (err) {
      console.log(err);
    res.status(500).send("Server Error");
    }
    
  });


// POST: add a product to the shopping cart when "Add to cart" button is pressed
router.post("/reserve/:id", middleware.isLoggedIn, async (req, res) => {

  const roomTypeId = req.params.id;
  const bookingData = req.body;

try {
    // get the correct cart, either from the db, session, or an empty cart.
    let user_cart;
    if (req.user) {
      user_cart = await Cart.findOne({ user: req.user._id });
    }
  let cart;
  // let guest;
    if (
      (req.user && !user_cart && req.session.cart) ||
      (!req.user && req.session.cart)
    ) {
      cart = await new Cart(req.session.cart);
    } else if (!req.user || !user_cart) {
      cart = new Cart({});
    } else {
      cart = user_cart;
    }

  // add the room booked  to the cart
  const room = await RoomType.findById(roomTypeId).populate('hotel');
  const noRooms = parseInt(bookingData['roomNumber']);
  const days = bookingData['numberOfDays'];
  const price = room.price;
  const num_guests = bookingData['adultNumber'];
  const hotelName = room.hotel.name;

  let item = cart.items.find((item) => item.roomTypeId === roomTypeId);

  if (item) {
  // if room exists in the cart, update the quantity and price
  item.noRooms += noRooms;
  item.price = item.noRooms * price * days;
} else {
  // if room does not exist in cart, add new item
  cart.items.push({
    roomTypeId: roomTypeId,
    noRooms: noRooms,
    price: price,
    priceTotal: noRooms * price * days,
    name: room.name,
    checkIn: bookingData['checkIn'],
    checkOut: bookingData['checkOut'],
    num_guests: num_guests,
    days: days,
    hotel: hotelName,
  });
  }

  console.log(cart.items);

cart.totalRoom += noRooms;
// update cart totals
cart.totalCost += (noRooms * price * days);

    // if the user is logged in, store the user's id and save cart to the db
    if (req.user) {
      cart.user = req.user._id;
      await cart.save();
    }
  req.session.cart = cart;
  req.flash("success", "Item added to the shopping cart"); 
  res.json({ 
  success: "Room added to the shopping cart.", 
  redirectUrl: "/bookings/cart"
});

    // res.redirect(req.headers.referer);
  } catch (err) {
  res.json({ "error": err.message  });
  // res.redirect("/");
  }
});


// Route request to proceed 
router.post("/proceed/:id", middleware.isLoggedIn, async (req, res) => {
  const {
    title,
    first_name,
    last_name,
    email,
    phoneNumber,
    residential,
    city,
    state,
    country,
    paymentRef,
  } = req.body;

  let user_cart;
  let guest;
  let order;

  try {
    if (req.user) {
      user_cart = await Cart.findOne({ user: req.user._id });
      // Create an array to store multiple reservations
      const reservations = [];
      // Iterate over the items in user_cart
      for (const item of user_cart.items) {
        // conform with time checking of 12:00 noon daily
        item.checkOut.setUTCHours(12, 0, 0);
        item.checkIn.setUTCHours(12, 0, 0);

        // Iterate over the number of rooms in the item
        for (let i = 1; i <= item.noRooms; i++) {
          console.log(i);
          console.log(item.adultNumber);

          reservations.push({
            itemId: item._id,
            reservationId: i, // Assign a unique reservation ID for each room
            check_in_date: item.checkIn,
            check_out_date: item.checkOut,
            num_guests: item.num_guests,
            room_type: item.roomTypeId,
            hotel: item.hotel,
          });
        }
      }

      // Find an existing guest with the same email address
      let existingGuest = await Guest.findOne({ email: email });

      if (existingGuest) {
        // Check if any guest fields have changed
        let guestDataChanged = false;
        if (
          existingGuest.title !== title ||
          existingGuest.first_name !== first_name ||
          existingGuest.last_name !== last_name ||
          existingGuest.phone_number !== phoneNumber ||
          existingGuest.residential !== residential ||
          existingGuest.city !== city ||
          existingGuest.state !== state ||
          existingGuest.country !== country ||
          existingGuest.paymentRef !== paymentRef
        ) {
          // Update the guest data
          existingGuest.title = title;
          existingGuest.first_name = first_name;
          existingGuest.last_name = last_name;
          existingGuest.phone_number = phoneNumber;
          existingGuest.residential = residential;
          existingGuest.city = city;
          existingGuest.state = state;
          existingGuest.country = country;
          existingGuest.paymentRef = paymentRef;
          guestDataChanged = true;
        }

        // Append the new reservations to the existing reservations
        existingGuest.reservations.push(...reservations);

        await existingGuest.save();

        if (guestDataChanged) {
          console.log('Existing guest data updated');
        } else {
          console.log('Reservation added to existing guest');
        }
      } else {
        // Create a new guest with the provided information
        guest = new Guest({
          user: req.user._id,
          title: title,
          first_name: first_name,
          last_name: last_name,
          email: email,
          phone_number: phoneNumber,
          residential: residential,
          city: city,
          state: state,
          country: country,
          paymentRef: paymentRef,
          reservations: reservations,
        });
        // Save the new guest
        existingGuest = await guest.save();
        console.log('New guest and reservation created');
      }

      // Create an order with the cart data
      order = new Order({
        user: req.user._id,
        delivered: true,
        cart: {
          totalQty: user_cart.totalRoom,
          totalCost: user_cart.totalCost,
          items: user_cart.items,
        },
        paymentId: paymentRef,
      });
      // Save the order
      await order.save();

      // send a mail to confirm the current order
      sendOrderEmailInBackground(order);

      // Clean the cart by removing all items
      user_cart.items = [];
      user_cart.totalRoom = 0;
      user_cart.totalCost = 0;
      await user_cart.save();
      console.log('Cart cleaned');

      res.json({ redirectUrl: '/user/account' });
    }
  } catch (err) {
    console.log('failure .. . . . ' + err);
    // res.redirect("/bookings/failure");
  }
});



//Get cart view all items in cart
router.get("/cart", middleware.isLoggedIn, async (req, res) => {
  try {

    let cart;
    let guest;
    let cartItemsCount = 0;

    if (req.user) {

      cart = await Cart.findOne({ user: req.user._id });
      guest = await Guest.findOne({ user: req.user._id });

      cartItemsCount = cart.items.reduce((acc, item) => acc + item.noRooms, 0);
    } 
    if (!req.user || !cart) {
      cart = new Cart({});
    }
    const pay = process.env.PAYSTACK_KEY;

    console.log(guest);

    res.render("bookings/cart",
      {
        csrfToken: req.csrfToken(),
        cart: cart,
        pay: pay,
        guest: guest,
      });
  } catch (err) {
    console.log(err.message);
    res.redirect("/");
  }
});


// POST: remove an item from the shopping cart
router.get("/remove/:id", middleware.isLoggedIn, async (req, res) => {
  const itemId = req.params.id;
  try {
    // get the correct cart, either from the db, session, or an empty cart
    let user_cart;
    if (req.user) {
      user_cart = await Cart.findOne({ user: req.user._id });
    }
    let cart;
    if ((req.user && !user_cart && req.session.cart) || (!req.user && req.session.cart)) {
      cart = await new Cart(req.session.cart);
    } else if (!req.user || !user_cart) {
      cart = new Cart({});
    } else {
      cart = user_cart;
    }

    // remove the item from the cart
    const itemIndex = cart.items.findIndex((item) => item._id.toString() === itemId.toString());
    if (itemIndex > -1) {
      const item = cart.items[itemIndex];
      if (typeof cart.totalRoom === "number" && !isNaN(cart.totalRoom) && typeof item.noRoom === "number" && !isNaN(item.noRoom)) {
        cart.totalRoom -= item.noRoom;
      }
      if (typeof cart.totalCost === "number" && !isNaN(cart.totalCost) && typeof item.price === "number" && !isNaN(item.price)) {
        cart.totalCost -= item.priceTotal;
      }
      await cart.items.remove({ _id: itemId });
    }

    // if the user is logged in, store the user's id and save cart to the db
    if (req.user) {
      cart.user = req.user._id;
      await cart.save();
    }

    req.session.cart = cart;
    req.flash("success", "Item removed from the shopping cart");
    res.redirect("/bookings/cart");

  } catch (err) {
    console.log(err);
    req.flash("error", "Something went wrong. Please try again.");
    res.redirect("/");
  }
});


// GET: remove all instances of a single product from the cart
router.get("/clear", middleware.isLoggedIn, async (req, res) => {
  try {
    // get the correct cart, either from the db, session, or an empty cart
    let user_cart;
    if (req.user) {
      user_cart = await Cart.findOne({ user: req.user._id });
    }
    let cart;
    if ((req.user && !user_cart && req.session.cart) || (!req.user && req.session.cart)) {
      cart = await new Cart(req.session.cart);
    } else if (!req.user || !user_cart) {
      cart = new Cart({});
    } else {
      cart = user_cart;
    }

    // remove all items from the cart
    cart.items = [];
    cart.totalRoom = 0;
    cart.totalCost = 0;

    // if the user is logged in, store the user's id and save cart to the db
    if (req.user) {
      cart.user = req.user._id;
      await cart.save();
    }

    req.session.cart = cart;
    req.flash("success", "All items removed from the shopping cart");
    res.redirect("/bookings/cart");

  } catch (err) {
    console.log(err);
    req.flash("error", "Something went wrong. Please try again.");
    res.redirect("/");
  }
});





//Get: Check render for rooms
router.get("/checkin/:orderId/:itemId/room", middleware.isLoggedIn, middleware.emailVerified,async (req, res) => {
    
    try {      
      const errorMsg = req.flash("error")[0];
      const successMsg = req.flash("success")[0];

      const orderId = req.params.orderId; // Access the order ID
      const itemId = req.params.itemId; // Access the item reference


      const order = await Order.findById(orderId).populate("cart.items");
      const item = order.cart.items.find((item) => String(item._id) === itemId);   

      
      const guest = await Guest.findOne({ user: ObjectId(req.user._id) });
      
      //search for all rooms by the roomType that is available
      const rooms = await Room.find({ roomType: ObjectId(item.roomTypeId) });
      // Total number of rooms
      const totalRooms = rooms.length;
      // Count of available rooms
      const availableRooms = rooms.filter(room => room.available).length;

    
      // Count of not available rooms
      const notAvailableRooms = rooms.filter(room => !room.available).length;

      console.log("Total Rooms:", totalRooms);
      console.log("Available Rooms:", availableRooms);
      console.log("Not Available Rooms:", notAvailableRooms);

    res.render("bookings/checkinBook", {
      csrfToken: req.csrfToken(),
      rooms,
      guest:guest,
      roomType: item.roomTypeId,
      noRooms: item.noRooms,
      checkin: item.checkIn,
      itemId: itemId,
      orderId: orderId,
      errorMsg,
      successMsg,
      pageName: "Checkin Room",
    });
    } catch (err) {
      console.log(err);
    res.status(500).send("Server Error");
    }    
  });



//checkin form will update the Guest data and alocate a Room under category booked
router.post("/checkin/rooms", middleware.isLoggedIn, async (req, res) => {

  const {    
    identification,
    denomination,
    religion,
    purpose,
    occupation,
    address,
    city,
    nextOfKin,
    nextOfKinOccupation,
    nextOfKinTelephone,
    relationship,
    selectedRooms,
    organisation,
    roomType,
    itemId,
    orderId,

  } = req.body;


  try {
    // Find the guest and update other data
    const guest = await Guest.findOne({ user: ObjectId(req.user._id) });
    guest.identification = identification;
    guest.denomination = denomination;
    guest.religion = religion;
    guest.purpose = purpose;
    guest.occupation = occupation;
    guest.organization = organisation;
    guest.nokAddress = address;
    guest.city = city;
    guest.nextOfKin = nextOfKin;
    guest.nokOccupation = nextOfKinOccupation;
    guest.nokTel = nextOfKinTelephone;
    guest.relationship = relationship;
   
        
  // Task 1: Search for Rooms matching roomType and selectedRooms
  const rooms = await Room.find({
    roomType,
    roomID: { $in: selectedRooms },
  });
    
    
 // Task 2: Update the availability of the matched rooms
  const updatePromises = rooms.map((room) => {
    room.available = false;
    return room.save();
  });
  await Promise.all(updatePromises);

// Task 3: Update guest.reservations.room_id with the ObjectIDs of the selected rooms
const roomIds = rooms.map((room) => mongoose.Types.ObjectId(room._id)); // Convert room IDs to ObjectIds
let itemFound = false; // Flag to track if the itemId is found

     guest.reservations.forEach((reservation, index) => {
  if (reservation.itemId.toString() === itemId) {
    console.log("Item found at index " + index);
    const roomIndex = index < roomIds.length ? index : index % roomIds.length;
    reservation.room_id = roomIds[roomIndex];
    console.log("index iteration " + roomIndex);    
    console.log("updated with room obj " + roomIds[roomIndex]);
    itemFound = true; // Set the flag to true since the itemId is found
  }
    });
    
  if (!itemFound) {
    console.log("Item with itemId " + itemId + " not found in reservations.");
    // Handle the scenario where the itemId is not found
  }
// Task 4: Save the updated guest
    await guest.save();
    

     // Update the confirmation status of the item
    await Order.updateOne(
      {
        _id: ObjectId(orderId),
        'cart.items._id': ObjectId(itemId)
      },
      { $set: { 'cart.items.$.confirmed': true } }
    );


  res.json({ 
  success: "Room added to the shopping cart.", 
  redirectUrl: "/bookings/checkin/success/",
  code: orderId + "/" + itemId + "/"
});
    
  } catch (error) {
    console.log("An error occurred:", error);
    res.redirect("/"); // Redirect to an error page or handle the error accordingly
  }
});



// GET: this page shows checkin is successful
router.get("/checkin/success/:orderId/:itemId", middleware.isLoggedIn, async (req, res) => {
      
      const orderId = req.params.orderId; // Access the order ID
      const itemId = req.params.itemId; // Access the item reference

      const errorMsg = req.flash("error")[0]; 
      const successMsg = req.flash("success")[0]; 

  res.render("bookings/checkinThankyou", {  
    csrfToken: req.csrfToken(),
    errorMsg,
    successMsg,
    itemId,
    orderId,
    pageName: "Checkin Confirmation",
  });
});





router.get('/checkin/success/:orderId/:itemId/pdf', async (req, res) => {
  try {
    const itemId = req.params.itemId;

    const guest = await Guest.findOne({ user: ObjectId(req.user._id) })
      .populate({
        path: 'reservations',
        populate: {
          path: 'room_id',
          model: 'Room',
        },
      })
      .populate({
        path: 'reservations',
        populate: {
          path: 'room_type',
          model: 'RoomType',
          populate: {
            path: 'hotel',
            model: 'Hotel',
          },
        },
      });

    const filteredReservations = guest.reservations.filter((reservation) => reservation.itemId.toString() === itemId);

    // Gnererate Receipt for Booking Confirmation
    generateReceipt(guest, filteredReservations, itemId);

    const pdfPath = `/documents/${itemId}.pdf`;      
    res.render('bookings/printReceipt', {
      pageName: 'Check-in Page',
      pdfPath: pdfPath,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating PDF receipt');
  }
});






module.exports = router;
