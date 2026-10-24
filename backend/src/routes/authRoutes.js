const express = require('express');
const { body } = require('express-validator');
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/register',
  [
    body('name', 'Name is required').trim().notEmpty(),
    body('email', 'Please provide a valid email').isEmail().normalizeEmail(),
    body('password', 'Password must be at least 6 characters').isLength({ min: 6 })
  ],
  registerUser
);

router.post(
  '/login',
  [
    body('email', 'Please provide a valid email').isEmail().normalizeEmail(),
    body('password', 'Password is required').exists()
  ],
  loginUser
);

router.get('/me', protect, getMe);

module.exports = router;
