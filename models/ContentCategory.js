const mongoose = require("mongoose");
const { transliterate, slugify } = require("transliteration");

const ContentCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    unique: true,
    required: [true, "Ангилалын нэрийг оруулна уу"],
  },

  slug: {
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

ContentCategorySchema.pre("save", function (next) {
  this.slug = slugify(this.name);
  next();
});

ContentCategorySchema.pre("updateOne", function (next) {
  this.slug = slugify(this.name);
  next();
});

module.exports = mongoose.model("ContentCategory", ContentCategorySchema);
