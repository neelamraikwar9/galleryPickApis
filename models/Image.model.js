const { mongoose } = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const ImageSchema = new mongoose.Schema(
  {
    imageId: {
      type: String,
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
      required: true,
    },

    isFavorite: {
      type: Boolean,
      default: false,
    },

    comments: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "galleryUser",
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
    },

    imgUrl: { type: String, required: true },

    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

const ImageModel = mongoose.model("Imgs", ImageSchema);
module.exports = { ImageModel };
