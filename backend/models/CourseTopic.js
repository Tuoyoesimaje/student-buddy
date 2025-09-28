const mongoose = require('mongoose');

const courseTopicSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  topicName: {
    type: String,
    required: true,
    trim: true
  },
  about: {
    type: String,
    trim: true,
    default: ''
  },
  understanding: {
    type: String,
    trim: true,
    default: ''
  },
  challenges: {
    type: String,
    trim: true,
    default: ''
  },
  weekDate: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const CourseTopic = mongoose.model('CourseTopic', courseTopicSchema);

module.exports = CourseTopic;