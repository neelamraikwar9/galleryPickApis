const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
const cors = require("cors");
const bcrypt = require("bcrypt");
const galeryUser = require("./models/User.model");
const dotenv = require("dotenv");
const { initializeDB } = require("./db.connect");
const axios = require("axios");

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

//Apis for google oAuth;

app.get("/auth/google", (req, res) => {
  // const googleAuthUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=http://localhost:${PORT}/auth/google/callback&response_type=code&scope=profile email`;

  // Fixed code
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=http://localhost:${PORT}/auth/google/callback&response_type=code&scope=profile email`;

  res.redirect(googleAuthUrl);
});

app.get("/auth/google/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).send("Authorization code not provided.");
  }

  try {
    const { data: tokenData } = await axios.post(
      "https://oauth2.googleapis.com/token",

      new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: `http://localhost:${PORT}/auth/google/callback`,
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }, // Required header for Google
      },
    );

    // Extract Google's access token from the response
    const { access_token } = tokenData;

    const { data: user } = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    );

    const jwt = require("jsonwebtoken");

    // Create your app's JWT containing user's Google ID and email
    const appJwt = jwt.sign(
      {
        userId: user.id, // Google's unique user ID
        email: user.email, // User's verified Google email
      },
      process.env.JWT_SECRET, // Your app's secret key (keep this secure!)
      { expiresIn: "1h" }, // JWT expires in 1 hour
    );

    // Set secure httpOnly JWT cookie - frontend can use this for authenticated API calls
    res.cookie("jwt", appJwt, {
      httpOnly: true, // Prevents JavaScript access (XSS protection)
      secure: false, // Set true in production with HTTPS
    });

    res.redirect(`${process.env.FRONTEND_URL}/v1/profile/google`);
  } catch (error) {
    console.log(error);
    res.status(500).send("Authentication failed");
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server is running on the port ${PORT}`);
});
