const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const slug = require("mongoose-slug-updater");

mongoose.plugin(slug);

const RoomTypeSchema = Schema({
  title: {
    type: String, // name of the Room
    required: true,
    },
    
  slug: {
    type: String,
    unique: true,
    slug: "title",
  },
});


module.exports = mongoose.model("RoomType", RoomTypeSchema);
