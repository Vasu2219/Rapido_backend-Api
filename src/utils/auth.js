const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  const jwtSecret = process.env.JWT_SECRET || 'your_super_secret_jwt_key_for_rapido_corporate_ride_booking_system_2024';
  console.log('JWT_SECRET from env:', process.env.JWT_SECRET ? 'Found' : 'Not found');
  console.log('Using JWT secret:', jwtSecret ? 'Yes' : 'No');
  
  return jwt.sign({ id }, jwtSecret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d'
  });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  res.status(statusCode).json({
    success: true,
    token,
    data: {
      user
    }
  });
};

module.exports = {
  generateToken,
  sendTokenResponse
};
