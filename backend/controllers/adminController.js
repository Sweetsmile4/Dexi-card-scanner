const User = require('../models/User');
const Card = require('../models/Card');
const Contact = require('../models/Contact');
const ActivityLog = require('../models/ActivityLog');
const activityLogger = require('../services/activityLogger');
const storageService = require('../services/storageService');
const fs = require('fs').promises;

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [totalUsers, activeUsers, totalCards, totalContacts] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Card.countDocuments(),
      Contact.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        totalCards,
        totalContacts
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role, isActive } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    if (role) {
      query.role = role;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Get card counts for each user
    const usersWithCounts = await Promise.all(
      users.map(async (user) => {
        const cardCount = await Card.countDocuments({ userId: user._id });
        const contactCount = await Contact.countDocuments({ userId: user._id });
        return {
          ...user,
          cardCount,
          contactCount
        };
      })
    );

    const count = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        users: usersWithCounts,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        totalUsers: count
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user details
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUserDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's cards and contacts
    const [cards, contacts, cardCount, contactCount] = await Promise.all([
      Card.find({ userId: user._id }).sort({ createdAt: -1 }).limit(10),
      Contact.find({ userId: user._id }).sort({ createdAt: -1 }).limit(10),
      Card.countDocuments({ userId: user._id }),
      Contact.countDocuments({ userId: user._id })
    ]);

    res.status(200).json({
      success: true,
      data: {
        user,
        stats: {
          cardCount,
          contactCount
        },
        recentCards: cards,
        recentContacts: contacts
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active status
// @route   PATCH /api/admin/users/:id/toggle-status
// @access  Private/Admin
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent disabling self
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot disable your own account'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    await activityLogger.log({
      userId: req.user.id,
      action: user.isActive ? 'admin_user_enabled' : 'admin_user_disabled',
      entityType: 'user',
      entityId: user._id,
      metadata: { targetUser: user.email }
    }, req);

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'enabled' : 'disabled'} successfully`,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change user role
// @route   PATCH /api/admin/users/:id/role
// @access  Private/Admin
exports.changeUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be user or admin'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent changing own role
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change your own role'
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting self
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Delete user's cards and associated files
    const cards = await Card.find({ userId: user._id });
    for (const card of cards) {
      if (card.imageKey) {
        await storageService.removeCardImage(card.imageKey).catch(err => console.error('Storage deletion error:', err));
      }

      if (card.imagePath) {
        await fs.unlink(card.imagePath).catch(err => console.error('File deletion error:', err));
      }
    }
    await Card.deleteMany({ userId: user._id });

    // Delete user's contacts
    await Contact.deleteMany({ userId: user._id });

    // Delete user
    await user.deleteOne();

    await activityLogger.log({
      userId: req.user.id,
      action: 'admin_user_deleted',
      entityType: 'user',
      entityId: user._id,
      metadata: { deletedUser: user.email }
    }, req);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all cards (for moderation)
// @route   GET /api/admin/cards
// @access  Private/Admin
exports.getAllCards = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, userId } = req.query;

    const query = {};
    if (status) query.status = status;
    if (userId) query.userId = userId;

    const cards = await Card.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await Card.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        cards,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        totalCards: count
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete card (admin)
// @route   DELETE /api/admin/cards/:id
// @access  Private/Admin
exports.deleteCard = async (req, res, next) => {
  try {
    const card = await Card.findById(req.params.id);

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    // Delete associated contacts
    await Contact.deleteMany({ cardId: card._id });

    // Delete image from storage
    if (card.imageKey) {
      await storageService.removeCardImage(card.imageKey).catch(err => console.error('Storage deletion error:', err));
    }

    // Delete local image file if present
    if (card.imagePath) {
      await fs.unlink(card.imagePath).catch(err => console.error('File deletion error:', err));
    }

    // Delete card
    await card.deleteOne();

    await activityLogger.log({
      userId: req.user.id,
      action: 'admin_card_deleted',
      entityType: 'card',
      entityId: card._id,
      metadata: { cardOwner: card.userId }
    }, req);

    res.status(200).json({
      success: true,
      message: 'Card deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get activity logs
// @route   GET /api/admin/logs
// @access  Private/Admin
exports.getActivityLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, action, userId } = req.query;

    const query = {};
    if (action) query.action = action;
    if (userId) query.userId = userId;

    const logs = await ActivityLog.find(query)
      .populate('userId', 'name email')
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await ActivityLog.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        logs,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        totalLogs: count
      }
    });
  } catch (error) {
    next(error);
  }
};
