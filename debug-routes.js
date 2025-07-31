const express = require('express');
require('dotenv').config();

const app = express();

// Basic middleware
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

console.log('Testing auth routes...');
try {
    const authRoutes = require('./routes/auth');
    app.use('/api/auth', authRoutes);
    console.log('✅ Auth routes loaded successfully');
} catch (error) {
    console.log('❌ Error in auth routes:', error.message);
    process.exit(1);
}

console.log('Testing user routes...');
try {
    const userRoutes = require('./routes/users');
    app.use('/api/users', userRoutes);
    console.log('✅ User routes loaded successfully');
} catch (error) {
    console.log('❌ Error in user routes:', error.message);
    process.exit(1);
}

console.log('Testing ride routes...');
try {
    const rideRoutes = require('./routes/rides');
    app.use('/api/rides', rideRoutes);
    console.log('✅ Ride routes loaded successfully');
} catch (error) {
    console.log('❌ Error in ride routes:', error.message);
    process.exit(1);
}

console.log('Testing admin routes...');
try {
    const adminRoutes = require('./routes/admin');
    app.use('/api/admin', adminRoutes);
    console.log('✅ Admin routes loaded successfully');
} catch (error) {
    console.log('❌ Error in admin routes:', error.message);
    process.exit(1);
}

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`✅ All routes loaded! Server running on port ${PORT}`);
});

// Keep the process alive
process.on('SIGINT', () => {
    console.log('Server stopped');
    process.exit(0);
});
