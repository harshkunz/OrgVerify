// passport.js
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
const dotenv = require('dotenv');
dotenv.config();
const jwt = require("jsonwebtoken");

console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        // Find user by email
        let user = await User.findOne({ email });

        if (!user) {
          // Create new user if not exists
          user = new User({
            email,
            firstName: profile.name.givenName || "GoogleUser",
            lastName: profile.name.familyName || "",
            isVerified: true, // Google verified user
            role: "user",
            password: "", // no password needed for OAuth users
          });
          await user.save();
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serialize user for session (optional if using sessions)
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
