# NepWay - Ride the Nepali Way

A complete ride-sharing platform built with MERN stack featuring authentic Nepali cultural elements.

## Features

- **User Authentication**: Secure login/register for both general users and drivers
- **Ride Management**: Create, browse, and book rides with real-time tracking
- **Virtual Ride System**: Automatic ride progression for testing (1km/s speed)
- **Ratings & Reviews**: Comprehensive rating system for drivers and passengers
- **Beautiful UI**: Nepal-themed backgrounds with scenic landmarks
- **Location Services**: OpenStreetMap integration for location picking
- **Professional Dashboard**: Separate panels for users and drivers
- **Fare Calculation**: Tiered pricing system (Rs. 30 base + distance-based)

## Tech Stack

- **Frontend**: React 18.2.0, React Router, Axios
- **Backend**: Node.js, Express.js, MongoDB
- **Authentication**: JWT tokens
- **Maps**: OpenStreetMap with Leaflet
- **Styling**: Custom CSS with Nepal-themed backgrounds

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally on port 27017)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nepway
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install backend dependencies
   cd server
   npm install
   
   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. **Environment Setup**
   - Backend `.env` file is already configured for local MongoDB
   - MongoDB URI: `mongodb://127.0.0.1:27017/rideapp`
   - JWT Secret: `supersecretkey`

4. **Start the application**
   ```bash
   # Start backend server (from server directory)
   cd server
   node index.js
   
   # Start frontend (from client directory - in new terminal)
   cd client
   npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Project Structure

```
nepway/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── api/          # API configuration
│   │   └── ...
│   └── package.json
├── server/                # Node.js backend
│   ├── controllers/      # API controllers
│   ├── middleware/       # Authentication middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   └── package.json
└── README.md
```

## Key Components

- **Authentication**: JWT-based secure authentication
- **Ride Management**: Complete CRUD operations for rides
- **Real-time Tracking**: Virtual ride progression system
- **User Roles**: General users and drivers with different permissions
- **Rating System**: 5-star rating system with reviews
- **Beautiful UI**: Nepal-themed backgrounds with cultural elements

## Database Models

- **User**: Authentication and profile management
- **Ride**: Ride creation and management
- **RideRequest**: Ride booking system
- **Rating**: Rating and review system
- **Notification**: User notifications

## API Endpoints

- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/rides` - Get all rides
- `POST /api/rides` - Create new ride
- `POST /api/rides/:id/book` - Book a ride
- And many more...

## Cultural Elements

- **Nepal-themed backgrounds**: Mount Everest, Lumbini, Phewa Lake, etc.
- **Local branding**: "Ride the Nepali Way" tagline
- **Himalayan-inspired logo**: Mountain and route design
- **Nepali terminology**: Cultural naming conventions

## Contributing

This is an academic project for Software Engineering course. Feel free to explore and learn from the codebase.

## License

Academic project - All rights reserved.
