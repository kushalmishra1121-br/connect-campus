const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const requireAuth = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', requireAuth, getMe);
router.post('/forgot-password', require('../controllers/authController').forgotPassword);
router.post('/reset-password', require('../controllers/authController').resetPassword);

// Firebase Auth Routes
router.post('/firebase-login', require('../controllers/authController').firebaseLogin);
router.post('/firebase-register', require('../controllers/authController').firebaseRegister);

module.exports = router;
