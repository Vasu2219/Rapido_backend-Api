const express = require('express');
require('dotenv').config();

const app = express();

// Basic middleware
app.use(express.json());

// Simple test route
app.get('/health', (req, res) => {
    res.json({ message: 'Server is running' });
});

// Try importing routes one by one to isolate the issue
console.log('Loading auth routes...');
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

console.log('Loading user routes...');
const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

console.log('Loading ride routes...');
const rideRoutes = require('./routes/rides');
app.use('/api/rides', rideRoutes);

console.log('Loading admin routes...');
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

console.log('All routes loaded successfully!');

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
});
