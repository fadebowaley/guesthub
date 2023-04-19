const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const Room = require("../models/room");
const Category = require("../models/category");
const mongoose = require("mongoose");
const faker = require("faker");
const connectDB = require("./../config/db");

//connect to the database here
connectDB();

const rooms = [
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

const seedRooms = async () => {
  try {
    // Delete all existing rooms
      await Room.deleteMany({});
      console.log("All rooms deleted successfully!");
      

    // Find all categories
    const categories = await Category.find();

    // Create rooms for each category
    for (const category of categories) {
      const categoryRooms = rooms.map((room) => {
        return {
          ...room,
          category: category._id,
        };
      });
      await Room.insertMany(categoryRooms);
      console.log(
        `Seeded ${categoryRooms.length} rooms for ${category.title} category`
      );
    }
    console.log("All rooms seeded successfully!");
    await mongoose.connection.close();
  } catch (error) {
    console.log(error);
  }
};










          
          
seedRooms();