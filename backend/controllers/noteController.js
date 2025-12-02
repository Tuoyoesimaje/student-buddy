const mongoose = require('mongoose');
const User = require('../models/User');
const Note = require('../models/Note');

// @desc    Get all notes for a user
// @route   GET /api/notes
// @access  Private
exports.getNotes = async (req, res) => {
  try {
    const subject = req.query.subject;
    let filter = { user: req.user.userId };

    if (subject !== undefined) {
      filter.subject = subject === '' ? { $exists: false } : subject;
    }

    const course = req.query.course;
    if (course) {
      filter.course = new mongoose.Types.ObjectId(course);
    }

    const notes = await Note.find(filter).populate('course').sort({ createdAt: -1 });
    res.status(200).json(notes);
  } catch (err) {
    console.error('Error fetching notes:', err);
    res.status(500).json({ message: 'Error fetching notes' });
  }
};

// @desc    Create a new note
// @route   POST /api/notes
// @access  Private
exports.createNote = async (req, res) => {
  const { title, content, subject, course, tags, attachments, isOCRExtracted, formattingOffered } = req.body;

  try {
    console.log('Creating note with OCR flags:', { isOCRExtracted, formattingOffered });
    
    const newNote = new Note({
      title,
      content,
      subject,
      course,
      tags,
      attachments,
      user: req.user.userId,
      isOCRExtracted: isOCRExtracted || false,
      formattingOffered: formattingOffered || false,
    });

    const note = await newNote.save();
    console.log('Note saved with flags:', { 
      id: note._id, 
      isOCRExtracted: note.isOCRExtracted, 
      formattingOffered: note.formattingOffered 
    });
    res.json(note);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update a note by ID
// @route   PUT /api/notes/:id
// @access  Private
exports.updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedNote = await Note.findOneAndUpdate(
      { _id: id, user: req.user.userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedNote) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.status(200).json(updatedNote);
  } catch (err) {
    console.error('Error updating note:', err);
    res.status(500).json({ message: 'Error updating note' });
  }
};

// @desc    Delete a note by ID
// @route   DELETE /api/notes/:id
// @access  Private
exports.deleteNote = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedNote = await Note.findOneAndDelete({ _id: id, user: req.user.userId });

    if (!deletedNote) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.status(200).json({ message: 'Note deleted successfully' });
  } catch (err) {
    console.error('Error deleting note:', err);
    res.status(500).json({ message: 'Error deleting note' });
  }
};
