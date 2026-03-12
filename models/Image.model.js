const { mongoose } = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const ImageSchema = new mongoose.Schema(
  {
    imageId: {
      type: String,
      required: true,
      required: true,
      default: () => uuidv4(),
    },

    albumId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Album",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    person: {
      type: String,
    },

    isFavorite: {
      type: Boolean,
      default: false,
    },

    comments: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },

        text: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    size: {
      type: Number,
      required: true,
    },

    imgUrl: { type: String, rquired: true },

    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timeStamps: true,
  },
);

const ImageModel = mongoose.model("Imagess", ImageSchema);
module.exports = { ImageModel };
