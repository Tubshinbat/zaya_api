const mongoose = require("mongoose");
const { slugify } = require("transliteration");

const OrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
  },

  pay: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  product: {
    type: mongoose.Schema.ObjectId,
    ref: "Product",
  },

  orderType: {
    type: mongoose.Schema.ObjectId,
    ref: "OrderType",
  },

  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
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

module.exports = mongoose.model("Order", OrderSchema);
