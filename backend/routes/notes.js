const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const noteController = require('../controllers/noteController');
const auth = require('../middleware/auth');
const { formatExtractedText } = require('../utils/textFormatter');

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
    fileSize: 500 * 1024 * 1024 // 500MB limit for very large textbooks and documents
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

// @route   POST api/notes/:id/improve-formatting
// @desc    Improve OCR formatting using AI
// @access  Private
router.post('/:id/improve-formatting', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const aiService = require('../services/aiService');

    const note = await require('../models/Note').findOne({ _id: id, user: req.user.userId });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Improve the formatting using AI
    const improvedContent = await aiService.improveOCRFormatting(note.content);

    // Update the note with improved content and mark formatting as offered
    note.content = improvedContent;
    note.formattingOffered = true;
    await note.save();

    res.status(200).json(note);
  } catch (err) {
    console.error('Error improving note formatting:', err);
    res.status(500).json({ message: 'Error improving note formatting' });
  }
});

// @route   PUT api/notes/:id/dismiss-formatting
// @desc    Mark formatting banner as dismissed
// @access  Private
router.put('/:id/dismiss-formatting', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const note = await require('../models/Note').findOne({ _id: id, user: req.user.userId });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    note.formattingOffered = true;
    await note.save();

    res.status(200).json(note);
  } catch (err) {
    console.error('Error dismissing formatting banner:', err);
    res.status(500).json({ message: 'Error dismissing formatting banner' });
  }
});

// Text extraction endpoint for document upload with hybrid OCR support
router.post('/upload/extract-text', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    const documentType = req.body.documentType || 'printed'; // 'printed', 'typed', 'handwritten'
    let extractedText = '';

    console.log(`\n📤 File Upload - Name: ${req.file.originalname}, Type: ${fileExt}, Document Type: ${documentType}`);

    try {
      if (fileExt === '.pdf') {
        // For PDF files, use hybrid OCR approach
        console.log(`📄 Processing PDF with document type: ${documentType}`);
        extractedText = await extractTextFromPDF(filePath, documentType);
      } else if (fileExt === '.docx') {
        // For DOCX files, use mammoth
        console.log(`📄 Processing DOCX file`);
        extractedText = await extractTextFromDOCX(filePath);
      } else if (fileExt === '.txt' || fileExt === '.md') {
        // For text and markdown files, read directly
        console.log(`📄 Reading text file directly`);
        extractedText = fs.readFileSync(filePath, 'utf8');
      } else {
        throw new Error('Unsupported file type');
      }

      // Clean up uploaded file
      fs.unlinkSync(filePath);

      // Validate extracted text
      if (!extractedText || extractedText.trim().length === 0) {
        return res.status(400).json({ 
          error: 'No readable text found in the uploaded file. This might be an image-only PDF or the handwriting may be unclear.' 
        });
      }

      // Limit text length to prevent issues - increased for very large textbooks (5M characters)
      if (extractedText.length > 5000000) { // 5M characters for very large textbooks
        extractedText = extractedText.substring(0, 5000000) + '\n\n[Text truncated due to length - consider uploading in smaller chunks for extremely large documents...]';
      }

      // Format the extracted text for better readability
      const formattedText = formatExtractedText(extractedText);

      res.json({
        success: true,
        text: formattedText,
        filename: req.file.originalname,
        fileSize: req.file.size,
        extractedLength: formattedText.length,
        documentType: documentType,
        ocrMethod: documentType === 'handwritten' ? 'Google Vision API / Tesseract' : 'Tesseract',
        isOCRExtracted: true // Flag to indicate this was OCR-extracted
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

// PDF text extraction using pdf-parse with hybrid OCR fallback
async function extractTextFromPDF(filePath, documentType = 'printed') {
  try {
    const pdf = require('pdf-parse');
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);

    // If we got substantial text, return it (for printed PDFs with text layer)
    if (data.text && data.text.trim().length > 100 && documentType === 'printed') {
      return data.text;
    }

    // If little/no text found, or if it's handwritten, use OCR
    if (documentType === 'handwritten') {
      console.log('Using OCR for handwritten PDF...');
    } else {
      console.log('PDF appears to be image-based, using OCR...');
    }
    return await extractTextFromImagePDF(filePath, documentType);

  } catch (error) {
    console.error('Error extracting PDF text:', error);
    // If normal extraction fails, try OCR as fallback
    try {
      return await extractTextFromImagePDF(filePath, documentType);
    } catch (ocrError) {
      throw new Error('Failed to extract text from PDF file');
    }
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

// OCR function for image-based PDFs with hybrid support
async function extractTextFromImagePDF(filePath, documentType = 'printed') {
  const ocrService = require('../services/ocrService');
  
  try {
    const extractedText = await ocrService.extractTextFromImagePDF(filePath, documentType, {
      maxPages: 50,
      onProgress: (progress) => {
        console.log(`OCR Progress: ${progress}%`);
      }
    });

    return extractedText;
  } catch (error) {
    console.error('Error in OCR extraction:', error);
    throw new Error(`Failed to extract text using OCR: ${error.message}`);
  }
}

module.exports = router;