const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Hotel = require("./hotel");
const { conn } = require("../config/dbb");

const RoomTypeSchema = Schema({
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
  maxNumberChildren: {
    type: Number,
    required: true,
  },
  maxNumberAdult: {
    type: Number,
    required: true,
  },
  features: {
    type: [String],
    required: true,
  },
  hotel: {
  type: Schema.Types.ObjectId,
  required: true,
  ref: Hotel,
},
});


module.exports = conn.model("RoomType", RoomTypeSchema);
