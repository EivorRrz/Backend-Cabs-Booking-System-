const { validationResult } = require("express-validator");
const userModel = require("../models/userModel.js");
const userService = require("../services/user.service.js");
const blackListTokenModel = require("../models/blacklistToken.model.js");

// User Register Logic!!
module.exports.registerUser = async (req, res) => {
  // Check for validation errors in the request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Return error response if validation fails
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  // Extract data from the request body
  const { fullName, email, password } = req.body;

  // Check if the user already exists in the database
  const existingUser = await userModel.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: "User is already registered with this email!",
    });
  }

  // Create a new user with the provided details
  const user = await userService.createUser({
    firstname: fullName.firstname,
    lastname: fullName.lastname,
    email,
    password,
  });

  // Hash the password before saving it to the database
  const hashedPassword = await user.hashPassword(password);
  user.password = hashedPassword;

  // Save the new user to the database
  await user.save();

  // Generate an authentication token for the new user
  const token = user.generateAuthToken();

  res.status(201).json({
    token,
    user,
  });

  console.log(req.body);
};

// Login Logic!!
module.exports.loginUser = async (req, res) => {
  // Check for validation errors in the request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Return error response if validation fails
    return res.status(400).json({ errors: errors.array() });
  }

  // Extract email and password from the request body
  const { email, password } = req.body;

  // Find the user by email, including the password field
  const user = await userModel.findOne({ email }).select("+password");
  if (!user) {
    return res.status(401).json({
      message: "Invalid Credentials!",
    });
  }

  // Compare the provided password with the stored hash
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({
      message: "Invalid Credentials",
    });
  }

  // Generate an authentication token for the logged-in user
  const token = user.generateAuthToken();

  // Set the token in the response cookies with secure settings
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  res.status(201).json({
    token,
    user,
  });
};

// Get User Profile Logic!!
module.exports.getUserProfile = async (req, res) => {
  // Return the authenticated user's profile
  res.status(200).json(req.user);
};

// Logout Logic!!
module.exports.logoutUser = async (req, res) => {
  res.clearCookie("token");

  // Retrieve the token
  const token = res.cookie.token || res.header.authorization?.split(" ")[1];

  // Add the token to the blacklist collection to invalidate it
  await blackListTokenModel.create({ token });

  res.status(200).json({
    message: "Logged Out Successfully",
  });
};
