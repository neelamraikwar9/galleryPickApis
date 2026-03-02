const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
const cors = require("cors");
const bcrypt = require("bcrypt");
const galeryUser = require("./models/User.model");
const dotenv = require("dotenv");
const { initializeDB } = require("./database/db.connect");
const axios = require("axios");
// import authRoute from './routes/authRoute';
const authRoute = require("./routes/authRoute");
require("./config/passport");
// // import userRoute from './routes/userRoute';
// const userRoute = require("./routes/userRoute");

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

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

const verifyJWT = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ message: "No token provided." });
  }

  try {
    // console.log(token);
    const decodeToken = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodeToken;                                                                                                           
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token." });
  }
};

app.post("/auth/login", async (req, res) => {
  try{
    const { email, password } = req.body;

    const user = await galeryUser.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials", success: false });
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

// // Protected Route Example;
// app.get("/private", verifyJWT, (req, res) => {
//   res.json({ message: "Welcome to the private route!", user: req.user });
// });



app.use("/auth", authRoute);

//Apis for google oAuth;

// app.get("/auth/google", (req, res) => {
//   const googleAuthUrl =
//     `https://accounts.google.com/o/oauth2/v2/auth?` +
//     `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
//     `redirect_uri=http://localhost:4000/auth/google/callback&` +
//     `response_type=code&` +
//     `scope=https://www.googleapis.com/auth/userinfo.email+https://www.googleapis.com/auth/userinfo.profile&` +
//     `access_type=offline&prompt=consent`;
//   res.redirect(googleAuthUrl);
// });

// app.get("/auth/google/callback", async (req, res) => {
//   const { code } = req.query;
//   // if (!code) {
//   //   return res.status(400).send("Authorization code not provided.");
//   // }
//   if (!code)
//     return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_code`);

//   try {
//     // const { data: tokenData } = await axios.post(
//     const { data } = await axios.post(
//       "https://oauth2.googleapis.com/token",

//       new URLSearchParams({
//         client_id: process.env.GOOGLE_CLIENT_ID,
//         client_secret: process.env.GOOGLE_CLIENT_SECRET,
//         code,
//         grant_type: "authorization_code",
//         redirect_uri: `http://localhost:${PORT}/auth/google/callback`,
//       }),
//       {
//         headers: { "Content-Type": "application/x-www-form-urlencoded" }, // Required header for Google
//       },
//     );

//     // Extract Google's access token from the response
//     const { access_token } = data;

//     const { data: user } = await axios.get(
//       "https://www.googleapis.com/oauth2/v2/userinfo",
//       {
//         headers: {
//           Authorization: `Bearer ${access_token}`,
//         },
//       },
//     );

//     const jwt = require("jsonwebtoken");
//     const token = jwt.sign(
//       { id: user.id, email: user.email },
//       process.env.JWT_SECRET,
//     );

//     res.cookie(`jwt`, token, {
//       httpOnly: true,
//       secure: false,
//       sameSite: "1ax",
//     });
//     res.redirect(`${process.env.FRONTEND_URL}/v1/profile/google`);
//   } catch (error) {
//     console.error("OAuth error:", error.response?.data);
//     res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
//   }
// });

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server is running on the port ${PORT}`);
});
