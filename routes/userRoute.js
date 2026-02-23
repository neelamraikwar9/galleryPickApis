
const express = require("express");

const {
  // changePassword,
  // forgotPassword,
  loginUser,
  logoutUser,
  registerUser,
  verification,
  verifyOTP,
} = require("../controllers/userController.js");
const  isAuthenticated = require("../middleware/isAuthenticated.js");
const { userSchema, validateUser } = require ("../validators/userValidate.js");

const router = express.Router();

router.post("/register", validateUser(userSchema), registerUser);
router.post("/verify", verification);
router.post("/login", loginUser);
router.post("/logout", isAuthenticated, logoutUser);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp/:email", verifyOTP);
router.post("/change-password/:email", changePassword);

module.exports = router;
