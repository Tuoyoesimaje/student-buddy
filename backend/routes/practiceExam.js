const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const AIGeneratedPracticeExam = require('../models/AIGeneratedPracticeExam');
const QuizResult = require('../models/QuizResult');
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
    const isNoteBased = topicOrNote.startsWith('--- NOTE');
    const questions = await aiService.generatePracticeQuestions(topicOrNote, isNoteBased);
    
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
    if (exam.topicOrNote && exam.topicOrNote.startsWith('--- NOTE')) {
      // This is a note-based exam, use the topicOrNote as reference material
      noteContent = exam.topicOrNote;
    } else {
      // This is a topic-based exam, grade without specific reference material (general knowledge)
      noteContent = null;
    }

    // Limit noteContent length to prevent AI response issues (Gemini has token limits) - increased for large textbooks
    if (noteContent && noteContent.length > 400000) {
      noteContent = noteContent.substring(0, 400000) + '... (content truncated for grading)';
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

// Get aggregated assessment history for authenticated user
router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { noteId } = req.query; // Optional filter by note

    // Build query for both assessment types
    const practiceExamQuery = {
      userId,
      ...(noteId && { topicOrNote: { $regex: `--- NOTE.*${noteId}`, $options: 'i' } })
    };

    const quizResultQuery = {
      userId,
      ...(noteId && { noteId })
    };

    // Fetch practice exams
    const practiceExams = await AIGeneratedPracticeExam.find(practiceExamQuery)
      .select('topicOrNote createdAt submitted score feedback')
      .sort({ createdAt: -1 })
      .lean();

    // Fetch quiz results
    let quizResults = await QuizResult.find(quizResultQuery)
      .select('noteTitle createdAt score totalQuestions percentage passed aiRemarks')
      .sort({ createdAt: -1 })
      .lean();

    // If no quiz results found by noteId, try searching by noteTitle
    if (quizResults.length === 0 && noteId) {
      console.log('No quiz results found by noteId, trying noteTitle search');
      const noteTitleQuery = {
        userId,
        noteTitle: { $regex: new RegExp(noteId, 'i') } // Search by noteId as title pattern
      };
      quizResults = await QuizResult.find(noteTitleQuery)
        .select('noteTitle createdAt score totalQuestions percentage passed aiRemarks')
        .sort({ createdAt: -1 })
        .lean();
    }

    // If still no results and we have a noteId, show all recent quiz results for debugging
    if (quizResults.length === 0 && noteId) {
      console.log('Still no quiz results found, fetching all recent quiz results for user');
      quizResults = await QuizResult.find({ userId })
        .select('noteId noteTitle createdAt score totalQuestions percentage passed aiRemarks')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();
    }

    // Format and combine results
    const formattedPracticeExams = practiceExams.map(exam => ({
      id: exam._id,
      type: 'practice-exam',
      title: exam.topicOrNote.replace('--- NOTE: ', '').substring(0, 50) + (exam.topicOrNote.length > 50 ? '...' : ''),
      date: exam.createdAt,
      score: exam.submitted ? exam.score : null,
      totalQuestions: null, // Practice exams don't have fixed question count in the same way
      status: exam.submitted ? 'completed' : 'in-progress',
      feedback: exam.feedback,
      link: `/app/practice-exam/results/${exam._id}`
    }));

    const formattedQuizResults = quizResults.map(quiz => ({
      id: quiz._id,
      type: 'quiz',
      title: quiz.noteTitle,
      date: quiz.createdAt,
      score: quiz.score,
      totalQuestions: quiz.totalQuestions,
      percentage: quiz.percentage,
      status: 'completed',
      passed: quiz.passed,
      aiRemarks: quiz.aiRemarks,
      link: `/app/quiz-results/${quiz._id}`
    }));

    // Combine and sort by date (newest first)
    const allAssessments = [...formattedPracticeExams, ...formattedQuizResults]
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    // If no assessments found for this specific note, include a note about it
    const responseData = {
      success: true,
      assessments: allAssessments,
      summary: {
        totalAssessments: allAssessments.length,
        completedAssessments: allAssessments.filter(a => a.status === 'completed').length,
        averageScore: calculateAverageScore(allAssessments),
        practiceExamsCount: formattedPracticeExams.length,
        quizResultsCount: formattedQuizResults.length
      }
    };

    // Add debugging info if no assessments found or if using fallback
    if (allAssessments.length === 0) {
      responseData.debug = {
        noteId,
        totalQuizResults: quizResults.length,
        practiceExams: formattedPracticeExams.length,
        message: 'No assessments found for this note'
      };
    } else if (quizResults.length > 0 && noteId) {
      // Check if we're showing fallback results (not filtered by note)
      const hasSpecificNoteResults = quizResults.some(q => q.noteId === noteId);
      if (!hasSpecificNoteResults) {
        responseData.debug = {
          noteId,
          showingFallbackResults: true,
          totalQuizResults: quizResults.length,
          message: 'Showing all quiz results (not filtered by note)'
        };
      }
    }

    res.json(responseData);

  } catch (error) {
    console.error('Error fetching assessment history:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching assessment history',
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

// Duplicate assessment-aggregation handler removed to avoid route conflicts.

// Save quiz results (for tracking purposes - no formal submission needed)
router.post('/quiz-results', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      noteId,
      noteTitle,
      questions,
      score,
      totalQuestions,
      percentage,
      passed,
      timeSpent,
      aiRemarks
    } = req.body;

    console.log('Saving quiz results:', {
      userId,
      noteId,
      noteTitle,
      score,
      totalQuestions,
      percentage
    });

    // Find the note ID if it exists (for tracking purposes)
    let resolvedNoteId = null;
    if (noteTitle) {
      const Note = require('../models/Note');
      const note = await Note.findOne({ title: noteTitle, userId });
      if (note) {
        resolvedNoteId = note._id;
      }
    }

    // Generate areas of concern from quiz performance
    const areasOfConcern = [];
    questions.forEach((question, index) => {
      if (!question.isCorrect && question.userAnswer) {
        const keyword = question.question.substring(0, 50) + '...';
        areasOfConcern.push({
          keyword,
          failedCount: 1,
          lastFailed: new Date()
        });
      }
    });

    // Create quiz result record
    const quizResult = new QuizResult({
      userId,
      noteId: noteId || resolvedNoteId, // Use provided noteId or resolved noteId
      noteTitle,
      questions,
      score,
      totalQuestions,
      percentage,
      passed,
      timeSpent,
      aiRemarks,
      areasOfConcern,
      difficulty: percentage >= 80 ? 'hard' : percentage >= 60 ? 'medium' : 'easy'
    });

    const savedQuizResult = await quizResult.save();

    res.status(201).json({
      success: true,
      quizResultId: savedQuizResult._id,
      message: 'Quiz results saved successfully'
    });

  } catch (error) {
    console.error('Error saving quiz results:', error);
    res.status(500).json({
      success: false,
      error: 'Error saving quiz results',
      details: error.message
    });
  }
});

// Get individual quiz result
router.get('/quiz-results/:quizId', auth, async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.userId;

    console.log('Fetching individual quiz result:', { quizId, userId });

    const quizResult = await QuizResult.findOne({ _id: quizId, userId });

    if (!quizResult) {
      console.log('Quiz result not found in database');
      return res.status(404).json({
        success: false,
        error: 'Quiz result not found'
      });
    }

    console.log('Quiz result found:', {
      id: quizResult._id,
      noteTitle: quizResult.noteTitle,
      score: quizResult.score,
      totalQuestions: quizResult.totalQuestions
    });

    res.json({
      success: true,
      quizResult
    });

  } catch (error) {
    console.error('Error fetching quiz result:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching quiz result',
      details: error.message
    });
  }
});

// Helper function to calculate average score
function calculateAverageScore(assessments) {
  const completedAssessments = assessments.filter(a => a.status === 'completed' && a.score !== null);

  if (completedAssessments.length === 0) return 0;

  const totalScore = completedAssessments.reduce((sum, assessment) => {
    if (assessment.percentage !== undefined) {
      return sum + assessment.percentage;
    }
    return sum + assessment.score;
  }, 0);

  return Math.round((totalScore / completedAssessments.length) * 100) / 100;
}

module.exports = router;