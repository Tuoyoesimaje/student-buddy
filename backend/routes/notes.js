const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const auth = require('../middleware/auth');

// @route   POST api/notes
// @desc    Create a new note
// @access  Private
router.post('/', auth, noteController.createNote);

// @route   POST api/notes/share
// @desc    Share a note to a sync space
// @access  Private
router.post('/share', auth, noteController.shareNoteToSyncSpace);

// @route   POST api/notes/import
// @desc    Import a shared note to user's notes
// @access  Private
router.post('/import', auth, noteController.importSharedNote);

module.exports = router;