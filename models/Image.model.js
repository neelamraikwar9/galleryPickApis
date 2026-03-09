const { mongoose } = require("mongoose"); 

const ImageSchema = new mongoose.Schema({
    imgUrl: {type: String, rquired: true},
}); 

const ImageModel = mongoose.model("Imagess", ImageSchema); 
module.exports = { ImageModel }; 