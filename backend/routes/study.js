const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const PracticeExam = require('../models/PracticeExam');
const StudyNote = require('../models/StudyNote');
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

// Study Notes Routes
router.get('/notes', auth, async (req, res) => {
  try {
    const notes = await StudyNote.find({ userId: req.user.userId });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/notes', auth, async (req, res) => {
  try {
    const note = new StudyNote({
      ...req.body,
      userId: req.user.userId
    });
    const savedNote = await note.save();
    res.status(201).json(savedNote);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/notes/:id', auth, async (req, res) => {
  try {
    const note = await StudyNote.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    Object.assign(note, req.body);
    note.updatedAt = Date.now();
    const updatedNote = await note.save();
    res.json(updatedNote);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/notes/:id', auth, async (req, res) => {
  try {
    const note = await StudyNote.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;