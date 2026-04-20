const passport = require("passport");

// import { Strategy as GoogleStrategy } from ("passport-google-oauth20");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const galleryUser = require("../models/User.model");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // Also check by email (user may have signed up manually before)
          user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // Link Google ID to existing account
            user.googleId = profile.id;
            await user.save();
          } else {
            // Create brand new user
            user = await User.create({
              name: profile.displayName,
              email: profile.emails[0].value,
              googleId: profile.id,
              avatar: profile.photos[0]?.value,
            });
          }
        }
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    },
  ),
);

module.exports = passport;