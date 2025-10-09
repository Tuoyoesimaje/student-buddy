const mongoose = require('mongoose');

const aiGeneratedPracticeExamSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  topicOrNote: {
    type: String,
    required: true
  },
  questions: [{
    type: String,
    required: true
  }],
  userAnswers: [{
    type: String,
    default: null
  }],
  score: {
    type: Number,
    default: null
  },
  feedback: {
    type: String,
    default: null
  },
  detailed: [{
    question: { type: String },
    studentAnswer: { type: String },
    mark: { type: Number },
    comment: { type: String },
    reference: { type: String }
  }],
  submitted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AIGeneratedPracticeExam', aiGeneratedPracticeExamSchema);