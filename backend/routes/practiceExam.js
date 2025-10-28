const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const AIGeneratedPracticeExam = require('../models/AIGeneratedPracticeExam');
const QuizResult = require('../models/QuizResult');
const Note = require('../models/Note');
const aiService = require('../services/aiService');

// Generate practice exam questions
router.post('/start', auth, async (req, res) => {
  console.log('PracticeExam.js /start route: req.user.userId at start:', req.user.userId);
  try {
  const { topicOrNote, noteIds } = req.body;
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
      ...(Array.isArray(noteIds) && noteIds.length > 0 ? { noteIds } : {}),
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
    // For practice exams we store the note content inside `topicOrNote` (string).
    // When a noteId is passed, try to resolve the Note and match by its title/content
    // instead of looking for the noteId string inside topicOrNote (which won't match).
    const quizResultQuery = {
      userId,
      ...(noteId && { noteId })
    };

    let practiceExamQuery = { userId };
    if (noteId) {
      try {
        // Prefer matching by stored noteIds (if practice exams were saved with noteIds)
        practiceExamQuery.noteIds = noteId;
      } catch (e) {
        console.warn('Error resolving noteId for practice exam history filter:', e.message);
        practiceExamQuery = { userId, _id: { $in: [] } };
      }
    }

    // Fetch practice exams
    let practiceExams = await AIGeneratedPracticeExam.find(practiceExamQuery)
      .select('topicOrNote createdAt submitted score feedback')
      .sort({ createdAt: -1 })
      .lean();

    // If no practice exams matched the filter but we were given a noteId, do a fallback scan of recent exams
    if ((!practiceExams || practiceExams.length === 0) && noteId) {
      try {
        const recentExams = await AIGeneratedPracticeExam.find({ userId })
          .select('topicOrNote createdAt submitted score feedback')
          .sort({ createdAt: -1 })
          .limit(50)
          .lean();

        const resolvedNote = await Note.findOne({ _id: noteId, userId }).select('title content').lean();
        if (resolvedNote) {
          const title = (resolvedNote.title || '').trim().toLowerCase();
          const snippet = (resolvedNote.content || '').replace(/<[^>]*>/g, '').trim().substring(0, 80).toLowerCase();

          const matched = recentExams.filter(ex => {
            const txt = (ex.topicOrNote || '').toLowerCase();
            return (title && txt.includes(title)) || (snippet && txt.includes(snippet));
          });

          if (matched.length > 0) {
            console.log(`Found ${matched.length} fallback-matched practice exams for noteId ${noteId}`);
            practiceExams = matched;
          } else {
            console.log('Fallback scan found no matching practice exams');
          }
        }
      } catch (e) {
        console.warn('Error during fallback scan for practice exams:', e.message);
      }
    }

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
    // Helper: try to extract a readable title from the topicOrNote content (which contains separators when note-based)
    const extractTitleFromTopic = (topicOrNoteStr) => {
      if (!topicOrNoteStr) return '';
      // Look for patterns like: --- NOTE 1 START: Note Title ---
      const match = topicOrNoteStr.match(/---\s*NOTE\s*\d+\s*START:\s*(.+?)\s*---/i);
      if (match && match[1]) return match[1].trim();
      // Fallback: take first 80 chars of the string or first line
      const firstLine = topicOrNoteStr.split('\n')[0] || '';
      const candidate = firstLine.length > 0 ? firstLine : topicOrNoteStr;
      return candidate.substring(0, 80) + (candidate.length > 80 ? '...' : '');
    };

    const formattedPracticeExams = practiceExams.map(exam => ({
      id: exam._id,
      type: 'practice-exam',
      title: extractTitleFromTopic(exam.topicOrNote),
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

    // If debug query param provided, include resolvedNote info and matched practice exam ids
    if (req.query.debug === 'true') {
      try {
        const resolvedNote = noteId ? await Note.findOne({ _id: noteId, userId }).select('title content').lean() : null;
        responseData.debugInfo = {
          resolvedNote: resolvedNote ? { title: resolvedNote.title, snippet: (resolvedNote.content || '').replace(/<[^>]*>/g, '').substring(0, 120) } : null,
          matchedPracticeExamIds: practiceExams.map(e => e._id)
        };
      } catch (e) {
        responseData.debugInfoError = e.message;
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

// Retake a practice exam - create a new exam with the same questions
router.post('/:examId/retake', auth, async (req, res) => {
  try {
    const { examId } = req.params;
    const userId = req.user.userId;

    // Find the original exam
    const originalExam = await AIGeneratedPracticeExam.findOne({ _id: examId, userId });
    if (!originalExam) {
      return res.status(404).json({
        success: false,
        error: 'Original practice exam not found'
      });
    }

    // Create a new practice exam with the same questions
    const retakeExam = new AIGeneratedPracticeExam({
      userId,
      topicOrNote: originalExam.topicOrNote,
      ...(Array.isArray(originalExam.noteIds) && originalExam.noteIds.length > 0 ? { noteIds: originalExam.noteIds } : {}),
      questions: originalExam.questions, // Use the same questions
      userAnswers: Array(originalExam.questions.length).fill(null), // Reset answers
      submitted: false,
      retakeOf: examId // Reference to original exam
    });

    const savedRetakeExam = await retakeExam.save();

    console.log('Retake exam created successfully. Original exam ID:', examId, 'New exam ID:', savedRetakeExam._id);

    res.status(201).json({
      success: true,
      examId: savedRetakeExam._id,
      questions: originalExam.questions,
      message: 'Retake exam created successfully'
    });

  } catch (error) {
    console.error('Error creating retake exam:', error);
    res.status(500).json({
      success: false,
      error: 'Error creating retake exam',
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

// Retake a quiz - create a new quiz session with the same questions
router.post('/quiz-results/:quizId/retake', auth, async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.userId;

    // Find the original quiz result
    const originalQuiz = await QuizResult.findOne({ _id: quizId, userId });
    if (!originalQuiz) {
      return res.status(404).json({
        success: false,
        error: 'Original quiz result not found'
      });
    }

    // Create a new quiz session with the same questions but reset answers
    const retakeQuiz = {
      questions: originalQuiz.questions.map(q => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        hint: q.hint,
        explanation: q.explanation,
        userAnswer: null, // Reset user answer
        isCorrect: false // Reset correctness
      })),
      noteId: originalQuiz.noteId,
      noteTitle: originalQuiz.noteTitle,
      retakeOf: quizId // Reference to original quiz
    };

    console.log('Retake quiz created successfully. Original quiz ID:', quizId);

    res.status(200).json({
      success: true,
      quiz: retakeQuiz,
      message: 'Retake quiz created successfully'
    });

  } catch (error) {
    console.error('Error creating retake quiz:', error);
    res.status(500).json({
      success: false,
      error: 'Error creating retake quiz',
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