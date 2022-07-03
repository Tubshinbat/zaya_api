const mongoose = require("mongoose");
const { slugify } = require("transliteration");

const ProductSchema = new mongoose.Schema({
  status: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  slug: String,

  productNumber: {
    type: String,
    unique: true,
  },

  name: {
    type: String,
    trim: true,
    required: true,
    unique: true,
  },

  details: {
    type: String,
    trim: true,
  },

  pictures: {
    type: [String],
  },

  price: {
    type: Number,
  },

  priceVal: {
    type: String,
    enum: ["$", "₮"],
    default: "₮",
  },

  views: {
    type: Number,
    default: 0,
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

ProductSchema.pre("save", function (next) {
  this.slug = slugify(this.name);
  next();
});

ProductSchema.pre("findByIdAndUpdate", function (next) {
  this.slug = slugify(this.name);
  next();
});

module.exports = mongoose.model("Product", ProductSchema);
