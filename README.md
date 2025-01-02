# Cabs Booking System Backend

A complete backend system for a **Cabs Booking System** built with  **NodeJs** , **Express.js**, and **MongoDB** . This system provides authentication, ride management, and user and driver profile management for both users and drivers.

## Features

### User Authentication
- **Register User**: Users can register by providing their email, name, and password.
- **Login User**: Authenticated users receive a JWT token for further requests.
- **Profile**: Fetch the authenticated user's profile details.
- **Logout**: Logs users out by invalidating their JWT token.

### Driver Authentication
- **Register Driver**: Drivers can register by providing their email, name, vehicle details, and password.
- **Login Driver**: Authenticated drivers receive a JWT token for further requests.
- **Profile**: Fetch the authenticated driver's profile details.
- **Logout**: Logs drivers out by invalidating their JWT token.

### Ride Management
- **Book Ride**: Users can book a ride by providing pick-up and drop-off locations.
- **Ride Status**: Drivers can update the status of the ride (e.g., accepted, completed).
- **Ride History**: Users and drivers can view their past rides.

## Tech Stack

- **Backend**: Express.js (Web Framework)
- **Database**: MongoDB (NoSQL Database)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Environment Management**: dotenv


## ⚙️ Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd backend

2. Create a .env file in the root directory with the following variables:
   ```bash
   PORT=""
   MONGO_URI=""
   JWT_SECRET=your_jwt_secret_key

3. Start the server:
   ```bash
   npm start

4. Available Routes
   User Routes
   ```bash
    POST /api/users/register: Register a new user with email, name, and password.
    POST /api/users/login: Login an existing user and receive a JWT token.
    GET /api/users/profile: Fetch the authenticated user's profile details.
   POST /api/users/logout: Log the user out by invalidating their JWT token
   
5.  captain Routes
   ```bash
   POST /api/captain/register: Register a new driver with email, name, vehicle details, and 
   password.
   POST /api/captain/login: Login an existing driver and receive a JWT token.
   GET /api/captain/profile: Fetch the authenticated driver's profile details.
   POST /api/captain/logout: Log the driver out by invalidating their JWT token.

