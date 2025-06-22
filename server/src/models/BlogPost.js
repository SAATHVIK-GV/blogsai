const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contentFingerprint: {
    type: mongoose.Schema.Types.Mixed, // Store keyword frequency object
    default: {}
  },
  readCount: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Index for better query performance
blogPostSchema.index({ authorId: 1, createdAt: -1 });
blogPostSchema.index({ tags: 1 });

module.exports = mongoose.model('BlogPost', blogPostSchema); 