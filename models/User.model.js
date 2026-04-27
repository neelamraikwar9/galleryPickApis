
const mongoose = require("mongoose");
const bcrypt = require("bcrypt"); 

// User Schema
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // User's name
    email: { type: String, required: true, unique: true }, // Email must be unique
    password: { type: String, required: function(){
      return !this.googleId; 
    } 
  },

  googleId: {
    type: String, 
    default: null, 
  }, 

  avatar: {
    type: String, 
    default: null, 
  }, 

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

// userSchema.pre("save", async function (){
//   if(!this.isModified("password") || !this.password) return; 
//   this.password = await bcrypt.hash(this.password, 10); 
// }); 

const galleryUser = mongoose.model("galleryUser", userSchema);

module.exports = galleryUser;
