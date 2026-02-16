const ActivityLog = require('../models/ActivityLog');

class ActivityLogger {
  /**
   * Log an activity
   * @param {Object} data - Activity data
   * @param {string} data.userId - User ID
   * @param {string} data.action - Action performed
   * @param {string} data.entityType - Type of entity
   * @param {string} data.entityId - Entity ID
   * @param {Object} data.metadata - Additional metadata
   * @param {Object} req - Express request object (optional)
   */
  async log(data, req = null) {
    try {
      const logData = {
        userId: data.userId,
        action: data.action,
        entityType: data.entityType || 'system',
        entityId: data.entityId || null,
        metadata: data.metadata || {},
        timestamp: new Date()
      };

      if (req) {
        logData.ipAddress = req.ip || req.connection.remoteAddress;
        logData.userAgent = req.get('user-agent');
      }

      await ActivityLog.create(logData);
    } catch (error) {
      console.error('Activity logging failed:', error);
      // Don't throw error to prevent disrupting main flow
    }
  }

  /**
   * Get recent activities
   * @param {Object} filter - Filter criteria
   * @param {number} limit - Number of records to return
   */
  async getRecentActivities(filter = {}, limit = 50) {
    try {
      return await ActivityLog.find(filter)
        .sort({ timestamp: -1 })
        .limit(limit)
        .populate('userId', 'name email')
        .lean();
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      return [];
    }
  }

  /**
   * Get activity statistics
   */
  async getStats(startDate, endDate) {
    try {
      const match = {};
      if (startDate && endDate) {
        match.timestamp = { $gte: new Date(startDate), $lte: new Date(endDate) };
      }

      const stats = await ActivityLog.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$action',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);

      return stats;
    } catch (error) {
      console.error('Failed to fetch activity stats:', error);
      return [];
    }
  }
}

module.exports = new ActivityLogger();
