const userModel = require("../models/userModel.js");
const captainModel = require("../models/captainModel.js"); // Ensure you import the captain model
const blackListTokenModel = require("../models/blacklistToken.model.js");
const jwt = require("jsonwebtoken");

// Middleware for User Authentication
module.exports.authUser = async (req, res, next) => {
  // Get token from cookies or headers
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  // If token is not provided
  if (!token) {
    return res.status(401).json({
      message: "Unauthorized! Token is missing.",
    });
  }

  try {
    // Check if token is blacklisted
    const isBlackListed = await blackListTokenModel.findOne({ token });
    if (isBlackListed) {
      return res.status(401).json({
        message: "Unauthorized! Token is blacklisted.",
      });
    }

    // Decode and verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded._id); // Find user by decoded ID

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    req.user = user; // Attach user to request object
    next();
  } catch (err) {
    console.error("Error during user authentication:", err);
    return res.status(401).json({
      message: "Unauthorized! Invalid token.",
    });
  }
};

// Middleware for Captain Authentication
module.exports.authCaptain = async (req, res, next) => {
  // Get token from cookies or headers
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  // If token is not provided
  if (!token) {
    return res.status(401).json({
      message: "Unauthorized! Token is missing.",
    });
  }

  try {
    // Check if token is blacklisted
    const isBlackListed = await blackListTokenModel.findOne({ token });
    if (isBlackListed) {
      return res.status(401).json({
        message: "Unauthorized! Token is blacklisted.",
      });
    }

    // Decode and verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const captain = await captainModel.findById(decoded._id); // Find captain by decoded ID

    if (!captain) {
      return res.status(404).json({
        message: "Captain not found.",
      });
    }

    req.captain = captain; // Attach captain to request object
    next();
  } catch (err) {
    console.error("Error during captain authentication:", err);
    return res.status(401).json({
      message: "Unauthorized! Invalid token.",
    });
  }
};
