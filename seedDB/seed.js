const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const Hotel = require("../models/hotel");
const RoomType = require("../models/roomType");
const User = require("../models/user");
const Review = require("../models/review");
const bcrypt = require("bcrypt-nodejs");
const connectDB = require("./../config/db");
const fs = require("fs/promises");

//Hotel Dummy Data
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

const ratings = [
  {
    rating: 2,
    comment: "fantastic!",
    author: "fadebowaley",
  },
  {
    rating: 1,
    comment: "fantastic!",
    author: "fadebowaley",
  },
  {
    rating: 3,
    comment: "Great hub for innovation",
    author: "Debby",
  },
  {
    rating: 1,
    comment: "Solves my problems!",
    author: "Gowon Yakubu",
  },
];

//Hotel room type Dummy Data
const typeR = [
  {
    name: "Classic Balcony Room",
    image: "/images/img/gallery/room-img01.png",
    description:
      "Aenean vehicula ligula eu rhoncus porttitor. Duis vel lacinia quam. Nunc rutrum porta place ullam ipsum. Morbi imperdiet, orci et dapibus.",
    price: 600,
    features: [
      "/images/img/icon/sve-icon1.png",
      "/images/img/icon/sve-icon2.png",
      "/images/img/icon/sve-icon3.png",
      "/images/img/icon/sve-icon4.png",
      "/images/img/icon/sve-icon5.png",
      "/images/img/icon/sve-icon6.png",
    ],
  },
  {
    name: "Superior Double Room",
    image: "/images/img/gallery/room-img02.png",
    description:
      "Aenean vehicula ligula eu rhoncus porttitor. Duis vel lacinia quam. Nunc rutrum porta ex, in imperdiet tortor feugiat at.",
    price: 400,
    features: [
      "/images/img/icon/sve-icon1.png",
      "/images/img/icon/sve-icon2.png",
      "/images/img/icon/sve-icon3.png",
      "/images/img/icon/sve-icon4.png",
      "/images/img/icon/sve-icon5.png",
      "/images/img/icon/sve-icon6.png",
    ],
  },
  {
    name: "Super Balcony Double Room",
    image: "/images/img/gallery/room-img03.png",
    description:
      "Aenean vehicula ligula eu rhoncus porttitor. Duis vel lacinia quam. Nunc rutrum porta place ullam ipsum. Morbi imperdiet, orci et dapibus.",
    price: 100,
    features: [
      "/images/img/icon/sve-icon1.png",
      "/images/img/icon/sve-icon2.png",
      "/images/img/icon/sve-icon3.png",
      "/images/img/icon/sve-icon4.png",
      "/images/img/icon/sve-icon5.png",
      "/images/img/icon/sve-icon6.png",
    ],
  },
  {
    name: "Double Deluxe Room",
    image: "/images/img/gallery/room-img04.png",
    description:
      "Aenean vehicula ligula eu rhoncus porttitor. Duis vel lacinia quam. Nunc rutrum porta place ullam ipsum. Morbi imperdiet, orci et dapibus.",
    price: 200,
    features: [
      "/images/img/icon/sve-icon1.png",
      "/images/img/icon/sve-icon2.png",
      "/images/img/icon/sve-icon3.png",
      "/images/img/icon/sve-icon4.png",
      "/images/img/icon/sve-icon5.png",
      "/images/img/icon/sve-icon6.png",
    ],
  },
];

//create user name username: admin, email, admin@admin, password adminadmin

const users = [
  {
    username: "Ademola Adebowale",
    email: "admin@hotelhub.com",
    phone: "+2348145045108",
    tile: "Mr",
    role: "admin",
    password: "adminadmin",
  },
  {
    username: "debby Adebowale",
    email: "user@hotelhub.com",
    phone: "+23480271180715",
    tile: "Mr",
    password: "useruser",
  },
];

// encrypt the password before storing
User.schema.methods.encryptPassword = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};

const seedUsers = async () => {
  try {
    await User.deleteMany({ email: { $regex: /@hotelhub.com$/ } });
    console.log("All users deleted successfully!");

    for (const user of users) {
      user.password = await User.schema.methods.encryptPassword(user.password);
      await User.insertMany(user);
    }
    console.log("All users created successfully!");
  } catch (error) {
    console.error("Error seeding users:", error);
    process.exit(1);
  }
};

const seedHotels = async () => {
  try {
    await Hotel.deleteMany({});
    console.log("All hotels deleted successfully!");

    for (const hotel of hotels) {
      await Hotel.insertMany(hotel);
    }
    console.log("All hotels seeded successfully!");
  } catch (error) {
    console.error("Error seeding hotels:", error);
    process.exit(1);
  }
};

const seedReviews = async () => {
  try {
    await Review.deleteMany({});
    console.log("All reviews deleted successfully!");

    const hotels = await Hotel.find();
    const hotelReviews = hotels.flatMap((hotel) => {
      return ratings.map((review) => {
        const newReview = new Review({
          ...review,
          hotel: hotel._id,
        });
        hotel.reviews.push(newReview._id);
        return newReview;
      });
    });

    await Review.insertMany(hotelReviews);
    await hotels.forEach(async (hotel) => await hotel.save());
    console.log("All reviews seeded successfully!");
  } catch (error) {
    console.error("Error seeding reviews:", error);
    process.exit(1);
  }
};

/** 
const seedReviews = async () => {
  try {
    await Reviews.deleteMany({});
    console.log("All reviews deleted successfully!");

    const hotels = await Hotel.find(); 
    //add reviews to all hotels
    const hotelReviews = hotels.flatMap((hotel) => {
      return ratings.map((items) => ({ ...items, hotel: hotel._id }));
    });
    
    await Reviews.insertMany(hotelReviews);
    console.log("All reviews seeded successfully!");
  } catch (error) {
    console.error("Error seeding rooms:", error);
    process.exit(1);
  }
};
*/

const seedRooms = async () => {
  try {
    console.log("Deleting all room types...");
    await RoomType.deleteMany({});
    console.log("All room types deleted successfully!");

    console.log("Finding all hotels...");
    const hotels = await Hotel.find();
    console.log("Hotels found:", hotels);

    //add room types for available hotel
    for (const hotel of hotels) {
      const hotelRooms = typeR.map((items) => {
        return { ...items, hotel: hotel._id };
      });

      console.log(
        `Seeding ${hotelRooms.length} rooms type for ${hotel.name}...`
      );
      await RoomType.insertMany(hotelRooms);
      console.log(`Seeded ${hotelRooms.length} rooms type for ${hotel.name} `);
    }

    console.log("All rooms seeded successfully!");
  } catch (error) {
    console.error("Error seeding rooms:", error);
    process.exit(1);
  }
};

const closeConnection = async () => {
  try {
    await mongoose.connection.close();
    console.log("Database connection closed successfully!");
  } catch (error) {
    console.error("Error closing database connection:", error);
    process.exit(1);
  }
};

const dbSeed = async () => {
  try {
    // connect Database
    await connectDB();
    await seedHotels();
    await seedRooms();
    await seedUsers();
    await seedReviews();
    console.log("Data seeded successfully . . . ");
    await fs.writeFile("seeded.txt", "true");
    console.log("flag set successfully");
    await closeConnection();
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

module.exports = dbSeed;
