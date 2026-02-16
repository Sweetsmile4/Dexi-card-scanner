const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  cardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card',
    required: true
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  designation: {
    type: String,
    trim: true,
    default: ''
  },
  company: {
    type: String,
    trim: true,
    default: '',
    index: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: '',
    match: [/^\S*@?\S*\.\S*$/, 'Please provide a valid email or leave empty']
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  website: {
    type: String,
    trim: true,
    default: ''
  },
  address: {
    type: String,
    trim: true,
    default: ''
  },
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  isFavorite: {
    type: Boolean,
    default: false,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
contactSchema.index({ userId: 1, createdAt: -1 });
contactSchema.index({ userId: 1, isFavorite: -1 });
contactSchema.index({ userId: 1, company: 1 });
contactSchema.index({ fullName: 'text', company: 'text', designation: 'text' });

module.exports = mongoose.model('Contact', contactSchema);
