const Card = require('../models/Card');
const Contact = require('../models/Contact');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get user dashboard stats
// @route   GET /api/dashboard/user
// @access  Private
exports.getUserDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get counts
    const [cardsUploaded, totalContacts, favoritesCount] = await Promise.all([
      Card.countDocuments({ userId }),
      Contact.countDocuments({ userId }),
      Contact.countDocuments({ userId, isFavorite: true })
    ]);

    // Get recent uploads (last 5)
    const recentUploads = await Card.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Get recent contacts (last 5)
    const recentContacts = await Contact.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('tags')
      .lean();

    // Upload activity by day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyActivity = await Card.aggregate([
      {
        $match: {
          userId: req.user._id,
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          cardsUploaded,
          totalContacts,
          favoritesCount
        },
        recentUploads,
        recentContacts,
        dailyActivity
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/dashboard/admin
// @access  Private/Admin
exports.getAdminDashboard = async (req, res, next) => {
  try {
    // Get counts
    const [totalUsers, totalCards, totalContacts, activeUsers] = await Promise.all([
      User.countDocuments(),
      Card.countDocuments(),
      Contact.countDocuments(),
      User.countDocuments({ isActive: true })
    ]);

    // Daily upload activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyUploads = await Card.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Most active users
    const mostActiveUsers = await Card.aggregate([
      {
        $group: {
          _id: '$userId',
          uploadCount: { $sum: 1 }
        }
      },
      { $sort: { uploadCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          uploadCount: 1,
          'user.name': 1,
          'user.email': 1
        }
      }
    ]);

    // OCR success rate
    const ocrStats = await Card.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalCards,
          totalContacts,
          activeUsers,
          inactiveUsers: totalUsers - activeUsers
        },
        dailyUploads,
        mostActiveUsers,
        ocrStats
      }
    });
  } catch (error) {
    next(error);
  }
};
