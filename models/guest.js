const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { conn } = require("../config/dbb");

const guestSchema = new Schema({
  
  title: {
    type: String,
    required: true,
  },
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
    lowercase: true,
  },
  
  city: {
    type:String,
  },
  residential: {
    type: String
  },
  phone_number: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  paymentRef: {
    type: String,
    required: true,
  },
  created: {
    type: Date,
    default: Date.now,
  },
  reservations: [
    {
      room_id: {
        type: Schema.Types.ObjectId,
        ref: "Room",
        required: false,
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
        type: String,
        required: true,
      },
    },
  ],

//Other checkIn Data
  nationality: {
    type: String,
    
  },
  identification: {
    type: String,
    
  },
  religion: {
    type: String,
   
  },
  denomination: {
    type: String
  },
  purpose: {
    type: String
  },
  occupation: {
    type: String
  },
  organization: {
    type: String
  },
  cityOrg: {
    type: String
  },
  stateOrg: {
    type: String
  },
  countryOrg: {
    type: String
  },
  nextOfKin: {
    type: String
  },
  nokAddress: {
    type: String
  },
  nokTel: {
    type: String
  },
  nokOccupation: {
    type: String
  }

});

module.exports =conn.model("Guest", guestSchema);
