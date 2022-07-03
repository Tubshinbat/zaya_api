const mongoose = require("mongoose");
const { slugify } = require("transliteration");

const OnlineGroupSchema = new mongoose.Schema({
  status: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  slug: String,

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

  shortDetails: {
    type: String,
  },

  pictures: {
    type: [String],
  },

  price: {
    type: Number,
    required: [true, "Үнийн мэдээлэл оруулна уу"],
  },

  priceVal: {
    type: String,
    enum: ["₮", "$"],
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

OnlineGroupSchema.pre("save", function (next) {
  this.slug = slugify(this.name);
  next();
});

OnlineGroupSchema.pre("findByIdAndUpdate", function (next) {
  this.slug = slugify(this.name);
  next();
});

module.exports = mongoose.model("OnlineGroup", OnlineGroupSchema);
