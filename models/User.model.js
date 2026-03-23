const mongoose = require("mongoose");

// User Schema
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // User's name
    email: { type: String, required: true, unique: true }, // Email must be unique
    password: { type: String, required: true },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Imgs" }],

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

const galleryUser = mongoose.model("galleryUser", userSchema);

module.exports = galleryUser;
