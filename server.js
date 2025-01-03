const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db.js");
const userRoutes = require("./routes/user.routes.js");
const captainRoutes = require("./routes/captain.routes.js");
const mapsRoutes = require('./routes/maps.routes');
const rideRoutes = require('./routes/ride.routes');



const app = express();
dotenv.config();
connectDB();

//middleware!
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//RESTful routes
app.use("/users", userRoutes);
app.use("/captains", captainRoutes);
app.use('/maps', mapsRoutes);
app.use('/rides', rideRoutes);


//Port and app server Listening!!
PORT = process.env_PORT || 6000;
app.listen(PORT, () => {
  console.log(`Server is running on the ${PORT}`);
});
