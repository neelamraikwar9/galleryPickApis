const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
const cors = require("cors");
const bcrypt = require("bcrypt");
const galeryUser = require("./models/User.model");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const { initializeDB } = require("./database/db.connect");
const axios = require("axios");
// import authRoute from './routes/authRoute';
const authRoute = require("./routes/authRoute");
require("./config/passport");
// const imgRoute =  require("./routes/imgRoute");
const imgRoute = require("./routes/imgRoute");
const albumRoute = require("./routes/albumRoute");
const verifyJWT = require("./routes/middleware"); 
// const userRoute = require("./routes/userRoute")

app.use(bodyParser.json());

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());

dotenv.config();

app.use(express.urlencoded({ extended: true })); // Parses form data
// This middleware tells Express: "Parse incoming request bodies that use form data format."

initializeDB();

app.post("/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await galeryUser.findOne({ email });

    if (existingUser) {
      return res
        .status(401)
        .json({ message: "User already exist. Please Login.", success: false });
    }

    const hashed = await bcrypt.hash(password, 10);
    console.log(hashed, "hashed");
    const user = new galeryUser({ name, email, password: hashed });
    console.log(user, "user");
    await user.save();
    res.status(201).json({ message: "User created.", success: true });
  } catch (error) {
    console.log(error, "error");
    // res.status(400).json({ error: "User creation failed" });
    res.status(400).json({ message: "Internal server error", success: false });
  }
});

//middle ware for json web token;

// const verifyJWTMiddleware = (req, res, next) => {
//   const token = req.headers["authorization"];
//   console.log(token, "token"); 

//   if (!token) {
//     return res.status(401).json({ message: "No token provided." });
//   }

//   try {
//     // console.log(token);
//     const decodeToken = jwt.verify(token, process.env.JWT_SECRET);
//     console.log(decodeToken, "decodeToken")
//     req.user = decodeToken;
//     next();
//   } catch (error) {
//     console.log(error, "error"); 
//     res.status(401).json({ message: "Invalid token." });
//   }
// };

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body, "Recived");

    const user = await galeryUser.findOne({ email });

    if (!user) {
      return res
        .status(401)
        .json({ error: "Invalid credentials", success: false });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: "Invalid credentials", success: false });
    }

    // Create JWT
    const jwtToken = jwt.sign(
      { email: user.email, _id: user._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      },
    );
    res.status(200).json({
      message: "Login Successful",
      success: true,
      jwtToken,
      email,
      name: user.name,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error", success: false });
  }
});

app.get("/users", async (req, res) => {
  try {
    const users = await galeryUser.find();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch users", error: error });
  }
});



app.post("/favorites/images", verifyJWT, async (req, res) => {
  try {
    const { imageId } = req.body;
    const userId = req.user.id; // Comes from JWT token decoded in authMiddleware

    if (!imageId) {
      return res.status(400).json({ message: "imageId is required" });
    }

    const user = await galeryUser.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const index = user.favorites.indexOf(imageId);
    let isFavorite;

    if (index === -1) {
      // Add to favorites
      user.favorites.push(imageId);
      isFavorite = true;
    } else {
      // Remove from favorites
      user.favorites.splice(index, 1);
      isFavorite = false;
    }

    await user.save();
    res.json({ isFavorite, favorites: user.favorites });
  } catch (error) {
    console.error("Toggle favorite error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

// Get all favorite images for logged-in user
// app.get("/favorites/images", verifyJWT, async (req, res) => {
//   try {
//     const userId = req.user_id;
//     console.log(userId, "userId"); 

//     const user = await galeryUser.findById(userId).populate("favorites");
//     console.log(user, "user"); 

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.json(user.favorites || []);
//   } catch (error) {
//     console.error("Get favorites error:", error);
//     res.status(500).json({
//       message: "Server error",
//       error: error.message,
//     });
//   }
// });

//importing img api;
app.use("/", imgRoute);

//importing album api;
app.use("/", albumRoute);



const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server is running on the port ${PORT}`);
});
