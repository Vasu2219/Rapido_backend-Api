const User = require('../models/User');
const { sendTokenResponse } = require('../utils/auth');

// Simple test register function
const register = async (req, res, next) => {
  res.json({ message: 'Register endpoint working' });
};

// Simple test login function
const login = async (req, res, next) => {
  res.json({ message: 'Login endpoint working' });
};

// Simple test getMe function
const getMe = async (req, res, next) => {
  res.json({ message: 'GetMe endpoint working' });
};

// Simple test updateProfile function
const updateProfile = async (req, res, next) => {
  res.json({ message: 'UpdateProfile endpoint working' });
};

// Simple test changePassword function
const changePassword = async (req, res, next) => {
  res.json({ message: 'ChangePassword endpoint working' });
};

// Simple test logout function
const logout = async (req, res, next) => {
  res.json({ message: 'Logout endpoint working' });
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout
};
