# Backend-Cabs-Booking-System 🚗

A complete backend system for a **Cabs Booking System** built with **NodeJs**, **Express.js**, **MongoDB**, **Kafka**, **Redis** and **Docker**. This system provides robust authentication, ride management, and profile management features for both users and drivers. Built with modern technologies including Kafka for real-time event processing, Redis for caching, and Docker for containerization.

## 🌟 Features

### User Authentication
- **Register User** 📝: Users can register by providing their email, name, and password
- **Login User** 🔐: Authenticated users receive a JWT token for further requests
- **Profile** 👤: Fetch the authenticated user's profile details
- **Logout** 🚪: Logs users out by invalidating their JWT token

### Captain Authentication
- **Register Captain** 📝: Captains can register by providing their email, name, vehicle details, and password
- **Login Captain** 🔐: Authenticated Captains receive a JWT token for further requests
- **Profile** 👤: Fetch the authenticated Captain's profile details
- **Logout** 🚪: Logs Captain out by invalidating their JWT token

### Ride Management
- **Book Ride** 🚖: Users can book a ride by providing pick-up and drop-off locations
- **Real-time Tracking** 🗺️: Track ride status and location updates in real-time using Kafka
- **Ride Status** 📊: Captains can update the status of the ride (e.g., accepted, completed)
- **Ride History** 📜: Users and Captains can view their past rides
- **Location Caching** ⚡: Efficient location data caching using Redis

## 🛠️ Tech Stack

### Core Technologies
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (NoSQL Database)

### Authentication & Security
- **Token Management**: JWT (JSON Web Tokens)
- **Password Security**: bcryptjs
- **Input Validation**: express-validator

### Performance & Scalability
- **Message Broker**: Apache Kafka (for real-time events)
- **Caching**: Redis (for session and location caching)
- **Containerization**: Docker

### Development & Operations
- **Environment Management**: dotenv
- **Container Orchestration**: Docker Compose
- **API Documentation**: Swagger/OpenAPI

## ⚙️ Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/EivorRrz/Backend-Cabs-Booking-System-.git
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create environment variables**:
   Create a `.env` file in the root directory with the following variables:
   ```bash
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   KAFKA_BROKERS=localhost:9092
   REDIS_URL=redis://localhost:6379
   ```

4. **Start the services using Docker**:
   ```bash
   # Build and start all services
   docker-compose up -d

   # Start individual services
   docker-compose up -d mongodb
   docker-compose up -d redis
   docker-compose up -d kafka
   ```

5. **Start the server**:
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```


