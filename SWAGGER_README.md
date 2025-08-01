# 🚀 Rapido Corporate Ride Booking Backend API

## ✨ **PROFESSIONAL SWAGGER API DOCUMENTATION IMPLEMENTED** ✨

A complete, production-ready REST API backend for Rapido's corporate ride booking system with **comprehensive Swagger documentation**, built with Node.js, Express, and MongoDB.

## 🎯 **API Documentation**

### 📚 **Interactive Swagger Documentation**
- **URL**: http://localhost:5000/api-docs
- **Professional UI** with custom styling
- **Complete API reference** with examples
- **Try-it-out functionality** for all endpoints
- **Schema definitions** for all models
- **Authentication testing** built-in

### 🔍 **Quick Links**
- **Health Check**: http://localhost:5000/health
- **API Docs**: http://localhost:5000/api-docs
- **Database Setup**: See `DATABASE_SETUP.md`
- **Postman Collection**: `Rapido_Corporate_API.postman_collection.json`

## 🚀 **Quick Start**

```bash
# 1. Install dependencies
npm install

# 2. Setup environment variables
cp .env.example .env
# Edit .env file with your MongoDB URI

# 3. Start development server
npm run dev

# 4. Open API documentation
npm run docs
# Or manually visit: http://localhost:5000/api-docs
```

## 🏗️ **Architecture & Features**

### **Professional API Documentation**
- ✅ **Complete Swagger/OpenAPI 3.0 specification**
- ✅ **Interactive documentation UI** with custom styling
- ✅ **Authentication testing** with JWT Bearer tokens
- ✅ **Request/Response examples** for all endpoints
- ✅ **Schema validation** and data models
- ✅ **Error response documentation** with status codes
- ✅ **Professional styling** with custom CSS
- ✅ **Try-it-out functionality** for live API testing

### **Core API Features**
- 🔐 **JWT Authentication** with role-based access control
- 🚗 **Ride Management** (create, update, cancel, track)
- 👨‍💼 **Admin Functions** (approve/reject, analytics)
- 👥 **User Management** (CRUD operations)
- 📊 **Analytics & Reporting** (department-wise, time-based)
- 🛡️ **Security** (helmet, CORS, rate limiting)
- 📝 **Audit Trail** (admin action logging)

## 📋 **API Endpoints Overview**

### 🔐 **Authentication** (`/api/auth`)
| Method | Endpoint | Description | Documentation |
|--------|----------|-------------|---------------|
| POST | `/register` | User registration | [📖 Try it](http://localhost:5000/api-docs#/Authentication/post_api_auth_register) |
| POST | `/login` | User authentication | [📖 Try it](http://localhost:5000/api-docs#/Authentication/post_api_auth_login) |
| GET | `/me` | Get user profile | [📖 Try it](http://localhost:5000/api-docs#/Authentication/get_api_auth_me) |
| PUT | `/profile` | Update profile | [📖 Try it](http://localhost:5000/api-docs#/Authentication/put_api_auth_profile) |

### 🚗 **Rides** (`/api/rides`)
| Method | Endpoint | Description | Documentation |
|--------|----------|-------------|---------------|
| GET | `/` | Get user's rides | [📖 Try it](http://localhost:5000/api-docs#/Rides/get_api_rides) |
| POST | `/` | Create ride request | [📖 Try it](http://localhost:5000/api-docs#/Rides/post_api_rides) |
| GET | `/:id` | Get ride details | [📖 Try it](http://localhost:5000/api-docs#/Rides/get_api_rides__id_) |
| PUT | `/:id` | Update ride | [📖 Try it](http://localhost:5000/api-docs#/Rides/put_api_rides__id_) |
| DELETE | `/:id` | Cancel ride | [📖 Try it](http://localhost:5000/api-docs#/Rides/delete_api_rides__id_) |

### 👨‍💼 **Admin** (`/api/admin`)
| Method | Endpoint | Description | Documentation |
|--------|----------|-------------|---------------|
| GET | `/rides` | Get all rides | [📖 Try it](http://localhost:5000/api-docs#/Admin/get_api_admin_rides) |
| PUT | `/rides/:id/approve` | Approve ride | [📖 Try it](http://localhost:5000/api-docs#/Admin/put_api_admin_rides__id__approve) |
| PUT | `/rides/:id/reject` | Reject ride | [📖 Try it](http://localhost:5000/api-docs#/Admin/put_api_admin_rides__id__reject) |
| GET | `/analytics` | Get analytics | [📖 Try it](http://localhost:5000/api-docs#/Admin/get_api_admin_analytics) |
| GET | `/actions` | Admin audit logs | [📖 Try it](http://localhost:5000/api-docs#/Admin/get_api_admin_actions) |

### 👥 **User Management** (`/api/users`) - Admin Only
| Method | Endpoint | Description | Documentation |
|--------|----------|-------------|---------------|
| GET | `/` | Get all users | [📖 Try it](http://localhost:5000/api-docs#/User%20Management/get_api_users) |
| POST | `/` | Create user | [📖 Try it](http://localhost:5000/api-docs#/User%20Management/post_api_users) |
| GET | `/:id` | Get user by ID | [📖 Try it](http://localhost:5000/api-docs#/User%20Management/get_api_users__id_) |
| PUT | `/:id` | Update user | [📖 Try it](http://localhost:5000/api-docs#/User%20Management/put_api_users__id_) |
| DELETE | `/:id` | Deactivate user | [📖 Try it](http://localhost:5000/api-docs#/User%20Management/delete_api_users__id_) |

## 🔧 **Database Setup**

### ⚡ **Quick Setup (MongoDB Atlas - Recommended)**
1. **Sign up**: https://cloud.mongodb.com (Free forever)
2. **Create cluster**: M0 Sandbox (Free tier)
3. **Get connection string**: Replace in `.env` file
4. **Restart server**: `npm run dev`

See `DATABASE_SETUP.md` for detailed instructions including local MongoDB and Docker options.

## 🧪 **Testing the API**

### **1. Swagger Documentation (Recommended)**
- Visit: http://localhost:5000/api-docs
- Click "Authorize" and enter JWT token
- Use "Try it out" on any endpoint

### **2. Postman Collection**
- Import: `Rapido_Corporate_API.postman_collection.json`
- Set `base_url` to `http://localhost:5000`
- Login to get JWT token (auto-saved to collection)

### **3. Health Check**
```bash
curl http://localhost:5000/health
```

## 📊 **Sample API Usage**

### **1. Register User**
```bash
POST /api/auth/register
{
  "firstName": "John",
  "lastName": "Doe", 
  "email": "john.doe@company.com",
  "password": "SecurePass123!",
  "employeeId": "EMP001",
  "department": "Engineering"
}
```

### **2. Create Ride Request**
```bash
POST /api/rides
Authorization: Bearer <jwt_token>
{
  "pickup": {
    "address": "Office Building A",
    "latitude": 12.9716,
    "longitude": 77.5946
  },
  "drop": {
    "address": "Airport",
    "latitude": 13.1986, 
    "longitude": 77.7066
  },
  "scheduleTime": "2024-01-15T10:30:00.000Z"
}
```

### **3. Admin Approve Ride**
```bash
PUT /api/admin/rides/:id/approve
Authorization: Bearer <admin_jwt_token>
{
  "comments": "Approved for business meeting"
}
```

## 🛡️ **Security Features**

- ✅ **JWT Authentication** with secure token generation
- ✅ **Role-based Authorization** (employee/admin)
- ✅ **Password Hashing** with bcrypt (12 salt rounds)
- ✅ **Rate Limiting** (100 requests per 15 minutes)
- ✅ **CORS Protection** with configurable origins
- ✅ **Security Headers** via Helmet.js
- ✅ **Input Validation** on all endpoints
- ✅ **Error Handling** without data leakage

## 📈 **Professional Features**

### **API Documentation**
- Complete OpenAPI 3.0 specification
- Interactive Swagger UI with custom styling
- Authentication testing built-in
- Request/response examples
- Schema definitions and validation
- Error response documentation

### **Development Experience**
- Comprehensive error handling
- Database connection management
- Auto-restart with nodemon
- Environment-based configuration
- Professional logging
- Health monitoring

### **Production Ready**
- Scalable architecture
- Database indexing strategies
- Pagination support
- Analytics and reporting
- Audit trail functionality
- Security best practices

## 🎯 **Next Steps**

1. **Setup Database**: Follow `DATABASE_SETUP.md`
2. **Test APIs**: Use Swagger UI at `/api-docs`
3. **Frontend Integration**: APIs ready for React/Vue/Angular
4. **Deployment**: Configure for AWS/Azure/GCP

## 🆘 **Support & Documentation**

- **API Documentation**: http://localhost:5000/api-docs
- **Database Setup**: `DATABASE_SETUP.md`
- **Postman Collection**: Import JSON file for testing
- **Health Check**: http://localhost:5000/health

## 📄 **License**

ISC License - Built with ❤️ for Rapido Corporate
