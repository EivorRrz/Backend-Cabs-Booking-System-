# Backend-Cabs-Booking-System

A complete backend system for a **Cabs Booking System** built with  **NodeJs** , **Express.js**, and **MongoDB** . This system provides authentication, ride management, and user and driver profile management for both users and drivers.

## Features

### User Authentication
- **Register User**: Users can register by providing their email, name, and password.
- **Login User**: Authenticated users receive a JWT token for further requests.
- **Profile**: Fetch the authenticated user's profile details.
- **Logout**: Logs users out by invalidating their JWT token.

### Captain Authentication
- **Register Captain**: Captain can register by providing their email, name, vehicle details, and password.
- **Login Captain**: Authenticated Captain receive a JWT token for further requests.
- **Profile**: Fetch the authenticated Captain's  profile details.
- **Logout**: Logs Captain out by invalidating their JWT token.

### Ride Management
- **Book Ride**: Users can book a ride by providing pick-up and drop-off locations.
- **Ride Status**: Captain can update the status of the ride (e.g., accepted, completed).
- **Ride History**: Users and Captain can view their past rides.

## Tech Stack

- **Backend**: Express.js (Web Framework)
- **Database**: MongoDB (NoSQL Database)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Environment Management**: dotenv


## ⚙️ Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/EivorRrz/Backend-Cabs-Booking-System-.git
   cd backend

2. Create a .env file in the root directory with the following variables:
   ```bash
   PORT=""
   MONGO_URI=""
   JWT_SECRET=your_jwt_secret_key

3. Start the server:
    ```bash
    npm start
