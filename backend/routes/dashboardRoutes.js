const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getUserDashboard,
  getAdminDashboard
} = require('../controllers/dashboardController');

// Routes
router.get('/user', protect, getUserDashboard);
router.get('/admin', protect, authorize('admin'), getAdminDashboard);

module.exports = router;
