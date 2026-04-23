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
const googleAuthRoute = require("./routes/googleAuthRoute");
require("./config/passport");
const imgRoute = require("./routes/imgRoute");
const albumRoute = require("./routes/albumRoute");
const verifyJWT = require("./routes/middleware"); 
const passport = require("./config/passport"); 
app.use(passport.initialize());

app.use(bodyParser.json());

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());

dotenv.config();

app.use(express.urlencoded({ extended: true })); // Parses form data
// This middleware tells Express: "Parse incoming request bodies that use form data format."

initializeDB();


// app.use((req, res, next) => {
//   console.log(`${req.method} ${req.path}`, "debuggingg");
//   next();
// });

// // Put this BEFORE your route registrations
// app.use("/", imgRoute);


// app.use((req, res, next) => {
//   console.log(`➡️ ${req.method} ${req.path}`, "debugg");
//   next();
// });

// // THEN your routes
// app.use("/", imgRoute);











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
      { email: user.email, _id: user._id.toString() },
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




// Get all favorite images for logged-in user


//importing img api;
app.use("/", imgRoute);     //lkjklkl;;;;;

app.use("/images/favorites", imgRoute);     //lkjklkl;;;;;

//importing album api;
app.use("/", albumRoute);

app.use("/auth", googleAuthRoute); 


const PORT = 4000;
app.listen(PORT, () => {  
  console.log(`Server is running on the port ${PORT}`);
});
