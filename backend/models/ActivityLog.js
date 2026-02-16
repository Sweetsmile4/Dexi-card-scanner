const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'user_registered',
      'user_login',
      'card_uploaded',
      'card_deleted',
      'contact_created',
      'contact_updated',
      'contact_deleted',
      'ocr_processed',
      'ocr_failed',
      'export_csv',
      'export_vcard',
      'admin_user_disabled',
      'admin_user_enabled',
      'admin_user_deleted',
      'admin_card_deleted'
    ]
  },
  entityType: {
    type: String,
    enum: ['user', 'card', 'contact', 'tag', 'system'],
    default: 'system'
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: false
});

// Compound index for efficient admin queries
activityLogSchema.index({ timestamp: -1 });
activityLogSchema.index({ userId: 1, timestamp: -1 });
activityLogSchema.index({ action: 1, timestamp: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
