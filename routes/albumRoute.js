const express = require("express"); 
const router = express.Router(); 
const { Album } = require("../models/Album.model"); 
// const dotenv = require("dotenv"); 
const verifyJWT = require("./middleware"); 
// const verifyJWT = require("./middleware/isAuthenticated"); 


router.post("/albums", verifyJWT, async (req, res) => {
    try{
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
    } catch(error){
        console.log(error); 
        res.status(500).json({error: "Failed to add Album."}); 
    }
}); 


router.get("/albums", verifyJWT,  async(req, res) => {
    try {
        const albums = await Album.find({ ownerId: req.user._id });
        console.log(albums, "albums");  
        res.status(200).json(albums); 
    } catch(error){
        console.error(error); 
        res.status(500).json({message: "Failed to fetch albums", error: error }); 
    }
})

//api to delete album; 

router.delete("/albums/:albumId", verifyJWT, async(req, res) => {
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
      }); // ✅ Send success response
    } catch(error){
        console.log(error); 
        res.status(500).json({message: "Fail to delete album."}); 
    }
});

module.exports = router; 