const mongoose = require("mongoose");

// User Schema
const User = new mongoose.Schema({
  name: { type: String, required: true }, // User's name
  email: { type: String, required: true, unique: true }, // Email must be unique
  password: { type: String }, 
  createdAt: {
    type:Date, 
    default: Date.now,
  }
});

const galeryUser = mongoose.model("User", User);
module.exports = galeryUser; 