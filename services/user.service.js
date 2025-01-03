const userModel = require("../models/userModel.js");
//this is basically for creating the user if not!!

module.exports.createUser = async ({
  firstname,
  lastname,
  email,
  password,
}) => {
  if (!firstname || !lastname || !email || !password) {
    throw new Error("All fields must be required!");
  }

  //if there is nothing just create a user!!
  //base  Parameter we are taking for the creation!!
  const user = userModel({
    fullname: {
      firstname,
      lastname,
    },
    email,
    password,
  });
  await user.save();
  return user;
};
