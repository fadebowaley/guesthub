const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roomSchema = Schema({
  roomID: {
    type: Number,
    required: true,
  },
  roomType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RoomType",
  },
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "hotel",
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


