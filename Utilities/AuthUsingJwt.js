const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

//cretaing token
const createToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "1d" });
};

//verifytoken
const verifyToken = (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader ? authHeader.replace("Bearer ", "") : null;
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log(decoded);
    req.user = { _id: decoded.userId };
    console.log(req.user)
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = { createToken, verifyToken };
