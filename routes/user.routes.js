const express = require("express");
const router = express.Router();
const { body } = require("express-validator"); // Middleware for validating request body
const userController = require("../controllers/user.controller"); // Import user controller functions
const authMiddleware = require("../middlewares/aut.middlewares");

// Route for user registration
router.post(
  "/register",
  [
    // Validate email format
    body("email").isEmail().withMessage("Invalid email"),
    // Ensure fullname is provided
    body("fullname").notEmpty().withMessage("Full name is required"),
    // Validate first name (minimum 3 characters)
    body("fullname.firstname")
      .isLength({ min: 3 })
      .withMessage("First name must be at least 3 characters"),
    // Validate last name (minimum 3 characters)
    body("fullname.lastname")
      .isLength({ min: 3 })
      .withMessage("Last name must be at least 3 characters"),
    // Validate password length (minimum 6 characters)
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  userController.registerUser // Controller function to handle user registration
);

// Route for user login
router.post(
  "/login",
  [
    // Validate email format
    body("email").isEmail().withMessage("Invalid Email"),
    // Validate password length (minimum 6 characters)
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  userController.loginUser // Controller function to handle user login
);

//the Register and Login are the post Request hence requires validation!!!
// where are the profile and the logout  are the get para!!

//To Get the Profile!
router.get("/profile", authMiddleware.authUser, userController.getUserProfile);

//to get the logout seen!
router.get("/logout", authMiddleware.authUser, userController.logoutUser);

// Export the router for use in other parts of the application
module.exports = router;
