
const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const  isAuthenticated  = require('../middleware/isAuthenticated.js')



const router = express.Router(); 

//redirect to google login; 
router.get("/google", passport.authenticate("google", {scope: ["profile", "email"]}))

router.get("/google/callback", 
    passport.authenticate("google", {session: false}), 
    (req, res) => {
        try {
            const token = jwt.sign(
              { id: req.user._id, email: req.user.email },
              process.env.JWT_SECRET,
              { expiresIn: "24h" },
            );

            res.redirect(`${process.env.FRONTEND_URL}/auth-success?token=${token}`);
        } catch (error) {
            console.error("Google login error:", error); 
            res.redirect(`${process.env.FRONTEND_URL}/login?error=google_failed`); 
        }
    }
)

router.get("/me", isAuthenticated, (req, res) => {
    res.json({success: true, user: req.user}); 
}); 


module.exports = router; 
