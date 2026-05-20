const express = require("express");
const router = express.Router();
const { Album } = require("../models/Album.model");
const { ImageModel } = require("../models/Image.model");
const verifyJWT = require("./middleware");

router.post("/albums", verifyJWT, async (req, res) => {
  try {
    //add user automatically;
    req.body.ownerId = req.user._id;

    // cret. new instance.
    const album = new Album(req.body);

    //saving to db;
    await album.save();
    console.log(album, "album");
    res
      .status(201)
      .json({ message: "Album added successfully.", Albumnew: album });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to add Album." });
  }
});

router.get("/albums", verifyJWT, async (req, res) => {
  try {
    const albums = await Album.find({ ownerId: req.user._id });
    console.log(albums, "albums");
    res.status(200).json(albums);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch albums", error: error });
  }
});

//api to delete album;
router.delete("/albums/:albumId", verifyJWT, async (req, res) => {
  try {
    const { albumId } = req.params;
    const delAlbm = await Album.findByIdAndDelete(albumId);
    console.log(delAlbm, "delAlbm");
    if (!delAlbm) {
      res.status(400).json({ message: "Album not found" });
    }
    console.log(delAlbm, "Deleted album");
    res.status(200).json({
      message: "Album deleted successfully",
      deletedAlbum: delAlbm,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Fail to delete album." });
  }
});

//returns all albums.
router.get("/albums/shared", verifyJWT, async (req, res) => {
  try {
    const userEmail = req.user.email; // comes from your JWT token (authenticate middleware)

    const sharedAlbums = await Album.find({
      "sharedUsers.email": userEmail, // find albums where this email exists in sharedUsers array
    }).populate("ownerId", "name email avatar");

    if (!sharedAlbums || sharedAlbums.length === 0) {
      return res.status(200).json([]); // return empty array if no shared albums
    }

    res.status(200).json(sharedAlbums);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch shared albums" });
  }
});

//fetching all images of an album;
router.get("/images/:albumId", verifyJWT, async (req, res) => {
  try {
    const images = await ImageModel.find({ albumId: req.params.albumId });
    res.status(200).json(images);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch images" });
  }
});

module.exports = router;
