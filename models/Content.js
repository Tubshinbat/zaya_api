const mongoose = require("mongoose");
const { slugify } = require("transliteration");

const ContentSchema = new mongoose.Schema({
  status: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  slug: String,

  type: {
    type: String,
    enum: ["audio", "video", "picture", "default"],
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

  shortDetails: {
    type: String,
  },

  pictures: {
    type: [String],
  },

  categories: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "ContentCategory",
    },
  ],

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

ContentSchema.pre("save", function (next) {
  this.slug = slugify(this.name);
  next();
});

ContentSchema.pre("findByIdAndUpdate", function (next) {
  this.slug = slugify(this.name);
  next();
});

module.exports = mongoose.model("Content", ContentSchema);
