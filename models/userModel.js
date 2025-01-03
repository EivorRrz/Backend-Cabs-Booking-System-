const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken"); // Define the schema for the User model

const userSchema = new mongoose.Schema({
  fullname: {
    firstname: {
      type: String,
      required: true,
      minlength: [3, "First name must be at least 3 characters long"], // Validation for first name
    },
    lastname: {
      type: String,
      minlength: [3, "Last name must be at least 3 characters long"], // Validation for last name
    },
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensure no duplicate emails
    minlength: [5, "Email must be at least 5 characters"], // Validation for email
  },
  password: {
    type: String,
    required: true, // Password is mandatory
    select: false, // Exclude password field by default in queries
  },
  socketId: {
    type: String,
    default: null, // Default value for socketId
  },
});

//method to generate an authentication token!
//after the user create an account it will generate the auth token for the particular user for the authentication//unique!
//and we can get it from the headers or the cookies!
//it will check the token with the jwt for the authentication!
//and then it will check the password with the helo of bcrypt and then it will compare the pass/this.pass!

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
    },
    process.env.JWT_SECRET
  );
  return token;
};

//method to hash the Password!
userSchema.methods.hashPassword = async function () {
  return await bcrypt.hash(password, 18);
};
//methods to compare the password and this._password!!
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

//Exporting the Schema into Model
const userModel = mongoose.model("User", userSchema);
module.exports = userModel;
