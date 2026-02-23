const mongoose = require("mongoose");

// User Schema
const userSchema = new mongoose.Schema(
  {
    username: { type: String }, // User's name
    email: { type: String, required: true, unique: true }, // Email must be unique
    password: { type: String },
    googleId: { type: String },
    avatar: { type: String },

    isVerified: { type: Boolean, default: false },
    isLoggedIn: { type: Boolean, default: false },
    token: { type: String, defautl: null },
    otp: { type: String, default: null },
    otpExpiry: { type: Date, default: null },
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