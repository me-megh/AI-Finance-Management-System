const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", ""); // Extract the token from the Authorization header

  if (!token) {
    return res.status(401).json({ msg: "Access denied, no token provided" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add userId to the request object
    req.userId = decoded.id; // This is the value you store in JWT when signing

    next(); // Pass control to the next middleware or route handler
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ msg: "Token expired" });
    }
    return res.status(400).json({ msg: "Invalid token" });
  }
};

module.exports = authenticate;
