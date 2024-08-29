require('dotenv').config();
const jwt = require("jsonwebtoken");

const AuthMiddleware = (req, res, next) => {
  let token = req.header("Authorization");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Token not found. User is not authorized." });
  }

  // Check if the token starts with "Bearer "
  if (!token.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Malformed token. User is not authorized." });
  }

  // Remove "Bearer " from the token
  token = token.replace("Bearer ", "");

  // Log the token for debugging
  console.log("Received token:", token);

  try {
    const isVerified = jwt.verify(token, process.env.MY_SECRET_KEY);
    req.user = isVerified;
    next();
  } catch (err) {
    console.log(err, "Error in verifying token");
    return res
      .status(401)
      .json({ message: "Invalid or expired token. User is not authorized." });
  }
};

module.exports = AuthMiddleware;
