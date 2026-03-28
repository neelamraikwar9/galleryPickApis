const jwt = require("jsonwebtoken"); 

const verifyJWTMiddleware = (req, res, next) => {
  const token = req.headers["authorization"];
  console.log(token, "token");

  if (!token) {
    return res.status(401).json({ message: "No token provided or invalid format." });
  }

  try {
    // console.log(token);
    const decodeToken = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decodeToken, "decodeToken");
    req.user = decodeToken;
    next();
  } catch (error) {
    console.log(error, "error");
    res.status(401).json({ message: "Invalid token." });
  }
};


module.exports = verifyJWTMiddleware; 

