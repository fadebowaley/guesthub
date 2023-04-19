const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const Room = require("../models/room");
const Review = require("../models/review");
const Category = require("../models/category");
const mongoose = require("mongoose");
const connectDB = require("./../config/db");
connectDB();

const hotels = [
  {
    name: "Overflow Court",
    description: "A luxurious hotel with excellent amenities",
    address: "10, Adeola Odeku Street",
    city: "Victoria Island",
    state: "Lagos",
    zip: "101001",
    phone: "08012345678",
    email: "info@overflowcourt.com",
    website: "https://overflowcourt.com",
    rooms: [room1, room2],
    reviews: [review1, review2],
  },
  {
    name: "Shiloh Apartment",
    description: "A stylish and comfortable apartment hotel",
    address: "20, Opebi Road",
    city: "Ikeja",
    state: "Lagos",
    zip: "100281",
    phone: "08023456789",
    email: "info@shilohapartment.com",
    website: "https://shilohapartment.com",
    rooms: [room3, room4],
    reviews: [review3, review4],
  },
  {
    name: "Peace courts",
    description: "A serene and cozy hotel for relaxation",
    address: "5, Awolowo Road",
    city: "Ikoyi",
    state: "Lagos",
    zip: "101233",
    phone: "08034567890",
    email: "info@peacecourts.com",
    website: "https://peacecourts.com",
    rooms: [room5, room6],
    reviews: [review5, review6],
  },
  {
    name: "Joy to the wise",
    description: "A budget-friendly hotel for smart travelers",
    address: "3, Balogun Street",
    city: "Surulere",
    state: "Lagos",
    zip: "101101",
    phone: "08045678901",
    email: "info@joytothewise.com",
    website: "https://joytothewise.com",
    rooms: [room7, room8],
    reviews: [review7, review8],
  },
  {
    name: "Booking Office",
    description: "A business-friendly hotel with meeting rooms",
    address: "12, Isaac John Street",
    city: "Ikeja",
    state: "Lagos",
    zip: "100001",
    phone: "08056789012",
    email: "info@bookingoffice.com",
    website: "https://bookingoffice.com",
    rooms: [room9, room10],
    reviews: [review9, review10],
  },
  {
    name: "African mission Guest House",
    description: "A cultural experience hotel for travelers",
    address: "50, Herbert Macaulay Way",
    city: "Yaba",
    state: "Lagos",
    zip: "101212",
    phone: "08067890123",
    email: "info@africanmissionguesthouse.com",
    website: "https://africanmissionguesthouse.com",
    rooms: [room11, room12],
    reviews: [review11, review12],
  },
];
