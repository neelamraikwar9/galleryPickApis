const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
const cors = require("cors");
const bcrypt = require("bcrypt");
const galeryUser = require("./models/User.model"); 
const dotenv = require("dotenv"); 
const { initializeDB } = require("./db.connect");

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());

dotenv.config(); 

const JWT_SECRET = process.env.JWT_SECRET;

app.post("/signup", async(req, res) => {
    try{
        const { name, email, password } = req.body; 

        const hashed = await bcrypt.hash(password, 10);
        console.log(hashed, "hashed") 
        const user = new galeryUser({name, email, password: hashed});
        console.log(user, "user"); 
        await user.save(); 
        res.status(201).json({message: "User created."}); 
    } catch(error){
        console.log(error, "error"); 
        res.status(400).json({error: "User creation failed"}); 
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

const PORT = 4000; 
app.listen(PORT, () => {
  console.log(`Server is running on the port ${PORT}`);
});