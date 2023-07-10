const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Hotel = require("./hotel");
const { conn } = require("../config/dbb");

const roomSchema = Schema({
  roomID: {
    type: String,
    required: true,
  },
  roomType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RoomType",
  },
  hotel: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: Hotel,
  },
  checkIn: {
    type: Date,
  },
  checkOut: {
    type: Date,
  },
  available: {
    type: Boolean,
    default: true,
  },
  lock: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = conn.model("Room", roomSchema);
