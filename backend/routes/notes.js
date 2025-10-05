const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const noteController = require('../controllers/noteController');
const auth = require('../middleware/auth');

// @route   GET api/notes
// @desc    Get all notes for a user
// @access  Private
router.get('/', auth, async (req, res) => {
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

    const notes = await require('../models/Note').find(filter).populate('course').sort({ createdAt: -1 });
    res.status(200).json(notes);
  } catch (err) {
    console.error('Error fetching notes:', err);
    res.status(500).json({ message: 'Error fetching notes' });
  }
});

// @route   POST api/notes
// @desc    Create a new note
// @access  Private
router.post('/', auth, noteController.createNote);

// @route   PUT api/notes/:id
// @desc    Update a note by ID
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedNote = await require('../models/Note').findOneAndUpdate(
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
});

// @route   DELETE api/notes/:id
// @desc    Delete a note by ID
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedNote = await require('../models/Note').findOneAndDelete({ _id: id, user: req.user.userId });

    if (!deletedNote) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.status(200).json({ message: 'Note deleted successfully' });
  } catch (err) {
    console.error('Error deleting note:', err);
    res.status(500).json({ message: 'Error deleting note' });
  }
});

module.exports = router;