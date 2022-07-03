const mongoose = require("mongoose");
const { slugify } = require("transliteration");

const CourseOrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
  },

  pay: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  courseIs: {
    type: String,
    enum: ["course", "onlineCourse"],
    default: "course",
  },

  course: {
    type: mongoose.Schema.ObjectId,
    ref: "Course",
  },

  onlineCourse: {
    type: mongoose.Schema.ObjectId,
    ref: "OnlineGroup",
  },

  orderType: {
    type: mongoose.Schema.ObjectId,
    ref: "OrderType",
  },

  createAt: {
    type: Date,
    default: Date.now,
  },

  updateAt: {
    type: Date,
    default: Date.now,
  },

  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
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

module.exports = mongoose.model("CourseOrder", CourseOrderSchema);
