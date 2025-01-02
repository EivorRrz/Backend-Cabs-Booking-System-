# Cabs Booking System Backend

A complete backend system for a **Cabs Booking System** built with **Express.js**, **MongoDB**, and **JWT**. This system provides authentication, ride management, and user and driver profile management for both users and drivers.

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

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
