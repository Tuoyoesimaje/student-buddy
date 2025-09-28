const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  isSystemMessage: {
    type: Boolean,
    default: false,
  },
});

const memberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: ['facilitator', 'note-taker', 'peer-mentor', 'resource-sharer', 'participant'],
    default: 'participant',
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
  contributions: {
    tasksCompleted: { type: Number, default: 0 },
    notesShared: { type: Number, default: 0 },
    messagesSent: { type: Number, default: 0 },
    peersHelped: { type: Number, default: 0 },
    learningActivities: { type: Number, default: 0 },
  },
  learningGoals: {
    type: String,
    trim: true,
  },
  studyPreferences: [{
    type: String,
    enum: ['visual', 'auditory', 'kinesthetic', 'reading-writing', 'discussion-based', 'practice-focused'],
  }],
  roleAssignedAt: {
    type: Date,
    default: Date.now,
  },
  roleRotationDue: {
    type: Date,
  },
});

const syncSpaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  members: [memberSchema],
  joinCode: {
    type: String,
    required: true,
    unique: true,
  },
  chat: [messageSchema],
  sharedTasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
  }],
  sharedNotes: [{
    title: String,
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
    originalNoteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Note',
      required: true,
    },
    sharedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    addedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  studyGoals: {
    topic: String,
    objectives: [String],
    targetDate: Date,
    progress: { type: Number, min: 0, max: 100, default: 0 },
  },
  participationSettings: {
    roleRotationEnabled: { type: Boolean, default: true },
    rotationIntervalDays: { type: Number, default: 7 },
    inactiveThresholdHours: { type: Number, default: 48 },
    balancedParticipation: { type: Boolean, default: true },
  },
  lastRoleRotation: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('SyncSpace', syncSpaceSchema);