const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  tagName: {
    type: String,
    required: [true, 'Tag name is required'],
    trim: true,
    maxlength: [50, 'Tag name cannot exceed 50 characters']
  },
  color: {
    type: String,
    default: '#3B82F6'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure unique tag names per user
tagSchema.index({ userId: 1, tagName: 1 }, { unique: true });

module.exports = mongoose.model('Tag', tagSchema);
