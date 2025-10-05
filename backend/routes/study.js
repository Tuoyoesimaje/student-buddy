const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const PracticeExam = require('../models/PracticeExam');
const auth = require('../middleware/auth');

// Quiz Routes
router.get('/quizzes', auth, async (req, res) => {
  try {
    const quizzes = await Quiz.find().select('-questions.correctAnswer');
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/quizzes/:id', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).select('-questions.correctAnswer');
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/quizzes/submit', auth, async (req, res) => {
  try {
    const { quizId, answers } = req.body;
    const quiz = await Quiz.findById(quizId);
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    let score = 0;
    const results = quiz.questions.map((question, index) => {
      const isCorrect = answers[index] === question.correctAnswer;
      if (isCorrect) score++;
      return {
        question: question.question,
        isCorrect,
        explanation: question.explanation
      };
    });

    res.json({
      score,
      totalQuestions: quiz.questions.length,
      results
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Practice Exam Routes
router.get('/practice-exams', auth, async (req, res) => {
  try {
    const exams = await PracticeExam.find().select('-questions.correctAnswer');
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/practice-exams/:id', auth, async (req, res) => {
  try {
    const exam = await PracticeExam.findById(req.params.id).select('-questions.correctAnswer');
    if (!exam) {
      return res.status(404).json({ message: 'Practice exam not found' });
    }
    res.json(exam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/practice-exams/submit', auth, async (req, res) => {
  try {
    const { examId, answers } = req.body;
    const exam = await PracticeExam.findById(examId);
    
    if (!exam) {
      return res.status(404).json({ message: 'Practice exam not found' });
    }

    let totalScore = 0;
    const results = exam.questions.map((question, index) => {
      const isCorrect = answers[index] === question.correctAnswer;
      if (isCorrect) totalScore += question.marks;
      return {
        question: question.question,
        isCorrect,
        marks: isCorrect ? question.marks : 0
      };
    });

    const passed = totalScore >= exam.passingMarks;

    res.json({
      totalScore,
      totalMarks: exam.totalMarks,
      passed,
      results
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;