const express = require("express");

const multer = require("multer");
const cloudinary = require("cloudinary");
const dotenv = require("dotenv");
// const bodyParser = require("body-parser");
const { ImageModel } = require("../models/Image.model");
const { Album } = require("../models/Album.model");
const router = express.Router();
const verifyJWT = require("./middleware");
const galleryUser = require("../models/User.model");

dotenv.config();

//cloudinary configuration;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//multerSetUp;

const storage = multer.diskStorage({});

const upload = multer({ storage });

//api to upload Img;

router.post("/upload", verifyJWT, upload.single("image"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).send("No file uploaded");

    //extract field from front;
    const { albumId, name, tags, person, comments } = req.body;

    if (!albumId || !name) {
      return res
        .status(400)
        .json({ message: "Missing required fields: albumId and name" });
    }

    //Checking album belongs to current user
    const album = await Album.findOne({ _id: albumId, ownerId: req.user._id });
    if (!album) {
      return res
        .status(403)
        .json({ message: "Album not found or access denied" });
    }

    // uploading to cloudinary.
    const uploadedImgLink = await cloudinary.uploader.upload(file.path, {
      folder: "uploades",
    });

    //processing tags array;

    const tagsArray = tags
      ? tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [];

    // saving to mongoDB.
    const newImg = new ImageModel({
      imgUrl: uploadedImgLink.secure_url,
      imageId: undefined,
      albumId,
      ownerId: req.user._id,
      name: name.trim(),
      tags: tagsArray,
      person: person?.trim() || null,
      comments: comments ? [{ text: comments.trim() }] : [],
      size: file.size,
    });

    await newImg.save();

    res.status(201).json({
      message: "Image uploaded successfully",
      imgUrl: uploadedImgLink.secure_url,
      imageId: newImg._id,
    });
  } catch (error) {
    console.log("upload error: ", error);
    res.status(500).json({ message: "Image upload failed", error: error });
  }
});

//api to get images;
router.get("/images", verifyJWT, async (req, res) => {
  try {
    const images = await ImageModel.find({ ownerId: req.user._id })
      .populate("albumId", "name")
      .sort({ createdAt: -1 });
    console.log(images, "images");

    console.log(`📸 ${images.length} images for ${req.user.email}`);
    res.status(200).json(images);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch images", error: error });
  }
});

// api to post favorite images;

router.post("/images/favorite", verifyJWT, async (req, res) => {
  try {
    const { imageId } = req.body;
    const userId = req.user._id; // Comes from JWT token decoded in authMiddleware
    console.log(userId, "userId");

    if (!imageId) {
      return res.status(400).json({ message: "imageId is required" });
    }

    const user = await galleryUser.findById(userId);
    console.log(user, "user");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let isCurrentlyFavorite = user.favorites.some(
      (id) => id.toString() === imageId,
    );
    let newFav;

    if (isCurrentlyFavorite) {
      // Add to favorites
      user.favorites = user.favorites.filter((id) => id.toString() !== imageId);
      newFav = false;
    } else {
      user.favorites.push(imageId);
      newFav = true;
    }

    await user.save();
    res.json({
      isFavorite: newFav,
      favorites: user.favorites,
    });
  } catch (error) {
    console.error("Toggle favorite error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

router.get("/images/favorites", verifyJWT, async (req, res) => {
  try {
    const userId = req.user._id;
    console.log(userId, "userId");
    const user = await galleryUser.findById(userId).select("favorites");
    console.log(user, "usern");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const favImages = await ImageModel.find({
      _id: { $in: user.favorites },
    }).populate("ownerId albumId");

    console.log(favImages, "favImages");

    res.json({ favorites: favImages, count: favImages.length });
  } catch (error) {
    console.error("Get favorites error: ", error);
    res.status(500).json({ message: "Server error" });
  }
});



//api to delete image

router.delete(())



module.exports = router;
