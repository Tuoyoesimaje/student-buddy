const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const AIGeneratedPracticeExam = require('../models/AIGeneratedPracticeExam');
const aiService = require('../services/aiService');

// Generate practice exam questions
router.post('/start', auth, async (req, res) => {
  console.log('PracticeExam.js /start route: req.user.userId at start:', req.user.userId);
  try {
    const { topicOrNote } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!topicOrNote || typeof topicOrNote !== 'string' || topicOrNote.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        error: 'Topic or note content is required' 
      });
    }

    console.log(`Generating practice exam questions for user ${userId} on topic: ${topicOrNote.substring(0, 50)}...`);
    console.log('UserId before creating AIGeneratedPracticeExam:', userId);
    
    // Generate questions using AI service
    const questions = await aiService.generatePracticeQuestions(topicOrNote);
    
    // Ensure we have exactly 15 questions (or handle fewer if AI couldn't generate enough)
    const finalQuestions = questions.slice(0, 15);
    if (finalQuestions.length < 15) {
      console.warn(`AI only generated ${finalQuestions.length} questions instead of 15`);
    }

    // Create a new practice exam in the database
    const practiceExam = new AIGeneratedPracticeExam({
      userId,
      topicOrNote,
      questions: finalQuestions,
      userAnswers: Array(finalQuestions.length).fill(null),
      submitted: false
    });

    console.log('Attempting to save practice exam...');
    const savedExam = await practiceExam.save();
    console.log('Practice exam saved successfully. Saved exam ID:', savedExam._id);

    console.log('Sending response to frontend with examId:', savedExam._id, 'and questions count:', finalQuestions.length);
    res.status(201).json({
      success: true,
      examId: savedExam._id,
      questions: finalQuestions
    });

  } catch (error) {
    console.error('Error generating practice exam:', error);
    res.status(500).json({
      success: false,
      error: 'Error generating practice exam questions',
      details: error.message
    });
  }
});

// Submit answers and grade practice exam
router.post('/submit/:examId', auth, async (req, res) => {
  try {
    const { examId } = req.params;
    const { userAnswers } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!userAnswers || !Array.isArray(userAnswers)) {
      return res.status(400).json({
        success: false,
        error: 'User answers are required and must be an array'
      });
    }

    // Find the exam
    const exam = await AIGeneratedPracticeExam.findOne({ _id: examId, userId });
    if (!exam) {
      return res.status(404).json({
        success: false,
        error: 'Practice exam not found'
      });
    }

    // Check if exam is already submitted
    if (exam.submitted) {
      return res.status(400).json({
        success: false,
        error: 'This exam has already been submitted'
      });
    }

    // Save user answers
    exam.userAnswers = userAnswers;

    // Get the original note content for grading reference
    let noteContent = null;
    console.log('Exam topicOrNote:', exam.topicOrNote.substring(0, 100));
    if (exam.topicOrNote && exam.topicOrNote.startsWith('--- NOTE')) {
      // This is a note-based exam, use the topicOrNote as reference material
      noteContent = exam.topicOrNote;
      console.log('Note-based exam: using topicOrNote as grading reference');
    } else {
      // This is a topic-based exam, grade without specific reference material (general knowledge)
      noteContent = null;
      console.log('Topic-based exam: grading without reference material');
    }

    // Limit noteContent length to prevent AI response issues (Gemini has token limits)
    if (noteContent && noteContent.length > 10000) {
      noteContent = noteContent.substring(0, 10000) + '... (content truncated for grading)';
      console.log('Note content truncated for grading to prevent AI response issues');
    }

    // Grade the exam using AI with note content reference
    const gradeResult = await aiService.gradePracticeExam(exam.questions, userAnswers, noteContent);

    // Update exam with results
    exam.score = gradeResult.score;
    exam.feedback = gradeResult.feedback;
    exam.detailed = gradeResult.detailed;
    exam.submitted = true;

    // Save the updated exam
    await exam.save();

    res.json({
      success: true,
      score: gradeResult.score,
      feedback: gradeResult.feedback,
      detailed: gradeResult.detailed
    });

  } catch (error) {
    console.error('Error submitting practice exam:', error);
    res.status(500).json({
      success: false,
      error: 'Error submitting practice exam',
      details: error.message
    });
  }
});

// Get all practice exams for a user
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const exams = await AIGeneratedPracticeExam.find({ userId })
      .select('topicOrNote createdAt submitted score')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      exams
    });

  } catch (error) {
    console.error('Error fetching practice exams:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching practice exams',
      details: error.message
    });
  }
});

// Get a specific practice exam
router.get('/:examId', auth, async (req, res) => {
  try {
    const { examId } = req.params;
    const userId = req.user.userId;

    const exam = await AIGeneratedPracticeExam.findOne({ _id: examId, userId });
    if (!exam) {
      return res.status(404).json({
        success: false,
        error: 'Practice exam not found'
      });
    }

    console.log('Sending exam to frontend:', exam);
    res.json({
      success: true,
      exam
    });

  } catch (error) {
    console.error('Error fetching practice exam:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching practice exam',
      details: error.message
    });
  }
});

module.exports = router;