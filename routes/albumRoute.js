const express = require("express"); 
const router = express.Router(); 
const { Album } = require("../models/Album.model"); 
// const dotenv = require("dotenv"); 

router.post("/albums", async(req, res) => {
    try{
         const newAlbum = req.body; 
         const album = await addNewAlbum(newAlbum); 
         res
           .status(201)
           .json({ message: "Album added successfully.", Albumnew: album });
    } catch(error){
        res.status(500).json({error: "Failed to add Album."}); 
    }
}); 



module.exports = router; 