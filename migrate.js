// const mongoose = require("mongoose");
// const ImageModel = require("./models/Image.model");
// const Album = require("./models/Album.model");

// mongoose.connect(process.env.MONGODB || "your - connection - string");

// // async function migrateImages(){
// //     try{
// //         console.log('Starting migration...')
// //          const imagesWithoutUserId = await ImageModel.find({ userId: { $exists: false }
// //     })
// // }
// //     catch(error){

// //     }
// // }

// async function migrateImages() {
//   try {
//     console.log("🔄 Starting migration...");

//     // Find images without userId
//     const imagesWithoutUserId = await ImageModel.find({
//       userId: { $exists: false },
//     });
//     console.log(`Found ${imagesWithoutUserId.length} images to migrate`);

//     let updated = 0;
//     for (let image of imagesWithoutUserId) {
//       const album = await Album.findById(image.albumId);
//       if (album && album.userId) {
//         image.userId = album.userId;
//         await image.save();
//         updated++;
//         console.log(
//           `✅ Updated image ${image._id} with userId ${album.userId}`,
//         );
//       }
//     }

//     console.log(`✅ Migration complete! Updated ${updated} images`);
//     process.exit(0);
//   } catch (error) {
//     console.error("❌ Migration failed:", error);
//     process.exit(1);
//   }
// }

// migrateImages();