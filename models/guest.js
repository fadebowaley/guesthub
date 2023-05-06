const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { conn } = require("../config/dbb");

const guestSchema = new Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  phone_number: {
    type: String,
    required: false,
  },
  reservations: [
    {
      room_id: {
        type: Schema.Types.ObjectId,
        ref: "Room",
        required: true,
      },
      check_in_date: {
        type: Date,
        required: true,
      },
      check_out_date: {
        type: Date,
        required: true,
      },
      num_guests: {
        type: Number,
        required: true,
      },
      room_type: {
        type: Schema.Types.ObjectId,
        ref: "RoomType",
        required: true,
      },
      hotel: {
        type: Schema.Types.ObjectId,
        ref: "Hotel",
        required: true,
      },
    },
  ],
});

module.exports =conn.model("Guest", guestSchema);
