const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const noteController = require('../controllers/noteController');
const auth = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/temp';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'upload-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedMimes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown'
    ];

    if (allowedMimes.includes(file.mimetype) ||
        file.originalname.toLowerCase().endsWith('.md') ||
        file.originalname.toLowerCase().endsWith('.txt')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, TXT, and MD files are allowed.'), false);
    }
  }
});

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

// Text extraction endpoint for document upload
router.post('/upload/extract-text', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    let extractedText = '';

    try {
      if (fileExt === '.pdf') {
        // For PDF files, we'll use a simple approach
        // In a production environment, you might want to use pdf-parse or pdfjs-dist
        extractedText = await extractTextFromPDF(filePath);
      } else if (fileExt === '.docx') {
        // For DOCX files, we'll use a simple approach
        // In a production environment, you might want to use mammoth
        extractedText = await extractTextFromDOCX(filePath);
      } else if (fileExt === '.txt' || fileExt === '.md') {
        // For text and markdown files, read directly
        extractedText = fs.readFileSync(filePath, 'utf8');
      } else {
        throw new Error('Unsupported file type');
      }

      // Clean up uploaded file
      fs.unlinkSync(filePath);

      // Validate extracted text
      if (!extractedText || extractedText.trim().length === 0) {
        return res.status(400).json({ error: 'No readable text found in the uploaded file' });
      }

      // Limit text length to prevent issues
      if (extractedText.length > 50000) {
        extractedText = extractedText.substring(0, 50000) + '\n\n[Text truncated due to length...]';
      }

      res.json({
        success: true,
        text: extractedText.trim(),
        filename: req.file.originalname,
        fileSize: req.file.size
      });

    } catch (error) {
      // Clean up file on error
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw error;
    }

  } catch (error) {
    console.error('Error extracting text from file:', error);
    res.status(500).json({
      error: 'Failed to extract text from file. Please ensure the file contains readable text.'
    });
  }
});

// PDF text extraction using pdf-parse
async function extractTextFromPDF(filePath) {
  try {
    const pdf = require('pdf-parse');
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw new Error('Failed to extract text from PDF file');
  }
}

// DOCX text extraction using mammoth
async function extractTextFromDOCX(filePath) {
  try {
    const mammoth = require('mammoth');
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    console.error('Error extracting DOCX text:', error);
    throw new Error('Failed to extract text from DOCX file');
  }
}

module.exports = router;