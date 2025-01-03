const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_CONNECT);
    console.log("Connected to the database successfully!");
  } catch (error) {
    console.log(`Error during the connection: ${error.message}`);
  }
};

module.exports = connectDB;
