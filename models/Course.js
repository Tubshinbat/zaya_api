const mongoose = require("mongoose");
const { slugify } = require("transliteration");

const CourseSchema = new mongoose.Schema({
  status: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  courseNumber: {
    type: String,
    unique: true,
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

  startDate: {
    type: String,
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

  teachers: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Employee",
    },
  ],

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

CourseSchema.pre("save", function (next) {
  this.slug = slugify(this.name);
  next();
});

CourseSchema.pre("findByIdAndUpdate", function (next) {
  this.slug = slugify(this.name);
  next();
});

module.exports = mongoose.model("Course", CourseSchema);
