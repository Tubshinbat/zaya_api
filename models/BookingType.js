const mongoose = require("mongoose");
const { slugify } = require("transliteration");

const BookingTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
  },

  createAt: {
    type: Date,
    default: Date.now,
  },

  updateAt: {
    type: Date,
    default: Date.now,
  },

  createUser: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },

  updateUser: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("BookingType", BookingTypeSchema);
