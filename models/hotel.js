const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { conn } = require("../config/dbb");

const hotelSchema = Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  zip: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  website: {
    type: String,
    required: true,
  },
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  rooms: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
    },
  ],
  roomtypes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RoomType",
    },
  ],
  // add any other relevant fields here
});


module.exports = conn.model("Hotel", hotelSchema);
