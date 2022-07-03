const mongoose = require("mongoose");
const { slugify } = require("transliteration");

const BookingSchema = new mongoose.Schema({
  status: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  bookingNumber: {
    type: String,
    unique: true,
  },

  bookingType: {
    type: mongoose.Schema.ObjectId,
    ref: "OrderType",
  },

  service: {
    type: mongoose.Schema.ObjectId,
    ref: "Service",
    required: [true, "Үйлчилгээ сонгоно уу"],
  },

  date: {
    type: String,
  },

  time: {
    type: String,
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

module.exports = mongoose.model("Booking", BookingSchema);
