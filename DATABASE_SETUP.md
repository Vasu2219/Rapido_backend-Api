# 🚀 Rapido Corporate Backend - Quick Database Setup Guide

## Current Issue
Your Rapido Corporate API is running successfully, but MongoDB database is not connected. Here are the solutions:

## ⚡ Quick Solutions

### Option 1: MongoDB Atlas (Cloud - Recommended for Development)
**✅ Easiest and fastest setup - No local installation needed**

1. **Sign up for MongoDB Atlas FREE:**
   - Go to: https://cloud.mongodb.com
   - Create free account
   - Create a new project: "Rapido-Corporate"

2. **Create Free Cluster:**
   - Choose "M0 Sandbox" (Free forever)
   - Select your preferred region
   - Keep default settings

3. **Setup Database Access:**
   - Go to "Database Access" → "Add New Database User"
   - Username: `rapido_admin`
   - Password: `RapidoCorp2024!` (or generate secure password)
   - Database User Privileges: "Read and write to any database"

4. **Setup Network Access:**
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Or add your current IP address

5. **Get Connection String:**
   - Go to "Clusters" → Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password

6. **Update .env file:**
   ```
   MONGODB_URI=mongodb+srv://rapido_admin:<password>@cluster0.xxxxx.mongodb.net/rapido_corporate?retryWrites=true&w=majority
   ```

### Option 2: Local MongoDB Installation
**⚙️ For production-like local development**

#### Windows:
```powershell
# Download and install MongoDB Community Server
# From: https://www.mongodb.com/try/download/community

# Or using Chocolatey:
choco install mongodb

# Start MongoDB service:
net start MongoDB
```

#### Using Docker (Cross-platform):
```bash
# Pull and run MongoDB container
docker run -d -p 27017:27017 --name rapido-mongodb mongo:latest

# Your .env MONGODB_URI stays as:
# MONGODB_URI=mongodb://localhost:27017/rapido_corporate
```

## 🧪 Test Your Setup

1. **Restart your server:**
   ```bash
   npm run dev
   ```

2. **Check health endpoint:**
   - Open: http://localhost:5000/health
   - Should show `"connected": true` in database status

3. **Test API Documentation:**
   - Open: http://localhost:5000/api-docs
   - All endpoints should work without database errors

## 📊 Verify Database Connection

### Success Indicators:
- ✅ Server logs show: "MongoDB Connected: cluster0-shard..."
- ✅ Health check shows: `"connected": true`
- ✅ API endpoints work without 503 errors

### If Still Having Issues:

1. **Check .env file:** Ensure MONGODB_URI is correct
2. **Restart server:** Stop (Ctrl+C) and run `npm run dev`
3. **Check MongoDB Atlas:** Ensure cluster is running
4. **Network Issues:** Try "Allow Access from Anywhere" in Atlas

## 🎯 Next Steps After Database Setup

1. **Test User Registration:**
   ```bash
   POST /api/auth/register
   {
     "firstName": "Test",
     "lastName": "User",
     "email": "test@company.com",
     "password": "TestPass123!",
     "employeeId": "TEST001",
     "department": "Engineering"
   }
   ```

2. **Create Admin User:**
   ```bash
   POST /api/auth/register
   {
     "firstName": "Admin",
     "lastName": "User",
     "email": "admin@company.com",
     "password": "AdminPass123!",
     "employeeId": "ADMIN001",
     "department": "HR",
     "role": "admin"
   }
   ```

3. **Test Ride Booking:**
   - Login to get JWT token
   - Use token to create ride requests
   - Test admin approval workflow

## 💡 Pro Tips

- **Atlas Free Tier:** 512MB storage, perfect for development
- **Connection Pooling:** Already configured in the app
- **Auto-reconnection:** App handles database disconnections gracefully
- **Environment Variables:** Keep different configs for dev/prod

## 🆘 Need Help?

If you're still facing issues, check:
- Server logs for detailed error messages
- MongoDB Atlas activity logs
- Network connectivity
- .env file syntax

**Recommended:** Start with MongoDB Atlas as it's the quickest way to get your API fully functional!
