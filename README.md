# Corporate Ride Scheduling Backend API

A comprehensive REST API for corporate ride scheduling and management system built with Node.js, Express.js, and MongoDB.

## 🚀 Features

### Authentication & Authorization
- **JWT-based Authentication** with secure token management
- **Role-based Authorization** (User, Admin)
- **Password Hashing** with bcryptjs
- **Account Security** with login attempt limiting

### User Management
- **User Registration & Login** with validation
- **Profile Management** with comprehensive user data
- **Department-based Organization** for corporate structure
- **Employee ID Integration** for company identification

### Ride Management
- **Ride Booking System** with pickup/drop locations
- **Real-time Status Tracking** (pending, approved, rejected, in_progress, completed, cancelled)
- **Admin Approval Workflow** for ride requests
- **Fare Estimation & Tracking** with actual fare recording
- **Driver Assignment** with vehicle and contact details
- **Ride Feedback System** with ratings and comments

### Admin Dashboard
- **Comprehensive Analytics** with ride statistics
- **Ride Approval/Rejection** with reason tracking
- **User Management** with role-based controls
- **Action Audit Trail** for administrative activities
- **Department-wise Analytics** for corporate insights

### API Features
- **Swagger Documentation** with interactive API explorer
- **Rate Limiting** for API security
- **CORS Support** for frontend integration
- **Error Handling** with detailed error responses
- **Input Validation** with express-validator
- **Security Headers** with Helmet.js

## 🛠 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **Validation:** express-validator
- **Documentation:** Swagger UI with swagger-jsdoc
- **Security:** Helmet.js, CORS, express-rate-limit
- **Environment:** dotenv

## 📁 Project Structure

```
backend-api/
├── models/              # Database models
│   ├── User.js         # User schema with authentication
│   ├── Ride.js         # Ride booking schema
│   └── AdminAction.js  # Admin action audit schema
├── middleware/          # Custom middleware
│   ├── auth.js         # Authentication & authorization
│   ├── validation.js   # Input validation rules
│   └── errorHandler.js # Global error handling
├── routes/             # API route handlers
│   ├── auth.js         # Authentication routes
│   ├── users.js        # User management routes
│   ├── rides.js        # Ride management routes
│   └── admin.js        # Admin management routes
├── app.js              # Main application file
├── package.json        # Dependencies and scripts
├── .env                # Environment variables
└── README.md          # Project documentation
```

## 🚦 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Update `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/corporate-rides
   
   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_EXPIRES_IN=30d
   
   # CORS Configuration
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   
   Make sure MongoDB is running on your system:
   ```bash
   # For local MongoDB
   mongod
   
   # Or use MongoDB Atlas cloud service
   ```

5. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

The API server will start on `http://localhost:5000`

## 📚 API Documentation

### Interactive Documentation
- **Swagger UI:** http://localhost:5000/api-docs
- **Health Check:** http://localhost:5000/health

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | User login | No |
| GET | `/api/auth/profile` | Get user profile | Yes |
| PUT | `/api/auth/profile` | Update user profile | Yes |

### User Management Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users` | Get all users (Admin) | Admin |
| GET | `/api/users/:id` | Get user by ID (Admin) | Admin |
| PUT | `/api/users/:id` | Update user (Admin) | Admin |
| DELETE | `/api/users/:id` | Delete user (Admin) | Admin |

### Ride Management Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/rides` | Create new ride booking | User |
| GET | `/api/rides` | Get user's rides | User |
| GET | `/api/rides/:id` | Get ride details | User |
| PUT | `/api/rides/:id` | Update ride | User |
| DELETE | `/api/rides/:id` | Cancel ride | User |
| POST | `/api/rides/:id/feedback` | Submit ride feedback | User |

### Admin Management Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/rides` | Get all rides with filters | Admin |
| PATCH | `/api/admin/rides/:id/approve` | Approve ride | Admin |
| PATCH | `/api/admin/rides/:id/reject` | Reject ride | Admin |
| GET | `/api/admin/analytics` | Get ride analytics | Admin |
| GET | `/api/admin/actions` | Get admin action history | Admin |

## 🔒 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```javascript
Authorization: Bearer <your_jwt_token>
```

### User Roles

- **User:** Can book rides, view their rides, submit feedback
- **Admin:** Can manage all rides, users, view analytics, approve/reject rides

## 🧪 Testing the API

### Using Swagger UI (Recommended)

1. Start the server: `npm run dev`
2. Open browser: http://localhost:5000/api-docs
3. Use the interactive interface to test endpoints

### Using cURL

```bash
# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@company.com",
    "password": "Password123!",
    "employeeId": "EMP001",
    "department": "Engineering",
    "phone": "+1234567890"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@company.com",
    "password": "Password123!"
  }'

# Book a ride (replace TOKEN with actual JWT)
curl -X POST http://localhost:5000/api/rides \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "pickup": {
      "address": "123 Main St, City",
      "coordinates": {"lat": 40.7128, "lng": -74.0060}
    },
    "drop": {
      "address": "456 Oak Ave, City",
      "coordinates": {"lat": 40.7589, "lng": -73.9851}
    },
    "scheduleTime": "2024-01-15T09:00:00.000Z",
    "reason": "Client meeting"
  }'
```

## 🛡 Security Features

- **Helmet.js:** Security headers and protection
- **CORS:** Cross-origin resource sharing configuration
- **Rate Limiting:** API abuse prevention
- **Input Validation:** Comprehensive request validation
- **Password Hashing:** Secure password storage with bcrypt
- **JWT Security:** Token-based authentication with expiration

## 📊 Database Schema

### User Model
```javascript
{
  firstName: String (required),
  lastName: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  employeeId: String (required, unique),
  department: String (required),
  phone: String (required),
  role: String (enum: ['user', 'admin']),
  isActive: Boolean (default: true),
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Ride Model
```javascript
{
  userId: ObjectId (ref: 'User'),
  pickup: {
    address: String,
    coordinates: { lat: Number, lng: Number }
  },
  drop: {
    address: String,
    coordinates: { lat: Number, lng: Number }
  },
  scheduleTime: Date,
  status: String (enum: ['pending', 'approved', 'rejected', 'in_progress', 'completed', 'cancelled']),
  estimatedFare: Number,
  actualFare: Number,
  distance: Number,
  duration: Number,
  reason: String,
  driver: {
    id: String,
    name: String,
    phone: String,
    vehicle: String,
    rating: Number
  },
  feedback: {
    rating: Number (1-5),
    comment: String
  },
  approvedBy: ObjectId (ref: 'User'),
  rejectedBy: ObjectId (ref: 'User'),
  rejectionReason: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/corporate-rides
JWT_SECRET=your_super_secure_jwt_secret_key
FRONTEND_URL=https://your-frontend-domain.com
```

### Deployment Options

1. **Heroku**
2. **AWS EC2**
3. **DigitalOcean**
4. **Vercel**
5. **Railway**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Email: support@corporaterides.com
- Documentation: http://localhost:5000/api-docs
- Health Check: http://localhost:5000/health

## 🔄 Version History

- **v1.0.0** - Initial release with complete API functionality
  - User authentication and authorization
  - Ride booking and management
  - Admin dashboard and analytics
  - Comprehensive API documentation
