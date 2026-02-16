const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  imagePath: {
    type: String,
    required: [true, 'Image path is required']
  },
  ocrText: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'processed', 'failed'],
    default: 'pending'
  },
  errorMessage: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
cardSchema.index({ userId: 1, createdAt: -1 });
cardSchema.index({ status: 1 });

module.exports = mongoose.model('Card', cardSchema);
