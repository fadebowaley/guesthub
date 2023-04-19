const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const Category = require("../models/category");
const mongoose = require("mongoose");
const connectDB = require("./../config/db");
connectDB();




async function seedDB() {
  async function seedCateg(titleStr) {
    try {
      const categ = await new Category({ title: titleStr });
      await categ.save();
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  async function closeDB() {
    console.log("CLOSING CONNECTION");
    await mongoose.disconnect();
  }

  await seedCateg("Shiloh Apartment");
  await seedCateg("Moses Apartment");
  await seedCateg("Whitehouse Suites");
  await seedCateg("Overflow Apartment");
  await seedCateg("Resort Hotel and Suites");
  await seedCateg("Hallelujah Suites");
  await seedCateg("Joy to the Wise");
  await seedCateg("Booking Office");

  await closeDB();
}


seedDB();
