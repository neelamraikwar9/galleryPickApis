const express = require("express");

const multer = require("multer");
const cloudinary = require("cloudinary");
const dotenv = require("dotenv");
// const bodyParser = require("body-parser");
const { ImageModel } = require("../models/Image.model");
const { Album } = require("../models/Album.model");
const router = express.Router();
const verifyJWT = require("./middleware"); 

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

    // const album = await Album.findById(albumId); // imp. album model.
    // if (!album) {
    //   return res.status(400).json({ message: "Invalid albumId" });
    // }

    // ✅ NEW: Check album belongs to current user
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
    const images = await ImageModel.find({ ownerId: req.user._id }).populate('albumId', 'name').sort({ createdAt: -1});
    console.log(images, "images"); 
    
    console.log(`📸 ${images.length} images for ${req.user.email}`);
    res.status(200).json(images);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch images", error: error });
  }
});

module.exports = router;
