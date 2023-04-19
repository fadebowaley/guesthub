const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roomSchema = Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  features: {
    type: [String],
    required: true,
  },
  roomType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RoomType",
  },
  available: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Room", roomSchema);


