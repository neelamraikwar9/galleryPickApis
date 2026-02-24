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
const authRoute = require("./routes/authRoute")
const passport = require("./config/passport"); 
// // import userRoute from './routes/userRoute';
// const userRoute = require("./routes/userRoute");

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);
    console.log(hashed, "hashed");
    const user = new galeryUser({ name, email, password: hashed });
    console.log(user, "user");
    await user.save();
    res.status(201).json({ message: "User created." });
  } catch (error) {
    console.log(error, "error");
    res.status(400).json({ error: "User creation failed" });
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
    const decodeToken = jwt.verify(token, JWT_SECRET);
    req.user = decodeToken;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token." });
  }
};

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await galeryUser.findOne({ email });

  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(401).json({ error: "Invalid credentials" });
  }

  // Create JWT
  const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, {
    expiresIn: "6h",
  });
  res.json({ token });
});

// Protected Route Example;
app.get("/private", verifyJWT, (req, res) => {
  res.json({ message: "Welcome to the private route!", user: req.user });
});

initializeDB();

app.use('/auth', authRoute);




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


// const express = require("express"); 
// const dotenv = require("dotenv"); 
// const { initializeDB } = require("./database/db.connect");
// const userRoute = require("./routes/userRoute")
// const authRoute = require("./routes/authRoute");
// const cors = require("cors");
// const passport = require("passport"); 

// const app = express();
// app.cors(); 

// const PORT = process.env.PORT || 3000;

// app.use(express.json());
// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//   }),
// );

// app.use("/auth", authRoute);
// app.use("/user", userRoute);

// // http://localhost:8000/user/register

// app.listen(PORT, () => {
//   connectDB();
//   console.log(`Server is listening at port ${PORT}`);
// });