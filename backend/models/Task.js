const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Link task to a user
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  type: {
    type: String,
    enum: ['lecture', 'study', 'assignment', 'exam', 'personal', 'other'],
    required: true,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
  },
  repeat: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'monthly'],
    default: 'none',
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
  },
  location: {
    type: String,
    trim: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
    default: null,
  },
  missed: {
    type: Boolean,
    default: false,
  },
  missedAt: {
    type: Date,
    default: null,
  },
  noClass: {
    type: Boolean,
    default: false,
  },
  noClassAt: {
    type: Date,
    default: null,
  },
  // Streak tracking for repeat study sessions
  streakGroup: {
    type: String, // Identifier to group related repeat tasks
    default: null,
  },
  streakPosition: {
    type: Number, // Position in the streak (1, 2, 3, etc.)
    default: null,
  },
  streakTotal: {
    type: Number, // Total number of tasks in this streak group
    default: null,
  },
  // Removed completedInstances since we now create individual task instances
  // instead of managing recurring tasks
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  // Enhanced assignment and progress tracking
  assignedTo: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assignedAt: {
      type: Date,
      default: Date.now
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  estimatedHours: Number,
  actualHours: Number,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  // Learning activity types for better categorization
  activityType: {
    type: String,
    enum: ['discussion', 'peer-teaching', 'note-taking', 'resource-sharing', 'practice', 'review', 'planning', 'other'],
    default: 'other'
  },
  learningObjectives: [String], // What should be learned from this activity
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }], // Tasks that should be completed before this one
  // Keep existing completion tracking for backward compatibility
  completedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  sharedWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
}, { timestamps: true });

// Update the updatedAt timestamp before saving
taskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Simplified task due check since we now use individual instances
taskSchema.methods.isDue = function() {
  const now = new Date();
  const startTime = new Date(this.startTime);
  return startTime <= now && !this.completed;
};

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;