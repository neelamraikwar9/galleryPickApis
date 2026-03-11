const { mongoose } = require("mongoose"); 

const ImageSchema = new mongoose.Schema({
    imageId: {
        type: String, 
        required: true, 
        unique: true
    },

    albumId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Album', 
        required: true
    },

    name:{

    }, 

    tags: {

    }, 

    person: {

    }, 

    isFavorite: {

    }, 

    comments: {

    }, 

    size: {

    }, 

    uploadedAt: {

    },

    imgUrl: {type: String, rquired: true},
}); 

const ImageModel = mongoose.model("Imagess", ImageSchema); 
module.exports = { ImageModel }; 