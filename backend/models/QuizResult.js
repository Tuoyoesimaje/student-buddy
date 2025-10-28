const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  noteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note',
    required: false
  },
  noteTitle: {
    type: String,
    required: true
  },
  questions: [{
    question: {
      type: String,
      required: true
    },
    options: [{
      type: String,
      required: true
    }],
    correctAnswer: {
      type: String,
      required: true
    },
    userAnswer: {
      type: String,
      default: null
    },
    isCorrect: {
      type: Boolean,
      default: false
    },
    hint: {
      type: String,
      default: ''
    },
    explanation: {
      type: String,
      default: ''
    }
  }],
  // If this result is a retake of a previous quiz, store reference
  retakeOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuizResult',
    required: false,
    default: null
  },
  score: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  passed: {
    type: Boolean,
    default: false
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  aiRemarks: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
quizResultSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index for efficient queries
quizResultSchema.index({ userId: 1, noteId: 1, createdAt: -1 });
quizResultSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('QuizResult', quizResultSchema);