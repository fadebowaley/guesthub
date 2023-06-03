const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const Hotel = require("../models/hotel");
const RoomType = require("../models/roomType");
const User = require("../models/user");
const Review = require("../models/review");
const Room = require("../models/room");
const bcrypt = require("bcrypt-nodejs");
const { conn } = require("../config/dbb");
// const connectDB = require("./../config/db");
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
    description: "Understated seaside elegance, traditional grace, complemented by warm homely touches and pops exquisitely designed resort set in a peaceful enclave just out of Hua Hin town.",
    price: 600,
   features: [
      { name: "TV", value: 0 },
      { name: "Free Wifi", value:-1 },
      { name: "Air Condition", value:-1 },
      { name: "Heater", value: 0 },
      { name: "Phone", value: 0 },
      { name: "Laundry", value:-1 },
      { name: "Adults", value: 2 },
      { name: "Size", value: 24 }, //"24m²"
      { name: "Bed Type", value: 1 }
    ],
    detailedImage: [
     "/images/img/bg/single-room-img03.png",
      "/images/img/bg/single-room-img02.png",
    ],
    maxNumberAdult:2,
    maxNumberChildren:1,
  },
  {
    name: "Superior Double Room",
    image: "/images/img/gallery/room-img02.png",
    description: "Understated seaside elegance, traditional grace, complemented by warm homely touches and pops exquisitely designed resort set in a peaceful enclave just out of Hua Hin town.",
    price: 400,
    features: [
      { name: "TV", value: 0 },
      { name: "Free Wifi", value:-1 },
      { name: "Air Condition", value:-1 },
      { name: "Heater", value: 0 },
      { name: "Phone", value: 0 },
      { name: "Laundry", value:-1 },
      { name: "Adults", value: 2 },
      { name: "Size", value: 24 }, //"24m²"
      { name: "Bed Type", value: 1 }
    ],
    detailedImage: [
     "/images/img/bg/single-room-img03.png",
      "/images/img/bg/single-room-img02.png",
    ],
    maxNumberAdult:2,
    maxNumberChildren:4,
  },
  {
    name: "Super Balcony Double Room",
    image: "/images/img/gallery/room-img03.png",
    description: "Aenean vehicula ligula eu rhoncus porttitor. Duis vel lacinia quam. Nunc rutrum porta place ullam ipsum. Morbi imperdiet, orci et dapibus.",
    price: 100,
   features: [
      { name: "TV", value: 0 },
      { name: "Free Wifi", value:-1 },
      { name: "Air Condition", value:-1 },
      { name: "Heater", value: 0 },
      { name: "Phone", value: 0 },
      { name: "Laundry", value:-1 },
      { name: "Adults", value: 2 },
      { name: "Size", value: 24 }, //"24m²"
      { name: "Bed Type", value: 1 }
    ],
       detailedImage: [
       "/images/img/bg/single-room-img03.png",
      "/images/img/bg/single-room-img02.png",
    ],
    maxNumberAdult:4,
    maxNumberChildren:4,
  },
  {
    name: "Double Deluxe Room",
    image: "/images/img/gallery/room-img04.png",
    description:"Aenean vehicula ligula eu rhoncus porttitor. Duis vel lacinia quam. Nunc rutrum porta place ullam ipsum. Morbi imperdiet, orci et dapibus.",
    price: 200,
   features: [
      { name: "TV", value: 0 },
      { name: "Free Wifi", value:-1 },
      { name: "Air Condition", value:-1 },
      { name: "Heater", value: 0 },
      { name: "Phone", value: 0 },
      { name: "Laundry", value:-1 },
      { name: "Adults", value: 2 },
      { name: "Size", value: 24 }, //"24m²"
      { name: "Bed Type", value: 1 }
    ],
      detailedImage: [
      "/images/img/bg/single-room-img03.png",
      "/images/img/bg/single-room-img02.png",
    ],
    maxNumberAdult:3,
    maxNumberChildren:3,
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

const seedRoom = async () => {
  try {
    // delete all existing rooms before seeding
    await Room.deleteMany({});

    // find all available room types and hotels
    const roomTypes = await RoomType.find({});
    const hotels = await Hotel.find({});

    // create an array to store the new rooms
    const newRooms = [];

    
    // loop through and create 15 new rooms
    let roomTypeIndex = 0;
    let hotelIndex = 0;
    for (let i = 0; i < 250; i++) {
        const checkIn = new Date(
          Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
        );
        const checkOut = new Date(
          checkIn.getTime() +
            Math.floor(Math.random() * 30) * 48 * 60 * 60 * 1000
        );
      const room = {
        roomID: i + 1,
        roomType: roomTypes[roomTypeIndex],
        hotel: hotels[hotelIndex],
        available: Math.random() < 0.5, // randomly assign true or false
        checkIn,
        checkOut: checkOut < new Date() ? checkOut : new Date(),
      };

      // increment the roomTypeIndex and hotelIndex to select the next room type and hotel
      roomTypeIndex = (roomTypeIndex + 1) % roomTypes.length;
      hotelIndex = (hotelIndex + 1) % hotels.length;

      // create the new room
      const newRoom = await Room.create(room);

      // add the new room to its corresponding hotel's rooms array
      const hotel = hotels.find(
        (h) => h._id.toString() === newRoom.hotel.toString()
      );
      if (hotel) {
        hotel.rooms.push(newRoom);
        await hotel.save();
      }

      // add the new room to its corresponding roomType's rooms array
      const roomType = roomTypes.find(
        (rt) => rt._id.toString() === newRoom.roomType.toString()
      );
      if (roomType) {
        roomType.rooms.push(newRoom);
        await roomType.save();
      }

      // add the new room to the array of new rooms
      newRooms.push(newRoom);
    }

    console.log("Rooms seeded successfully");
    return newRooms;
  } catch (err) {
    console.error(err);
  }
};

// Seed Room Type data to the database
const seedRoomType = async () => {
  try {
    console.log("Deleting all room types...");
    await RoomType.deleteMany({}); // delete all existing room types

    console.log("All room types deleted successfully!");

    const hotels = await Hotel.find(); // get all hotels
    const hotelRoomTypes = hotels.flatMap((hotel) => {
      // create room types for each hotel
      return typeR.map((roomType) => {
        const newRoomType = new RoomType({
          // create a new RoomType object with the data
          ...roomType, // using the spread operator to copy all properties from the typeR object
          hotel: [hotel._id], // add the hotel id to the room type object
        });
        hotel.roomtypes.push(newRoomType._id); // add the room type id to the hotel's room types array
        return newRoomType;
      });
    });

    await RoomType.insertMany(hotelRoomTypes); // insert all new room types to the database
    await hotels.forEach(async (hotel) => await hotel.save()); // save the updated hotel data to the database

    console.log("All room types seeded successfully!");
  } catch (error) {
    console.error("Error seeding room types:", error);
    process.exit(1);
  }
};

// const seedRoomType = async () => {
//   try {
//     console.log("Deleting all room types...");
//     await RoomType.deleteMany({}); // delete all existing room types

//     console.log("All room types deleted successfully!");

//     const hotels = await Hotel.find(); // get all hotels
//     const hotelRoomTypes = hotels.flatMap((hotel) => {
//       // create room types for each hotel
//       return typeR.map((roomType) => {
//         const newRoomType = new RoomType({
//           // create a new RoomType object with the data
//           name: roomType.name,
//           image: roomType.image,
//           description: roomType.description,
//           price: roomType.price,
//           features: roomType.features,
//           detailedImage: roomType.detailedImage,
//           maxNumberAdult: roomType.maxNumberAdult,
//           maxNumberChildren: roomType.maxNumberChildren,
//           hotel: hotel._id // add the hotel id to the room type object
//         });
//         hotel.roomtypes.push(newRoomType._id); // add the room type id to the hotel's room types array
//         return newRoomType;
//       });
//     });

//     await RoomType.insertMany(hotelRoomTypes); // insert all new room types to the database
//     await hotels.forEach(async (hotel) => await hotel.save()); // save the updated hotel data to the database

//     console.log("All room types seeded successfully!");
//   } catch (error) {
//     console.error("Error seeding room types:", error);
//     process.exit(1);
//   }
// };

// const closeConnection = async () => {
//   try {
//     await mongoose.connection.close();
//     console.log("Database connection closed successfully!");
//   } catch (error) {
//     console.error("Error closing database connection:", error);
//     process.exit(1);
//   }
// };

const dbSeed = async () => {
  try {
    // connect Database
    await seedUsers();
    await seedHotels();
    await seedRoomType();
    await seedReviews();
    await seedRoom();

    console.log("Data seeded successfully . . . ");
    await fs.writeFile("seeded.txt", "true");
    console.log("flag set successfully");
    // await closeConnection();
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};



module.exports = dbSeed;
