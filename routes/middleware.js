// const jwt = require("jsonwebtoken"); 

// const verifyJWTMiddleware = (req, res, next) => {
//   const token = req.headers["authorization"] || req.headers.Authorization;
//   console.log(token, "token");

//   if (!token || !token.startsWith("Bearer")) {
//   // if (!token) {
//     return res
//       .status(401)
//       .json({ message: "No token provided or invalid format." });
//   }

//   try {
//     // console.log(token);
//     const tok = token.split("")[1]; 
//     console.log(tok, "tok"); 

//     const decodeToken = jwt.verify(token, process.env.JWT_SECRET);
//     console.log(decodeToken, "decodeToken");

//     req.user = decodeToken;
//     next();
//   } catch (error) {
//     console.log(error, "error");
//     res.status(401).json({ message: "Invalid token." });
//   }
// };


// module.exports = verifyJWTMiddleware; 



const jwt = require("jsonwebtoken");

const verifyJWTMiddleware = (req, res, next) => {
  const headers = req.headers; 
  const authHeader = headers?.authorization || headers?.Authorization;

  console.log("🔍 Full auth header:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("❌ No valid Bearer token");
    return res
      .status(401)
      .json({ message: "No token provided or invalid format." });
  }

  try {
    const token = authHeader.split(" ")[1];
    console.log("✅ Clean token length:", token?.length);

    // const token = req.headers.authorization.split(" ")[1];
    // const token = req.token.authorization.split(" ")[1]; 
    // console.log(tok, "tok"); 



    const decodeToken = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Decoded:", decodeToken.email);

    req.user = decodeToken;
    next();
  } catch (error) {
    console.log("❌ JWT Error:", error.name, error.message);
    res.status(401).json({ message: "Invalid token." });
  }
};

module.exports = verifyJWTMiddleware;
