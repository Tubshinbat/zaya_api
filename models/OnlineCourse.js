const mongoose = require("mongoose");
const { slugify } = require("transliteration");

const OnlineCourseSchema = new mongoose.Schema({
  status: {
    type: Boolean,
    enum: [true, false],
    default: false,
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

  video: {
    type: String,
  },

  group: {
    type: mongoose.Schema.ObjectId,
    ref: "OnlineGroup",
  },

  teachers: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Employee",
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

module.exports = mongoose.model("OnlineCourse", OnlineCourseSchema);
