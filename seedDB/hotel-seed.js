const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const connectDB = require("./../config/db");
const Hotel = require("../models/hotel");
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
    
  },
];


//seed hotel

const seedHotels = async () => {
  try {
    // Delete all existing rooms
    await Hotel.deleteMany({});
    console.log("All hotels deleted successfully!");


    // seed all Hotels
    for (const hotel of hotels) {
      await Hotel.insertMany(hotel);
      console.log(
        `Seeded ${hotel.name}`
      );
    }
    console.log("All hotel seeded successfully!");
    await mongoose.connection.close();
  } catch (error) {
    console.log(error);
  }
};

seedHotels();
