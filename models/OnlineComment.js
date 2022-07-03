const mongoose = require("mongoose");
const { slugify } = require("transliteration");

const OnlineCommentSchema = new mongoose.Schema({
  comment: {
    type: String,
    required: [true, "Сэтгэгдэл оруулна уу"],
  },

  onlineGroup: {
    type: mongoose.Schema.ObjectId,
    ref: "OnlineGroup",
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

module.exports = mongoose.model("OnlineComment", OnlineCommentSchema);
