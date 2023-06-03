const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { conn } = require("../config/dbb"); 

const cartSchema = Schema({
  items: [
    {
      roomTypeId: {
        type: Schema.Types.ObjectId,
        ref: "RoomType",
      },
     noRooms: {
        type: Number,
        default: 0,
      },
     days: {
        type: Number,
        default: 0,
      },
     idNo: {
        type: Number,
        default: 1,
      },
     checkIn: {
        type: Date,       
      },
     checkOut: {
        type: Date,        
      },
      price: {
        type: Number,
        default: 0,
      },
      priceTotal: {
        type: Number,
        default: 0,
      },
      name: {
        type: String,
      },
      hotel: {
        type: String,
      },
      roomCode: {
        type: String,
      },
    },
  ],
  totalRoom: {
    type: Number,
    default: 0,
    required: true,
  },
  totalCost: {
    type: Number,
    default: 0,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = conn.model("Cart", cartSchema);
