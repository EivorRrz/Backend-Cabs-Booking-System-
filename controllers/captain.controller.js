const captainModel = require("../models/captain.model.js");
const captainService = require("../services/captain.service.js");
const blackListTokenModel = require("../models/blacklistToken.model.js");  // Corrected the import
const { validationResult } = require("express-validator");

// Register Captain Logic
module.exports.registerCaptain = async (req, res) => {
  // Check if validation errors exist
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullname, email, password, vehicle } = req.body;

  // Check if captain already exists
  const isCaptainAlreadyExist = await captainModel.findOne({ email });
  if (isCaptainAlreadyExist) {
    return res.status(400).json({
      success: false,
      message: "Already Registered!",
    });
  }

  // Hash the password before saving
  const hashedPassword = await captainModel.hashPassword(password);

  // Create a new captain
  const captain = await captainService.createCaptain({
    firstname: fullname.firstname,
    lastname: fullname.lastname,
    email,
    password: hashedPassword,
    color: vehicle.color,
    plate: vehicle.plate,
    capacity: vehicle.capacity,
    vehicleType: vehicle.vehicleType,
  });

  // Generate authentication token for the new captain
  const token = captain.generateAuthToken();

  // Send the response with success message and token
  res.status(201).json({
    success: true,
    message: "Registered Successfully!",
    token,
    captain,
  });
};

// Captain Login Logic
module.exports.loginUser = async (req, res) => {
  // Check if validation errors exist
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Destructure email and password from request body
  const { email, password } = req.body;

  // Find captain by email
  const captain = await captainModel.findOne({ email });
  if (!captain) {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }

  // Compare passwords
  const isMatch = await captain.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }

  // Generate authentication token
  const token = captain.generateAuthToken();
  
  // Set the token in the response cookie
  res.cookie("token", token);

  // Send the response with the token and captain details
  res.status(200).json({
    token,
    captain,
  });
};

// Get Captain Profile Logic
module.exports.getCaptainProfile = async (req, res) => {
  // Return the profile of the authenticated captain
  res.status(200).json({
    captain: req.captain,
  });
};

// Captain Logout Logic
module.exports.logoutCaptain = async (req, res) => {
  // Get the token from cookies or headers
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  // Add the token to the blacklist to invalidate it
  await blackListTokenModel.create({ token });

  // Send the response indicating successful logout
  res.status(200).json({
    message: "Logged Out Successfully!",
  });
};
