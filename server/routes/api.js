const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issueController');
const categoryController = require('../controllers/categoryController');
const requireAuth = require('../middleware/auth');

// Categories
router.get('/categories', categoryController.getCategories);

// Issues
router.post('/issues', requireAuth, issueController.createIssue);
router.get('/issues', requireAuth, issueController.getIssues);
router.get('/issues/:id', requireAuth, issueController.getIssueById);

// Uploads
const { upload } = require('../config/cloudinary');
const uploadController = require('../controllers/uploadController');
router.post('/upload', requireAuth, upload.single('image'), uploadController.uploadFile);

// Analytics
const analyticsController = require('../controllers/analyticsController');
router.get('/admin/analytics', requireAuth, analyticsController.getAnalytics);

// Admin Routes
router.get('/admin/issues', requireAuth, issueController.getAllIssues);
router.patch('/admin/issues/:id/status', requireAuth, issueController.updateIssueStatus);

// Notifications
const notificationController = require('../controllers/notificationController');
router.get('/notifications', requireAuth, notificationController.getNotifications);
router.patch('/notifications/:id/read', requireAuth, notificationController.markAsRead);

// User Profile
const userController = require('../controllers/userController');
router.patch('/users/profile', requireAuth, userController.updateProfile);
router.get('/admin/users', requireAuth, userController.getAllUsers);

module.exports = router;
