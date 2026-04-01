const express = require("express"); 
const router = express.Router(); 
const { Album } = require("../models/Album.model"); 
// const dotenv = require("dotenv"); 
const verifyJWT = require("./middleware"); 


router.post("/albums", verifyJWT, async (req, res) => {
    try{
        //add user automatically; 
        req.body.userId = req.user._id; 
        
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
        const albums = await Album.find( {userId: req.user_id});
        console.log(albums, "albums");  
        res.status(200).json(albums); 
    } catch(error){
        console.error(error); 
        res.status(500).json({message: "Failed to fetch albums", error: error }); 
    }
})

module.exports = router; 