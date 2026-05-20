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
          accessLevel: { type: String, enum: ["View", "Edit", "Admin"] },
          default: "View",
        },

        accessLevel: {
          type: String,
          enum: ["view", "edit", "admin"],
          default: "view",
        },
      },
    ],
  },
  {
    timestamps: true, // createdAt & updatedAt
  },
);

const Album = mongoose.model("Album", albumSchema);
module.exports = { Album };
