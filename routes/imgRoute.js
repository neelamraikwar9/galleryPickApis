const express = require("express");

const multer = require("multer");
const cloudinary = require("cloudinary");
const dotenv = require("dotenv");
// const bodyParser = require("body-parser");
const { ImageModel } = require("../models/Image.model");
const { Album } = require("../models/Album.model");
const router = express.Router();

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

router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).send("No file uploaded");

    //extract field from front;
    const { albumId, name, tags, person, userId } = req.body;

    if (!albumId || !name || !userId) {
      return res
        .status(400)
        .json({ message: "Missing required fields: albumId, name, or userId" });
    }

    const album = await Album.findById(albumId); // imp. album model.
    if (!album) {
      return res.status(400).json({ message: "Invalid albumId" });
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
      userId,
      name: name.trim(),
      tags: tagsArray,
      person: person?.trim() || null,
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
router.get("/images", async (req, res) => {
  try {
    const images = await ImageModel.find();
    res.status(200).json(images);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch images", error: error });
  }
});

module.exports = router;
