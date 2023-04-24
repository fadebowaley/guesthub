const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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
  features: {
    type: [String],
    required: true,
  },
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hotel",
  },
});


module.exports = mongoose.model("RoomType", RoomTypeSchema);
