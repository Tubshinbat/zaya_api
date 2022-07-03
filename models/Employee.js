const mongoose = require("mongoose");
const { slugify } = require("transliteration");

const EmployeeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
    unique: true,
  },

  status: {
    type: String,
    required: true,
  },

  details: {
    type: String,
    trim: true,
  },

  picture: {
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

module.exports = mongoose.model("Employee", EmployeeSchema);
