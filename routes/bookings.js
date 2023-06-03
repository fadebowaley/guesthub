const express = require("express");
const csrf = require("csurf");
const Hotel = require("../models/hotel");
const RoomType = require("../models/roomType");
const Room = require("../models/room");
const Cart = require("../models/cart");
const Guest = require("../models/guest");
const Order = require("../models/order");


const middleware = require("../middleware/confirm");
const guest = require("../models/guest");
const router = express.Router();


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
    days: days,
    hotel: hotelName
  });
  }

  
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




// POST:  Function  to proceed to  checkout
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

      //conform with time checking of 12:00 noon daily

        item.checkOut.setUTCHours(12, 0, 0)
        item.checkIn.setUTCHours(12, 0, 0)


        console.log(item.checkOut);
        reservations.push({
          // room_id: item.roomTypeId,
          check_in_date: item.checkIn,
          check_out_date: item.checkOut,
          num_guests: item.noRooms,
          room_type: item.roomTypeId,
          hotel: item.hotel,
        });
      }

      // Find an existing guest with the same email address
      const existingGuest = await Guest.findOne({ email: email });

      if (existingGuest) {
        // Update the existing guest's reservation instead of creating a new guest
        existingGuest.reservations.push(...reservations);
        await existingGuest.save();
        console.log('Reservation added to existing guest');
      } else {
        // Create a new guest with the provided information
        guest = new Guest({
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
        await guest.save();
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
        paymentId: paymentRef
      });
      // Save the order
      await order.save();
      
     // console.log(order);

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
    console.log('failure .. . . . ' + err)
    // res.redirect("/bookings/failure");

  }
});





//Get cart view all items in cart
router.get("/cart", middleware.isLoggedIn, async (req, res) => {
  try {
    let cart;
    let cartItemsCount = 0;
    if (req.user) {
      cart = await Cart.findOne({ user: req.user._id });
      cartItemsCount = cart.items.reduce((acc, item) => acc + item.noRooms, 0);
    } 
    if (!req.user || !cart) {
      cart = new Cart({});
    }
    const pay = process.env.PAYSTACK_KEY
    res.render("bookings/cart",  {csrfToken: req.csrfToken(), cart: cart , pay: pay });
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



// GET: checkout form with csrf token
// router.get("/checkin", middleware.isLoggedIn, async (req, res) => {
//   const errorMsg = req.flash("error")[0];  
//   res.render("bookings/checkin", {  
//     csrfToken: req.csrfToken(),
//     errorMsg,
//     pageName: "Checkin Page",
//   });
// });


router.get(
  "/checkin/:id/room",
  middleware.isLoggedIn,
  middleware.emailVerified,
  async (req, res) =>   {
    try{
    const errorMsg = req.flash("error")[0];
      const successMsg = req.flash("success")[0];

      //search for all rooms by the roomType that is available 
      const room = await Room.findById(req.params.id).populate('hotel');

    res.render("bookings/checkin", {
      csrfToken: req.csrfToken(),
      room,
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
router.post("/checkin/:roomTypeId", middleware.isLoggedIn, async (req, res) => { 


});








// POST: handle checkout logic and payment using 
router.post("/checkout", middleware.isLoggedIn, async (req, res) => {
  if (!req.session.cart) {
    return res.redirect("/shopping-cart");
  }
  const cart = await Cart.findById(req.session.cart._id);
  stripe.charges.create(
    {
      amount: cart.totalCost * 100,
      currency: "usd",
      source: req.body.stripeToken,
      description: "Test charge",
    },
    function (err, charge) {
      if (err) {
        req.flash("error", err.message);
        console.log(err);
        return res.redirect("/checkout");
      }
      const order = new Order({
        user: req.user,
        cart: {
          totalQty: cart.totalQty,
          totalCost: cart.totalCost,
          items: cart.items,
        },
        address: req.body.address,
        paymentId: charge.id,
      });
      order.save(async (err, newOrder) => {
        if (err) {
          console.log(err);
          return res.redirect("/checkout");
        }
        await cart.save();
        await Cart.findByIdAndDelete(cart._id);
        req.flash("success", "Successfully purchased");
        req.session.cart = null;
        res.redirect("/user/profile");
      });
    }
  );
});



module.exports = router;


