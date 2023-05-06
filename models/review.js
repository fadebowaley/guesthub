const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { conn } = require("../config/dbb");

const reviewSchema = Schema({
  rating: {
    type: Number,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  hotel: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
    },
  ],
});

module.exports = conn.model("Review", reviewSchema);
