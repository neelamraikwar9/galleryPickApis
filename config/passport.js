// const passport = require("passport");

// import { Strategy as GoogleStrategy } from ("passport-google-oauth20");
// // const  { Strategy as GoogleStrategy } = require("passport-google-oauth20");

// const galleryUser = require("galleryUser");

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: "/auth/google/callback",
//     },
//     async (accessToken, refreshToken, profile, cb) => {
//       try {
//         let user = await galleryUser.findOneAndUpdate(
//           { googleId: profile.id },
//           { isLoggedIn: true },
//         );

//         if (!user) {
//           user = await galleryUser.create({
//             googleId: profile.id,
//             username: profile.displayName,
//             email: profile.emails[0].value,
//             avatar: profile.photos[0].value,
//           });
//         }
//         return cb(null, user);
//       } catch (error) {
//         return cb(error, null);
//       }
//     },
//   ),
// );
