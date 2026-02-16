const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getDashboardStats,
  getUsers,
  getUserDetails,
  toggleUserStatus,
  changeUserRole,
  deleteUser,
  getAllCards,
  deleteCard,
  getActivityLogs
} = require('../controllers/adminController');

// All routes require admin role
router.use(protect, authorize('admin'));

// Dashboard
router.get('/dashboard', getDashboardStats);

// User management
router.get('/users', getUsers);
router.get('/users/:id', getUserDetails);
router.patch('/users/:id/toggle-status', toggleUserStatus);
router.patch('/users/:id/role', changeUserRole);
router.delete('/users/:id', deleteUser);

// Card moderation
router.get('/cards', getAllCards);
router.delete('/cards/:id', deleteCard);

// Activity logs
router.get('/logs', getActivityLogs);

module.exports = router;
