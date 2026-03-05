const express = require("express");

const multer = require("multer");
const cloudinary = require("cloudinary");
const dotenv = require("dotenv");
// const bodyParser = require("body-parser");
const { ImageModel } = require("../models/Image.model");
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

    // uploading to cloudinary.
    const uploadedImgLink = await cloudinary.uploader.upload(file.path, {
      folder: "uploades",
    });

    // saving to mongoDB.
    const newImg = new ImageModel({ imgUrl: uploadedImgLink.secure_url });

    await newImg.save();

    res.status(200).json({
      message: "Image uploaded successfully",
      imgUrl: uploadedImgLink.secure_url,
    });
  } catch (error) {
    res.status(500).json({ message: "Image upload failed", error: error });
  }
});

module.exports = router;
