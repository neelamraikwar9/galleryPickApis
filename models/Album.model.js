const mongoose = require("mongoose"); 
const { v4: uuidv4 } = require("uuid"); 

const albumSchema = new mongoose.Schema(
  {
    albumId: {
      type: String,
      required: true,
      unique: true,
      default: () => uuidv4(),
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "galleryUser",
      // required: true,
    },

    sharedUsers: [
      {
        email: {
          type: String,
          required: true,
          lowercase: true,
        },

        accessLevel: {
          type: String,
          enum: ["view", "edit", "admin"],
          default: "view",
        },

        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true, // createdAt & updatedAt
  },
);

// Index for faster queries
// albumSchema.index({ ownerId: 1 });
// albumSchema.index({ 'sharedUsers.email': 1 });

module.export = mongoose.model("Album", albumSchema);
