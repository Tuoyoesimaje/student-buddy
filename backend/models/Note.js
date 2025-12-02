const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    trim: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
  },
  attachments: [{
    name: String,
    type: String,
    url: String,
    size: Number,
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isOCRExtracted: {
    type: Boolean,
    default: false,
  },
  formattingOffered: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Note', noteSchema); 