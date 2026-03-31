const { mongoose } = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const ImageSchema = new mongoose.Schema(
  {
    imgUrl: { type: String, required: true },
    
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

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "galleryUser",
      required: true,
    },

    person: {
      type: String,
      default: null,
      trim: true,
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
