const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  relation: {
    type: String,
    required: true,
    enum: ['friend', 'family', 'colleague', 'student', 'teacher', 'recruiter', 'stranger']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please enter a valid email'
    }
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    default: ''
  },
  country: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: ''
  },
  emailSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster queries
visitorSchema.index({ createdAt: -1 });
visitorSchema.index({ ipAddress: 1 });

module.exports = mongoose.model('Visitor', visitorSchema);