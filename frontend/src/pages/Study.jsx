import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ClockIcon,
  AcademicCapIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XMarkIcon,
  PlusIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import api from '../utils/axios';
import { toast } from 'react-hot-toast';
import NoteGenerationModal from '../components/NoteGenerationModal';
import NoteSearchSelector from '../components/NoteSearchSelector';
import { motion } from 'framer-motion';

const Study = () => {

  // Pomodoro Timer States
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);

  // Navigation hooks
  const navigate = useNavigate();
  const location = useLocation();

  // Study Mode States
  const [currentMode, setCurrentMode] = useState('main');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [showNoteSelection, setShowNoteSelection] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [quizResults, setQuizResults] = useState(null);

  // Data States - removed since NoteSearchSelector handles its own data loading
  const [error, setError] = useState(null);

  // Quiz Mode States
  const [quizMode, setQuizMode] = useState('prep');

  // State variables for quiz
  const [quizTopic, setQuizTopic] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [success, setSuccess] = useState(null);
  const [quizGenerationMode, setQuizGenerationMode] = useState('note-based'); // 'note-based' or 'topic'
  const [selectedQuizNotes, setSelectedQuizNotes] = useState([]);

  // Quiz interactivity states
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [progressWidth, setProgressWidth] = useState(0);
  const [feedbackType, setFeedbackType] = useState(''); // 'correct' or 'wrong'

  // Practice Exam Mode States
  const [practiceExamMode, setPracticeExamMode] = useState('prep');
  const [practiceExamTopic, setPracticeExamTopic] = useState('');
  const [isLoadingPracticeExam, setIsLoadingPracticeExam] = useState(false);
  const [practiceExamQuestions, setPracticeExamQuestions] = useState([]);
  const [practiceExamAnswers, setPracticeExamAnswers] = useState([]);
  const [currentPracticeQuestion, setCurrentPracticeQuestion] = useState(0);
  const [practiceExamResults, setPracticeExamResults] = useState(null);
  const [examId, setExamId] = useState(null);

  // Note content from navigation
  const { noteContent, autoGenerate } = location.state || {};

  // Note generation modal state
  const [showNoteGenModal, setShowNoteGenModal] = useState(false);

  // Refs for timers and intervals
  const timerRef = useRef(null);
  const timeRemainingRef = useRef(null);



  // New gamification states
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [achievements, setAchievements] = useState([]);


  const [showAchievement, setShowAchievement] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState(null);
  const [combo, setCombo] = useState(0);
  const [showPointsAnimation, setShowPointsAnimation] = useState(false);
  const [pointsToAdd, setPointsToAdd] = useState(0);







  // Achievement definitions
  const achievementDefinitions = {
    firstQuiz: { id: 'firstQuiz', title: 'First Steps', description: 'Complete your first quiz', points: 50 },
    perfectScore: { id: 'perfectScore', title: 'Perfect Score!', description: 'Get 100% on a quiz', points: 100 },
    streak3: { id: 'streak3', title: 'On Fire!', description: 'Complete 3 quizzes in a row', points: 75 },
    streak5: { id: 'streak5', title: 'Unstoppable!', description: 'Complete 5 quizzes in a row', points: 150 },
    speedster: { id: 'speedster', title: 'Speedster', description: 'Complete a quiz with more than 2 minutes remaining', points: 50 },
    combo3: { id: 'combo3', title: 'Combo Master', description: 'Get 3 correct answers in a row', points: 30 },
    combo5: { id: 'combo5', title: 'Combo Legend', description: 'Get 5 correct answers in a row', points: 50 }
  };

  // AI-Driven Encouragement & Humor Feedback System
  const correctFeedbacks = [
    "Nice one, scholar! You nailed that concept. 🧠",
    "Brains and beauty — your neurons are flexing! ✨",
    "You could tutor me at this point. Keep going! 📚",
    "Spot on! Your brain is firing on all cylinders! ⚡",
    "Brilliant! You're making this look easy. 🌟",
    "Correct! Your knowledge game is strong! 💪",
    "Perfect! You're on fire today! 🔥",
    "Excellent work! You're crushing this quiz! 🎯",
    "Right on target! Keep that momentum! 🚀",
    "Outstanding! Your brain deserves a high-five! 👏"
  ];

  const wrongFeedbacks = [
    "Close, but not quite — your brain almost caught it! 🤔",
    "Oops! Looks like your coffee hasn't kicked in yet. ☕",
    "You're warming up — the next one's yours! 🔥",
    "Not quite, but you're getting warmer! 🌡️",
    "Missed that one, but keep swinging! ⚾",
    "Wrong turn, but the journey continues! 🗺️",
    "Not this time, but you're still awesome! ⭐",
    "Close call! Next question is your redemption! 🎪",
    "Wrong answer, but right attitude! 💪",
    "Missed it, but you're still learning! 📖"
  ];

  const completionFeedbacks = [
    "Quiz complete! You're a learning machine! 🤖",
    "Finished! Your brain just leveled up! ⬆️",
    "All done! You're officially smarter now! 🧠",
    "Complete! Your knowledge just got a workout! 💪",
    "Finished! You're crushing this learning thing! 🎯",
    "Done! Your brain deserves a victory dance! 💃",
    "Complete! You're a quiz-conquering champion! 🏆",
    "Finished! Your neurons are doing the happy dance! 🕺",
    "All set! You're a learning superstar! ⭐",
    "Complete! Your brain just earned its PhD! 🎓"
  ];

  // Function to get random feedback message
  const getRandomFeedback = (type) => {
    let messages;
    switch (type) {
      case 'correct':
        messages = correctFeedbacks;
        break;
      case 'wrong':
        messages = wrongFeedbacks;
        break;
      case 'completion':
        messages = completionFeedbacks;
        break;
      default:
        return "Keep going!";
    }
    return messages[Math.floor(Math.random() * messages.length)];
  };



  // Auto-populate quiz generation form if note content provided
  useEffect(() => {
    if (autoGenerate && noteContent) {
      // Extract a topic from the note content for quiz generation
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = noteContent;
      const plainText = tempDiv.textContent || tempDiv.innerText || '';

      // Extract first meaningful sentence as topic
      const sentences = plainText.split(/[.!?]+/).filter(s => s.trim().length > 10);
      const topic = sentences[0]?.trim().substring(0, 100) || 'Note Content';

      setQuizTopic(topic);
      setCurrentMode('quiz');
      setQuizMode('prep');
    }
  }, [noteContent, autoGenerate]);

  // Handle navigation from Notes page with selected notes
  useEffect(() => {
    const { selectedNotes, mode } = location.state || {};
    if (selectedNotes && Array.isArray(selectedNotes)) {
      setSelectedQuizNotes(selectedNotes);
      setQuizGenerationMode('note-based');
      setCurrentMode('quiz');
      setQuizMode('prep');
    }
    if (mode) {
      setQuizGenerationMode(mode);
    }
  }, [location.state]);



  // Timer Functions
  const lastUpdateTimeRef = useRef(Date.now());

  useEffect(() => {
    let timer;
    if (isRunning) {
      const now = Date.now();
      const timeDiff = Math.floor((now - lastUpdateTimeRef.current) / 1000);
      
      if (timeDiff > 0) {
        setTimeLeft(prev => Math.max(0, prev - timeDiff));
        lastUpdateTimeRef.current = now;
      }

      timer = setInterval(() => {
        const currentTime = Date.now();
        const timeDiff = Math.floor((currentTime - lastUpdateTimeRef.current) / 1000);
        
        if (timeDiff > 0) {
          setTimeLeft(prev => {
            const newTime = Math.max(0, prev - timeDiff);
            if (newTime === 0) {
              handleTimerComplete();
            }
            return newTime;
          });
          lastUpdateTimeRef.current = currentTime;
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  const handleTimerComplete = () => {
    if (quizMode === 'in_progress') {
      // Auto-submit quiz when timer runs out
      const score = quizAnswers.filter((answer, index) => {
        const correctAnswer = quizQuestions[index].correctAnswer;
        return answer === correctAnswer;
      }).length;
      
      setQuizResults({
        score,
        total: quizQuestions.length,
        percentage: Math.round((score / quizQuestions.length) * 100)
      });
      setQuizMode('results');
      setIsRunning(false);
    } else if (!isBreak) {
      setCompletedPomodoros(prev => prev + 1);
      setTimeLeft(5 * 60);
      setIsBreak(true);
    } else {
      setTimeLeft(25 * 60);
      setIsBreak(false);
    }
    setIsRunning(false);
    lastUpdateTimeRef.current = Date.now();
  };

  const toggleTimer = () => {
    if (!isRunning) {
      lastUpdateTimeRef.current = Date.now();
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    if (quizMode === 'in_progress') {
      setTimeLeft(3 * 60); // 3 minutes for quiz
    } else {
      setTimeLeft(25 * 60);
    }
    setIsRunning(false);
    setIsBreak(false);
    lastUpdateTimeRef.current = Date.now();
  };

  // Update timer when quiz mode changes
  useEffect(() => {
    if (quizMode === 'in_progress') {
      setTimeLeft(3 * 60); // Set 3-minute timer for quiz
      setIsRunning(true); // Auto-start timer when quiz begins
    }
  }, [quizMode]);

  // Study Mode Functions
  const handleStartQuiz = async (mode) => {
    if (!selectedCourse) {
      toast.error('Please select a course first');
      return;
    }
    
    try {
    setQuizMode(mode);
    // Get notes for the selected course
    const relevantNotes = notes.filter(note =>
      note.course === selectedCourse
    );

      if (relevantNotes.length === 0) {
        toast.error('No notes found for the selected course');
        return;
      }

    // Create questions from the notes
    const questions = relevantNotes.map(note => {
        // Extract key points from the note content
        const content = note.content.replace(/<[^>]*>/g, ''); // Remove HTML tags
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
        
      if (mode === 'prep') {
          // Create multiple choice questions
          const mainConcept = sentences[0] || 'No content available';
          const otherOptions = sentences.slice(1, 4).map(s => s.trim());
          
          // Ensure we have enough options
          while (otherOptions.length < 3) {
            otherOptions.push('Additional information not available');
          }

          // Shuffle options
          const options = [mainConcept, ...otherOptions]
            .sort(() => Math.random() - 0.5);

        return {
          question: `What is the main concept of ${note.title}?`,
            options: options,
            correctAnswer: String.fromCharCode(65 + options.indexOf(mainConcept))
        };
      } else {
          // Create open-ended questions
        return {
          question: `Explain in detail the concept of ${note.title}. Include key points and examples.`,
          options: [],
          correctAnswer: null
        };
      }
      }).slice(0, 5); // Limit to 5 questions
      
      if (questions.length === 0) {
        toast.error('Could not generate questions from the selected notes');
        return;
      }
    
    setQuizQuestions(questions);
    setQuizAnswers(new Array(questions.length).fill(null));
    setCurrentQuestion(0);
    setCurrentMode('quiz');
      setQuizMode('in_progress');
      setTimeLeft(3 * 60); // Reset timer to 3 minutes
      setIsRunning(true); // Start the timer
      
    } catch (error) {
      console.error('Error starting quiz:', error);
      toast.error('Failed to start quiz. Please try again.');
    }
  };

  // Function to check and award achievements
  const checkAchievements = (quizResults) => {
    const newAchievements = [];
    
    // Check for perfect score
    if (quizResults.percentage === 100 && !achievements.includes('perfectScore')) {
      newAchievements.push(achievementDefinitions.perfectScore);
    }
    
    // Check for speedster
    if (timeLeft > 120 && !achievements.includes('speedster')) {
      newAchievements.push(achievementDefinitions.speedster);
    }
    
    // Check for streaks
    if (streak === 3 && !achievements.includes('streak3')) {
      newAchievements.push(achievementDefinitions.streak3);
    }
    if (streak === 5 && !achievements.includes('streak5')) {
      newAchievements.push(achievementDefinitions.streak5);
    }
    
    // Award points for achievements
    newAchievements.forEach(achievement => {
      setPoints(prev => prev + achievement.points);
      setShowAchievement(true);
      setCurrentAchievement(achievement);
      setTimeout(() => setShowAchievement(false), 3000);
    });
    
    return newAchievements;
  };

  // Modified handleQuizAnswer to show immediate feedback with 4-second timer
  const handleQuizAnswer = (answerIndex) => {
    try {
      if (!quizQuestions[currentQuestion] || isAnswerLocked) {
        return;
      }

      const answerLetter = String.fromCharCode(65 + answerIndex);
      const isCorrect = answerLetter === quizQuestions[currentQuestion].correctAnswer;

      // Set feedback state
      setSelectedAnswerIndex(answerIndex);
      setFeedbackType(isCorrect ? 'correct' : 'wrong');
      setShowFeedback(true);
      setIsAnswerLocked(true);

      // Update answers array
      const newAnswers = [...quizAnswers];
      newAnswers[currentQuestion] = answerLetter;
      setQuizAnswers(newAnswers);

      // Handle scoring and achievements
      if (isCorrect) {
        // Update combo
        setCombo(prev => prev + 1);

        // Award points based on combo
        const pointsToAward = Math.round(10 * (1 + (combo * 0.5))); // Base 10 points, increases with combo
        setPoints(prev => prev + pointsToAward);
        setPointsToAdd(pointsToAward);
        setShowPointsAnimation(true);
        setTimeout(() => setShowPointsAnimation(false), 1000);

        // Check for combo achievements
        if (combo === 3 && !achievements.includes('combo3')) {
          setAchievements(prev => [...prev, achievementDefinitions.combo3]);
          setPoints(prev => prev + achievementDefinitions.combo3.points);
          toast.success('Achievement Unlocked: Combo Master!');
        }
        if (combo === 5 && !achievements.includes('combo5')) {
          setAchievements(prev => [...prev, achievementDefinitions.combo5]);
          setPoints(prev => prev + achievementDefinitions.combo5.points);
          toast.success('Achievement Unlocked: Combo Legend!');
        }
      } else {
        setCombo(0);
      }

      // Start 4-second progress bar timer
      setProgressWidth(0);
      const startTime = Date.now();
      const duration = 4000; // 4 seconds

      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / duration) * 100, 100);
        setProgressWidth(progress);

        if (progress >= 100) {
          clearInterval(progressInterval);
          // Auto-advance to next question after 4 seconds
          if (currentQuestion < quizQuestions.length - 1) {
            handleNextQuestion();
          } else {
            // Finish quiz if it's the last question
            const score = quizAnswers.filter((answer, index) => {
              const correctAnswer = quizQuestions[index].correctAnswer;
              return answer === correctAnswer;
            }).length;

            setStreak(prev => prev + 1);
            const newAchievements = checkAchievements({
              score,
              total: quizQuestions.length,
              percentage: Math.round((score / quizQuestions.length) * 100)
            });

            setQuizResults({
              score,
              total: quizQuestions.length,
              percentage: Math.round((score / quizQuestions.length) * 100)
            });
            setQuizMode('results');
            setIsRunning(false);
            toast.success(`${getRandomFeedback('completion')} Score: ${score}/${quizQuestions.length}`);
          }
        }
      }, 50);

    } catch (error) {
      console.error('Error handling quiz answer:', error);
      toast.error('An error occurred while processing your answer');
    }
  };

  // Add a new function to handle answer selection and next question
  const handleAnswerAndNext = (answerIndex) => {
    handleQuizAnswer(answerIndex);
    // Only proceed to next question if there are more questions
    if (currentQuestion < quizQuestions.length - 1) {
      setTimeout(() => {
        handleNextQuestion();
      }, 500); // Add a small delay to show the answer feedback
    }
  };

  // Modified handleNextQuestion to include better error handling and reset feedback state
  const handleNextQuestion = () => {
    try {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      // Reset feedback state for new question
      setShowFeedback(false);
      setSelectedAnswerIndex(null);
      setIsAnswerLocked(false);
      setFeedbackType('');
      setProgressWidth(0);
    } else {
      // Calculate results
      const score = quizAnswers.filter((answer, index) => {
        const correctAnswer = quizQuestions[index].correctAnswer;
        return answer === correctAnswer;
      }).length;

        // Update streak
        setStreak(prev => prev + 1);

        // Check achievements
        const newAchievements = checkAchievements({
          score,
          total: quizQuestions.length,
          percentage: Math.round((score / quizQuestions.length) * 100)
        });

      setQuizResults({
        score,
        total: quizQuestions.length,
        percentage: Math.round((score / quizQuestions.length) * 100)
      });
      setQuizMode('results');
        setIsRunning(false); // Stop the timer

        // Show completion message with randomized feedback
        toast.success(`${getRandomFeedback('completion')} Score: ${score}/${quizQuestions.length}`);
      }
    } catch (error) {
      console.error('Error handling next question:', error);
      toast.error('An error occurred while processing the quiz');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };



  const renderMainScreen = () => (
    <div className="w-full space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        <button
          onClick={() => setCurrentMode('quiz')}
          className="flex flex-col items-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2"
        >
          <AcademicCapIcon className="w-16 h-16 text-purple-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Quiz Mode</h3>
          <p className="text-gray-600 dark:text-gray-300 mt-2 text-center">Test your knowledge with quizzes</p>
        </button>

        <button
          onClick={() => navigate('/app/practice-exam')}
          className="flex flex-col items-center p-8 bg-gradient-to-br from-orange-400 to-red-600 text-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
        >
          <AcademicCapIcon className="w-16 h-16 text-white mb-4" />
          <h3 className="text-xl font-semibold text-white">Practice Exam</h3>
          <p className="text-white/90 mt-2 text-center">Take full practice exams</p>
        </button>

        <button
          onClick={() => setShowNoteGenModal(true)}
          className="flex flex-col items-center p-8 bg-gradient-to-br from-green-400 to-blue-600 text-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          <DocumentTextIcon className="w-16 h-16 text-white mb-4" />
          <h3 className="text-xl font-semibold text-white">Generate Notes</h3>
          <p className="text-white/90 mt-2 text-center">AI-powered note generation</p>
        </button>

        <button
          onClick={() => navigate('/app/notes')}
          className="flex flex-col items-center p-8 bg-gradient-to-br from-indigo-400 to-purple-600 text-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <DocumentTextIcon className="w-16 h-16 text-white mb-4" />
          <h3 className="text-xl font-semibold text-white">My Notes</h3>
          <p className="text-white/90 mt-2 text-center">View and edit your notes</p>
        </button>

      </div>
    </div>
  );


  // Function to generate quiz questions from topic using AI
  const generateQuizFromTopic = async () => {
    if (!quizTopic.trim()) {
      setError('Please enter a topic to generate a quiz.');
      return;
    }

    setIsLoadingAI(true);
    setError(null);
    setQuizQuestions([]); // Clear previous questions
    setQuizAnswers([]); // Clear previous answers
    setTimeLeft(3 * 60); // Reset timer to 3 minutes

    try {
      // Call backend endpoint to generate quiz
      const response = await api.post('/api/ai/generate-quiz', {
        topic: quizTopic
      });

      // Parse the AI response
      const rawQuestions = response.data.response;
      const questionsArray = rawQuestions.split(/Q\d+:/).filter(Boolean).map(q => {
        const parts = q.trim().split(/A\)|B\)|C\)|Answer:/);
        if (parts.length < 5) return null; // Skip if format is incorrect

        const questionText = parts[0].trim();
        const options = parts.slice(1, 4).map(opt => opt.trim());
        const correctAnswer = parts[4].trim().toUpperCase();

        // Validate the format
        if (questionText && options.length === 3 && ['A', 'B', 'C'].includes(correctAnswer)) {
          return {
            question: questionText,
            options: options,
            correctAnswer: correctAnswer
          };
        }
        return null;
      }).filter(Boolean); // Remove any null entries

      if (questionsArray.length > 0) {
        setQuizQuestions(questionsArray);
        setQuizAnswers(new Array(questionsArray.length).fill(null));
        setCurrentQuestion(0);
        setQuizMode('in_progress');
        setIsRunning(true); // Start the timer
      } else {
        setError('Failed to generate valid questions. Please try again.');
      }

    } catch (err) {
      console.error('Error generating quiz:', err);
      setError('Failed to generate quiz. Please try again.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Function to generate quiz questions from selected note using AI
  const generateQuizFromNotes = async () => {
    if (selectedQuizNotes.length === 0) {
      setError('Please select a note to generate a quiz.');
      return;
    }

    if (selectedQuizNotes.length > 1) {
      setError('You can only generate a quiz from one note at a time. Please select only one note.');
      return;
    }

    setIsLoadingAI(true);
    setError(null);
    setQuizQuestions([]); // Clear previous questions
    setQuizAnswers([]); // Clear previous answers
    setTimeLeft(3 * 60); // Reset timer to 3 minutes

    try {
      const selectedNote = selectedQuizNotes[0];

      // Use the note content directly
      const noteContent = `${selectedNote.title}\n${selectedNote.content.replace(/<[^>]*>/g, '')}`;

      // Call backend endpoint to generate quiz from the note
      const response = await api.post('/api/ai/generate-quiz', {
        topic: `Based on this note: ${noteContent.substring(0, 1500)}...` // Limit content length
      });

      // Parse the AI response
      const rawQuestions = response.data.response;
      const questionsArray = rawQuestions.split(/Q\d+:/).filter(Boolean).map(q => {
        const parts = q.trim().split(/A\)|B\)|C\)|Answer:/);
        if (parts.length < 5) return null; // Skip if format is incorrect

        const questionText = parts[0].trim();
        const options = parts.slice(1, 4).map(opt => opt.trim());
        const correctAnswer = parts[4].trim().toUpperCase();

        // Validate the format
        if (questionText && options.length === 3 && ['A', 'B', 'C'].includes(correctAnswer)) {
          return {
            question: questionText,
            options: options,
            correctAnswer: correctAnswer
          };
        }
        return null;
      }).filter(Boolean); // Remove any null entries

      if (questionsArray.length > 0) {
        setQuizQuestions(questionsArray);
        setQuizAnswers(new Array(questionsArray.length).fill(null));
        setCurrentQuestion(0);
        setQuizMode('in_progress');
        setIsRunning(true); // Start the timer
        setSuccess(`Quiz generated successfully from "${selectedNote.title}"`);
      } else {
        setError('Failed to generate valid questions from the selected note. Please try again.');
      }

    } catch (err) {
      console.error('Error generating quiz from note:', err);
      setError('Failed to generate quiz from the selected note. Please try again.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Render Quiz Setup Screen
  const renderQuizSetupScreen = () => (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800 z-50 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-8 border-b pb-4 border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Generate Quiz</h1>
        <button
          onClick={() => setCurrentMode('main')}
            className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all text-sm"
        >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Main Menu
        </button>
      </div>

        {/* Mode Toggle */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <span className={`text-sm font-medium ${quizGenerationMode === 'note-based' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>
              Note-Based Mode
            </span>
            <button
              onClick={() => setQuizGenerationMode(quizGenerationMode === 'note-based' ? 'topic' : 'note-based')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                quizGenerationMode === 'note-based' ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  quizGenerationMode === 'note-based' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${quizGenerationMode === 'topic' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>
              Topic Mode
            </span>
          </div>
        </div>

        {quizGenerationMode === 'note-based' ? (
          /* Search-based Note Selection Interface */
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Select Note for Quiz</h3>
            <NoteSearchSelector
              selectedNotes={selectedQuizNotes}
              onSelectionChange={setSelectedQuizNotes}
              maxSelections={1}
              placeholder="Search for a note to generate quiz..."
              className="border border-gray-200 dark:border-gray-600 rounded-lg"
            />
          </div>
        ) : (
          /* Topic Input */
          <div className="mb-8">
            <label htmlFor="quizTopic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Enter Topic</label>
            <input
              type="text"
              id="quizTopic"
              value={quizTopic}
              onChange={(e) => setQuizTopic(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              placeholder="e.g., Photosynthesis, JavaScript Closures, World War II"
              disabled={isLoadingAI}
            />
          </div>
        )}

        {/* Error and Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">{success}</div>
        )}

        {/* Action Button */}
        <button
          onClick={quizGenerationMode === 'note-based' ? generateQuizFromNotes : generateQuizFromTopic}
          className={`w-full px-6 py-4 rounded-lg text-base font-medium text-white transition-all transform hover:scale-[1.02] ${
            (quizGenerationMode === 'note-based' ? selectedQuizNotes.length !== 1 : quizTopic.trim() === '') || isLoadingAI
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          }`}
          disabled={(quizGenerationMode === 'note-based' ? selectedQuizNotes.length !== 1 : !quizTopic.trim()) || isLoadingAI}
        >
          {isLoadingAI ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l2-2.647z"></path>
              </svg>
              Generating Quiz...
            </span>
          ) : (
            'Generate Quiz'
          )}
            </button>
          </div>
        </div>
  );

  // Add points animation component
  const PointsAnimation = () => (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
      <div className="animate-bounce text-2xl font-bold text-green-500">
        +{pointsToAdd} points!
      </div>
    </div>
  );

  // Add achievement notification component
  const AchievementNotification = () => (
    <div className="fixed top-4 right-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-lg z-50 animate-slide-in">
      <div className="flex items-center">
        <div className="py-1">
          <p className="font-bold">Achievement Unlocked!</p>
          <p className="text-sm">{currentAchievement?.title}</p>
          <p className="text-xs">+{currentAchievement?.points} points</p>
        </div>
      </div>
    </div>
  );

  // Modify the quiz results screen to show gamification elements
  const renderQuizResults = () => (
        <div className="fixed inset-0 bg-gradient-to-br from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800 z-50 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-8 border-b pb-6 border-gray-200 dark:border-gray-700">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quiz Results</h1>
              <button
                onClick={() => {
                  setQuizQuestions([]);
                  setQuizResults(null);
                  setCurrentMode('quiz');
                  setQuizMode('prep');
                }}
                className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all text-sm"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Quiz Setup
              </button>
            </div>

            <div className="text-center space-y-8">
              {/* Note Source Display */}
              {selectedQuizNotes.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">Quiz Source</h3>
                  <p className="text-blue-700 dark:text-blue-300">
                    Generated from: <span className="font-medium">"{selectedQuizNotes[0].title}"</span>
                  </p>
                </div>
              )}

          {/* Score Display */}
              <div className="inline-block p-8 bg-indigo-50 dark:bg-indigo-900/30 rounded-full">
                <div className="text-5xl font-bold text-indigo-600 dark:text-indigo-400">
                  {quizResults.percentage}%
                </div>
              </div>
          
          {/* Stats Display */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-indigo-600">{points}</div>
              <div className="text-sm text-gray-600">Total Points</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-green-600">{streak}</div>
              <div className="text-sm text-gray-600">Current Streak</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-purple-600">{combo}</div>
              <div className="text-sm text-gray-600">Best Combo</div>
            </div>
          </div>

              <div className="text-xl text-gray-700">
                You got {quizResults.score} out of {quizResults.total} questions correct
            </div>

              {/* Show correct answers */}
              <div className="mt-12 space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Question Review</h2>
                {quizQuestions.map((question, index) => (
                  <div key={index} className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl shadow-sm">
                    <p className="font-medium text-gray-900 dark:text-white mb-4 text-lg">{question.question}</p>
                    <div className="space-y-3">
                      {question.options.map((option, optIndex) => (
                        <p key={optIndex} className={`text-sm p-3 rounded-lg ${
                          String.fromCharCode(65 + optIndex) === question.correctAnswer
                            ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-medium border border-green-200 dark:border-green-700'
                            : 'bg-white dark:bg-gray-600 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-500'
                        }`}>
                          {String.fromCharCode(65 + optIndex)}) {option}
                          {String.fromCharCode(65 + optIndex) === question.correctAnswer &&
                            <span className="ml-2 text-green-600 dark:text-green-400">✓</span>
                          }
                        </p>
                      ))}
          </div>
                    <p className="text-sm mt-4 p-3 bg-gray-100 dark:bg-gray-600 rounded-lg">
                      <span className="text-gray-700 dark:text-gray-300">Your Answer:</span> {quizAnswers[index] ?
                        <span className={`font-medium ${
                          quizAnswers[index] === question.correctAnswer
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {quizAnswers[index]}
                        </span> :
                        <span className="text-gray-500 dark:text-gray-400">Not answered</span>
                      }
                    </p>
                  </div>
                ))}
              </div>
        </div>
      </div>
    </div>
  );

  // Update the quiz screen to use the new function
  const renderQuizScreen = () => {
    if (quizMode === 'results' && quizResults) {
      return renderQuizResults();
    }

    return (
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800 z-50 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 space-y-4 sm:space-y-0 border-b pb-6 border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                setQuizQuestions([]);
                  setQuizResults(null);
                setCurrentMode('quiz');
                  setQuizMode('prep');
              }}
                className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all text-sm"
            >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Quiz Setup
            </button>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Question {currentQuestion + 1} of {quizQuestions.length}
            </h1>
          </div>

            {/* Timer Display */}
            <div className="flex items-center space-x-4 bg-white dark:bg-gray-700 rounded-lg shadow-md p-3 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center text-gray-700 dark:text-gray-300 space-x-1">
                <ClockIcon className="w-5 h-5" />
                <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
              {formatTime(timeLeft)}
                </div>
            </div>
          </div>
        </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 sm:p-8">
            <div className="space-y-8">
            <div className="prose max-w-none">
              <div
                  className="text-xl font-medium text-gray-900 dark:text-white mb-8"
                dangerouslySetInnerHTML={{
                  __html: quizQuestions[currentQuestion].question
                    .replace(/<p>/g, '<p class="mb-4">')
                    .replace(/<strong>/g, '<strong class="font-bold text-gray-900 dark:text-white">')
                    .replace(/<em>/g, '<em class="italic text-gray-800 dark:text-gray-200">')
                    .replace(/<ul>/g, '<ul class="list-disc ml-6 mb-4">')
                    .replace(/<ol>/g, '<ol class="list-decimal ml-6 mb-4">')
                    .replace(/<li>/g, '<li class="mb-2">')
                }}
              />
            </div>


                {/* Progress Bar */}
                {showFeedback && (
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                    <div
                      className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-100 ease-linear"
                      style={{ width: `${progressWidth}%` }}
                    ></div>
                  </div>
                )}

                {/* Feedback Message */}
                {showFeedback && feedbackType && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                    className="text-center mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700"
                  >
                    <motion.p
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                      className="text-blue-800 dark:text-blue-300 font-medium"
                    >
                      {getRandomFeedback(feedbackType)}
                    </motion.p>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quizQuestions[currentQuestion].options.map((option, index) => {
                  const isSelected = selectedAnswerIndex === index;
                  const isCorrect = String.fromCharCode(65 + index) === quizQuestions[currentQuestion].correctAnswer;
                  const isWrong = isSelected && !isCorrect;

                  let buttonClass = 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600';

                  if (showFeedback) {
                    if (isCorrect) {
                      buttonClass = 'bg-green-100 dark:bg-green-900/30 border-green-500 dark:border-green-400 shadow-md';
                    } else if (isWrong) {
                      buttonClass = 'bg-red-100 dark:bg-red-900/30 border-red-500 dark:border-red-400 shadow-md';
                    } else {
                      buttonClass = 'bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 opacity-50';
                    }
                  } else if (isAnswerLocked) {
                    buttonClass = 'bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 cursor-not-allowed opacity-50';
                  } else {
                    buttonClass = 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600';
                  }

                  return (
                    <motion.button
                      key={index}
                      onClick={() => !isAnswerLocked && handleQuizAnswer(index)}
                      disabled={isAnswerLocked}
                      className={`p-4 text-left rounded-xl border transition-all ${!isAnswerLocked ? 'hover:scale-[1.02]' : ''} ${buttonClass} ${isAnswerLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      animate={showFeedback && isCorrect ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ duration: 0.5, repeat: isCorrect ? 1 : 0 }}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className="prose max-w-none text-sm text-gray-900 dark:text-gray-100 flex-1"
                          dangerouslySetInnerHTML={{
                            __html: option
                              .replace(/<p>/g, '<p class="mb-0 text-gray-900 dark:text-gray-100">')
                              .replace(/<strong>/g, '<strong class="font-bold text-gray-900 dark:text-white">')
                              .replace(/<em>/g, '<em class="italic text-gray-800 dark:text-gray-200">')
                              .replace(/<ul>/g, '<ul class="list-disc ml-6 mb-0">')
                              .replace(/<ol>/g, '<ol class="list-decimal ml-6 mb-0">')
                              .replace(/<li>/g, '<li class="mb-1 text-gray-900 dark:text-gray-100">')
                          }}
                        />
                        {showFeedback && isCorrect && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                            className="ml-2 text-green-600 dark:text-green-400"
                          >
                            <CheckCircleIcon className="w-5 h-5" />
                          </motion.div>
                        )}
                        {showFeedback && isWrong && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.3 }}
                            className="ml-2 text-red-600 dark:text-red-400"
                          >
                            <XMarkIcon className="w-5 h-5" />
                          </motion.div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center pt-6 space-y-4 sm:space-y-0">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {quizAnswers.filter(a => a !== null).length} of {quizQuestions.length} answered
              </div>
              {showFeedback && (
                <button
                  onClick={handleNextQuestion}
                  className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {currentQuestion < quizQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

        {/* Points Animation */}
        {showPointsAnimation && <PointsAnimation />}
        
        {/* Achievement Notification */}
        {showAchievement && <AchievementNotification />}
        
        {/* Combo Indicator */}
        {combo > 1 && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full shadow-lg z-50 animate-bounce">
            {combo}x Combo!
          </div>
        )}
    </div>
  );
};









return (
  <>
    <Helmet>
      <title>Active Learning | Student Buddy</title>
    </Helmet>
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-2 sm:p-4 lg:p-8 transition-colors duration-200">
      {currentMode === 'main' && renderMainScreen()}
      {currentMode === 'quiz' && quizMode === 'prep' && renderQuizSetupScreen()}
      {currentMode === 'quiz' && quizMode !== 'prep' && renderQuizScreen()}
    </div> {/* Closing the main content div */}

    <NoteGenerationModal
      isOpen={showNoteGenModal}
      onClose={() => setShowNoteGenModal(false)}
      onNoteGenerated={(note) => {
        // After generating a note, open the Notes page and optionally pass the new note
        // so the Notes page can highlight or open it.
        try {
          if (note && note._id) {
            navigate('/app/notes', { state: { newNoteId: note._id } });
          } else {
            navigate('/app/notes');
          }
        } catch (err) {
          console.error('Navigation after note generation failed:', err);
          navigate('/app/notes');
        }
      }}
    />
  </>
);
};

export default Study;
