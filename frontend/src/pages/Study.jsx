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
  // Two-stage hint flow state
  const [attemptCounts, setAttemptCounts] = useState([]); // counts 0,1,2
  const [firstAttemptAnswers, setFirstAttemptAnswers] = useState([]); // store first attempt per question (A/B/C)

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
  const progressIntervalRef = useRef(null);
  const answersRef = useRef([]);
  const answerTimeoutRef = useRef(null);



  // remove gamification for minimal, retrieval-practice focused flow







  // Minimal feedback and no gamification/celebration per new quiz UX requirements



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
      // Preselect notes and immediately generate a quiz from them so
      // navigation from Notes -> Study auto-opens the quiz for that note.
      setSelectedQuizNotes(selectedNotes);
      setQuizGenerationMode('note-based');
      setCurrentMode('quiz');

      // If the passed selectedNotes are lightweight (e.g., only _id or missing content),
      // resolve the full note object first before attempting generation.
      (async () => {
        try {
          const noteCandidate = selectedNotes[0];
          let fullNote = noteCandidate;

          // If candidate is a string ID or missing content/title, fetch notes and resolve
          if (!noteCandidate || typeof noteCandidate === 'string' || !noteCandidate.content) {
            try {
              const allNotes = await api.get('/api/notes');
              const found = allNotes.data ? allNotes.data.find(n => n._id === (noteCandidate._id || noteCandidate)) : allNotes.find(n => n._id === (noteCandidate._id || noteCandidate));
              if (found) {
                fullNote = found;
              } else {
                throw new Error('Note not found on server');
              }
            } catch (fetchErr) {
              console.warn('Could not fetch full note for auto-quiz:', fetchErr);
              setQuizMode('prep');
              return;
            }
          }

          await generateQuizFromNotesFromArray([fullNote]);
        } catch (err) {
          console.error('Auto-generate quiz from navigation failed:', err);
          // Fall back to showing the prep screen
          setQuizMode('prep');
        }
      })();
    }
    if (mode) {
      setQuizGenerationMode(mode);
    }
  }, [location.state]);

  // Helper: generate quiz from an explicit array of notes (used for nav auto-start)
  const generateQuizFromNotesFromArray = async (notesArray) => {
    if (!notesArray || notesArray.length === 0) {
      setError('Please select a note to generate a quiz.');
      return;
    }

    if (notesArray.length > 1) {
      setError('You can only generate a quiz from one note at a time. Please select only one note.');
      return;
    }

    setIsLoadingAI(true);
    setError(null);
    setQuizQuestions([]); // Clear previous questions
    setQuizAnswers([]); // Clear previous answers

    try {
      const selectedNote = notesArray[0];

      const noteContent = `${selectedNote.title}\n${selectedNote.content.replace(/<[^>]*>/g, '')}`;

      const response = await api.post('/api/ai/generate-quiz', {
        topic: `Based on this note: ${noteContent.substring(0, 200000)}...` // Increased to 200K characters for large textbook coverage
      });

      const rawQuestions = response.data.response;
      // Parse AI output including 'Hint:' lines. Expected block per question includes a 'Hint: ' line above Answer.
      const questionsArray = rawQuestions.split(/Q\d+:/).filter(Boolean).map(q => {
        const answerSplit = q.split(/Answer:/);
        if (answerSplit.length < 2) return null;
        const beforeAnswer = answerSplit[0];
        const answerLetter = answerSplit[1].trim().charAt(0).toUpperCase();

  const hintMatch = beforeAnswer.match(/Hint:\s*([\s\S]*)/i);
  const hint = hintMatch ? hintMatch[1].trim() : '';

  // Remove the Hint: block from the text before splitting into options so the hint
  // doesn't accidentally become part of an option when AI formatting is inconsistent.
  const beforeAnswerNoHint = beforeAnswer.replace(/Hint:\s*[\s\S]*$/i, '').trim();

  const parts = beforeAnswerNoHint.split(/A\)|B\)|C\)/);
        if (parts.length < 4) return null;
  const questionText = parts[0].trim();
  // Only strip a leading ')' and only trim surrounding whitespace — avoid removing
  // internal leading characters which can concatenate the first two words (e.g. 'To encrypt' -> 'Toencrypt')
  const options = [parts[1].trim(), parts[2].trim(), parts[3].trim()].map(s => s.replace(/^\)\s*/, '').trim());

        if (questionText && options.length === 3 && ['A','B','C'].includes(answerLetter)) {
          return {
            question: questionText,
            options,
            correctAnswer: answerLetter,
            hint
          };
        }
        return null;
      }).filter(Boolean);

      if (questionsArray.length > 0) {
        setQuizQuestions(questionsArray);
        const initAnswers = new Array(questionsArray.length).fill(null);
        const initAttempts = new Array(questionsArray.length).fill(0);
        const initFirst = new Array(questionsArray.length).fill(null);
        setQuizAnswers(initAnswers);
        setAttemptCounts(initAttempts);
        setFirstAttemptAnswers(initFirst);
        answersRef.current = initAnswers;
        setCurrentQuestion(0);
        setQuizMode('in_progress');
        setTimeLeft(5 * 60); // Ensure the new 5 minute timer
        setIsRunning(true);
        setSuccess(`Quiz generated successfully from "${selectedNote.title}"`);
      } else {
        setError('Failed to generate valid questions from the selected note. Please try again.');
        setQuizMode('prep');
      }

    } catch (err) {
      console.error('Error auto-generating quiz from notes:', err);
      setError('Failed to generate quiz from the selected note. Please try again.');
      setQuizMode('prep');
    } finally {
      setIsLoadingAI(false);
    }
  };



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
      setTimeLeft(5 * 60); // 5 minutes for quiz
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
      setTimeLeft(5 * 60); // Set 5-minute timer for quiz
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
      const initAnswers = new Array(questions.length).fill(null);
      setQuizAnswers(initAnswers);
      answersRef.current = initAnswers;
    setCurrentQuestion(0);
    setCurrentMode('quiz');
      setQuizMode('in_progress');
  setTimeLeft(5 * 60); // Reset timer to 5 minutes
      setIsRunning(true); // Start the timer
      
    } catch (error) {
      console.error('Error starting quiz:', error);
      toast.error('Failed to start quiz. Please try again.');
    }
  };

  // Achievements/gamification removed for focused retrieval practice UX

  // Finalize quiz: score is based ONLY on the first attempt for each question
  const finalizeQuiz = () => {
    const firstAnswers = firstAttemptAnswers || [];
    const score = quizQuestions.reduce((sum, q, index) => {
      const first = firstAnswers[index];
      if (first && first === q.correctAnswer) return sum + 1;
      return sum;
    }, 0);

    setQuizResults({
      score,
      total: quizQuestions.length,
      percentage: Math.round((score / quizQuestions.length) * 100)
    });
    setQuizMode('results');
    setIsRunning(false);

    // Send result data to backend: include per-question attempt info so backend records first-attempt scoring
    try {
      const answersPayload = quizQuestions.map((q, idx) => ({
        answer: firstAttemptAnswers[idx] || null,
        attemptNumber: attemptCounts[idx] || 0,
        firstAttemptAnswer: firstAttemptAnswers[idx] || null,
        attemptCount: attemptCounts[idx] || 0
      }));
      // Use studyService submitQuiz (imported earlier as api.post directly in pages) - call API directly
      api.post('/api/study/quizzes/submit', { quizId: null, answers: answersPayload }).catch(() => {
        // Non-blocking: failures to record on server shouldn't affect UX
      });
    } catch (e) {
      // ignore
    }
  };

  // Two-stage answer handling: record first attempt only for scoring
  const handleQuizAnswer = (answerIndex) => {
    if (!quizQuestions[currentQuestion] || isAnswerLocked) return;

    // Clear any pending answer timeouts to avoid overlapping auto-advance or locks
    if (answerTimeoutRef.current) {
      clearTimeout(answerTimeoutRef.current);
      answerTimeoutRef.current = null;
    }

    const answerLetter = String.fromCharCode(65 + answerIndex);

    const currentAttempts = attemptCounts[currentQuestion] || 0;

    // Helper to mark selected answer for UI
    setSelectedAnswerIndex(answerIndex);
    setShowFeedback(true);

    if (currentAttempts === 0) {
      // First attempt
      const newFirst = [...firstAttemptAnswers];
      newFirst[currentQuestion] = answerLetter;
      setFirstAttemptAnswers(newFirst);

      const newAttempts = [...attemptCounts];
      newAttempts[currentQuestion] = 1;
      setAttemptCounts(newAttempts);

      // Update quizAnswers (for display/recording of latest selection)
      const newAnswers = [...quizAnswers];
      newAnswers[currentQuestion] = answerLetter;
      setQuizAnswers(newAnswers);
      answersRef.current = newAnswers;

      // Check correctness of first attempt
      const isCorrect = answerLetter === quizQuestions[currentQuestion].correctAnswer;
      setFeedbackType(isCorrect ? 'correct' : 'wrong');
      setFeedbackMessage(isCorrect ? 'Correct' : 'Incorrect');

      if (isCorrect) {
        // Auto-advance after 2.2 seconds
        setIsAnswerLocked(true);
        answerTimeoutRef.current = setTimeout(() => {
          answerTimeoutRef.current = null;
          setIsAnswerLocked(false);
          setShowFeedback(false);
          setSelectedAnswerIndex(null);
          // auto-advance
          if (currentQuestion < quizQuestions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
          } else {
            finalizeQuiz();
          }
        }, 4000);
      } else {
        // Show hint and allow second attempt.
        // Add a very short temporary lock to prevent rapid double-clicking which
        // can cause multiple state transitions and skip questions.
        setIsAnswerLocked(true);
        answerTimeoutRef.current = setTimeout(() => {
          answerTimeoutRef.current = null;
          setIsAnswerLocked(false);
        }, 300);
        // Do not auto-advance; keep options clickable for second attempt
      }
    } else if (currentAttempts === 1) {
      // Second attempt - reveal correct answer afterwards
      const newAttempts = [...attemptCounts];
      newAttempts[currentQuestion] = 2;
      setAttemptCounts(newAttempts);

      const newAnswers = [...quizAnswers];
      newAnswers[currentQuestion] = answerLetter;
      setQuizAnswers(newAnswers);
      answersRef.current = newAnswers;

      const isCorrect = answerLetter === quizQuestions[currentQuestion].correctAnswer;
      setFeedbackType(isCorrect ? 'correct' : 'wrong');
      setFeedbackMessage(isCorrect ? 'Correct' : 'Incorrect');

      // Reveal correct answer in UI by leaving state; lock inputs
      setIsAnswerLocked(true);

      // After 2.2 seconds, auto-advance
      answerTimeoutRef.current = setTimeout(() => {
        answerTimeoutRef.current = null;
        setIsAnswerLocked(false);
        setShowFeedback(false);
        setSelectedAnswerIndex(null);
        if (currentQuestion < quizQuestions.length - 1) {
          setCurrentQuestion(prev => prev + 1);
        } else {
          finalizeQuiz();
        }
      }, 4000);
    }
  };

  // Add a new function to handle answer selection and next question
  const handleAnswerAndNext = (answerIndex) => {
    // Clear any old timers
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    handleQuizAnswer(answerIndex);
  };

  // Modified handleNextQuestion to include better error handling and reset feedback state
  const handleNextQuestion = () => {
    try {
    // Clear any progress interval to avoid double-advancing
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      // Reset feedback state for new question
      setShowFeedback(false);
      setSelectedAnswerIndex(null);
      setIsAnswerLocked(false);
      setFeedbackType('');
      setFeedbackMessage('');
      setProgressWidth(0);
      // Clear any pending answer timeouts when manually moving to next question
      if (answerTimeoutRef.current) {
        clearTimeout(answerTimeoutRef.current);
        answerTimeoutRef.current = null;
      }
    } else {
      // Finish quiz
      finalizeQuiz();
    }
    } catch (error) {
      console.error('Error handling next question:', error);
      toast.error('An error occurred while processing the quiz');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      if (answerTimeoutRef.current) {
        clearTimeout(answerTimeoutRef.current);
        answerTimeoutRef.current = null;
      }
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper to escape HTML so tags are visible in the UI
  const escapeHtml = (unsafe) => {
    if (!unsafe && unsafe !== '') return '';
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  // Detect whether a string contains HTML-like tags
  const looksLikeHtml = (str) => {
    if (!str || typeof str !== 'string') return false;
    return /<[^>]+>/.test(str);
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

      // Parse the AI response (extract hints)
      const rawQuestions = response.data.response;
      const questionsArray = rawQuestions.split(/Q\d+:/).filter(Boolean).map(q => {
        const answerSplit = q.split(/Answer:/);
        if (answerSplit.length < 2) return null;
        const beforeAnswer = answerSplit[0];
        const answerLetter = answerSplit[1].trim().charAt(0).toUpperCase();

  const hintMatch = beforeAnswer.match(/Hint:\s*([\s\S]*)/i);
  const hint = hintMatch ? hintMatch[1].trim() : '';

  const beforeAnswerNoHint = beforeAnswer.replace(/Hint:\s*[\s\S]*$/i, '').trim();

  const parts = beforeAnswerNoHint.split(/A\)|B\)|C\)/);
        if (parts.length < 4) return null;
  const questionText = parts[0].trim();
  const options = [parts[1].trim(), parts[2].trim(), parts[3].trim()].map(s => s.replace(/^\)\s*/, '').trim());

        if (questionText && options.length === 3 && ['A','B','C'].includes(answerLetter)) {
          return {
            question: questionText,
            options,
            correctAnswer: answerLetter,
            hint
          };
        }
        return null;
      }).filter(Boolean);

      if (questionsArray.length > 0) {
        setQuizQuestions(questionsArray);
        const initAnswers = new Array(questionsArray.length).fill(null);
        const initAttempts = new Array(questionsArray.length).fill(0);
        const initFirst = new Array(questionsArray.length).fill(null);
        setQuizAnswers(initAnswers);
        setAttemptCounts(initAttempts);
        setFirstAttemptAnswers(initFirst);
        answersRef.current = initAnswers;
        setCurrentQuestion(0);
  setQuizMode('in_progress');
  setTimeLeft(5 * 60); // Reset timer to 5 minutes
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
        topic: `Based on this note: ${noteContent.substring(0, 200000)}...` // Increased to 200K characters for large textbook coverage
      });

      // Parse the AI response (extract hints)
      const rawQuestions = response.data.response;
      const questionsArray = rawQuestions.split(/Q\d+:/).filter(Boolean).map(q => {
        const answerSplit = q.split(/Answer:/);
        if (answerSplit.length < 2) return null;
        const beforeAnswer = answerSplit[0];
        const answerLetter = answerSplit[1].trim().charAt(0).toUpperCase();

  const hintMatch = beforeAnswer.match(/Hint:\s*([\s\S]*)/i);
  const hint = hintMatch ? hintMatch[1].trim() : '';

  const beforeAnswerNoHint = beforeAnswer.replace(/Hint:\s*[\s\S]*$/i, '').trim();

  const parts = beforeAnswerNoHint.split(/A\)|B\)|C\)/);
        if (parts.length < 4) return null;
  const questionText = parts[0].trim();
  const options = [parts[1].trim(), parts[2].trim(), parts[3].trim()].map(s => s.replace(/^\)\s*/, '').trim());

        if (questionText && options.length === 3 && ['A','B','C'].includes(answerLetter)) {
          return {
            question: questionText,
            options,
            correctAnswer: answerLetter,
            hint
          };
        }
        return null;
      }).filter(Boolean); // Remove any null entries

      if (questionsArray.length > 0) {
        setQuizQuestions(questionsArray);
        const initAnswers = new Array(questionsArray.length).fill(null);
        const initAttempts = new Array(questionsArray.length).fill(0);
        const initFirst = new Array(questionsArray.length).fill(null);
        setQuizAnswers(initAnswers);
        setAttemptCounts(initAttempts);
        setFirstAttemptAnswers(initFirst);
        answersRef.current = initAnswers;
        setCurrentQuestion(0);
  setQuizMode('in_progress');
  setTimeLeft(5 * 60); // Reset timer to 5 minutes
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
  // Points animation removed for minimal quiz UX

  // Modify the quiz results screen to a clean, minimal review
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
              {/* Score Display */}
              <div className="inline-block p-8 bg-indigo-50 dark:bg-indigo-900/30 rounded-full">
                <div className="text-5xl font-bold text-indigo-600 dark:text-indigo-400">
                  {quizResults.percentage}%
                </div>
              </div>

              <div className="text-xl text-gray-700">
                You got {quizResults.score} out of {quizResults.total} questions correct
              </div>

              {/* Question Review - minimal and clear */}
              <div className="mt-12 space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Question Review</h2>
                {quizQuestions.map((question, index) => (
                  <div key={index} className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl shadow-sm">
                    <p className="font-medium text-gray-900 dark:text-white mb-4 text-lg">{question.question}</p>
                    <div className="space-y-3">
                      {question.options.map((option, optIndex) => {
                        const letter = String.fromCharCode(65 + optIndex);
                        const isCorrect = letter === question.correctAnswer;
                        const first = firstAttemptAnswers[index];
                        const second = quizAnswers[index];

                        const showAsCorrect = isCorrect;
                        const showAsWrongFirst = first && first !== question.correctAnswer && first === letter;
                        const showAsWrongSecond = second && second !== question.correctAnswer && second === letter && attemptCounts[index] === 2;

                        let cls = 'bg-white dark:bg-gray-600 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-500';
                        if (showAsCorrect) cls = 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-medium border border-green-200 dark:border-green-700';
                        if (showAsWrongFirst || showAsWrongSecond) cls = 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700';

                        return (
                          <p key={optIndex} className={`text-sm p-3 rounded-lg ${cls}`}>
                            {letter}) {option}
                            {isCorrect && <span className="ml-2 text-green-600 dark:text-green-400">✓</span>}
                          </p>
                        );
                      })}
                    </div>
                    <p className="text-sm mt-4 p-3 bg-gray-100 dark:bg-gray-600 rounded-lg">
                      <span className="text-gray-700 dark:text-gray-300">First attempt:</span> {firstAttemptAnswers[index] || '—'}
                    </p>
                    {question.hint && (
                      <p className="text-sm mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">Hint: {question.hint}</p>
                    )}
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
              {looksLikeHtml(quizQuestions[currentQuestion].question) ? (
                <pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg overflow-auto text-sm text-gray-900 dark:text-gray-100 mb-6">
                  <code dangerouslySetInnerHTML={{ __html: escapeHtml(quizQuestions[currentQuestion].question) }} />
                </pre>
              ) : (
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
              )}
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
                          {feedbackMessage}
                        </motion.p>
                  </motion.div>
                )}

                {/* Hint box: show on first wrong attempt only */}
                {attemptCounts[currentQuestion] === 1 && firstAttemptAnswers[currentQuestion] && firstAttemptAnswers[currentQuestion] !== quizQuestions[currentQuestion].correctAnswer && quizQuestions[currentQuestion].hint && (
                  <div className="mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-sm text-gray-700 dark:text-blue-200">
                    <strong>Hint:</strong> {quizQuestions[currentQuestion].hint}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quizQuestions[currentQuestion].options.map((option, index) => {
                  const isSelected = selectedAnswerIndex === index;
                  const letter = String.fromCharCode(65 + index);
                  const isCorrect = letter === quizQuestions[currentQuestion].correctAnswer;

                  // Reveal correct answer only when user has had a second attempt OR their first attempt was correct
                  const revealCorrect = (attemptCounts[currentQuestion] >= 2) || (firstAttemptAnswers[currentQuestion] === quizQuestions[currentQuestion].correctAnswer);

                  const isWrongSelection = isSelected && !isCorrect;

                  let buttonClass = 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600';

                  if (showFeedback) {
                    if (revealCorrect && isCorrect) {
                      // Reveal correct answer (green) only when allowed
                      buttonClass = 'bg-green-100 dark:bg-green-900/30 border-green-500 dark:border-green-400 shadow-md';
                    } else if (isWrongSelection) {
                      // Show red on user's (wrong) selection on feedback
                      buttonClass = 'bg-red-100 dark:bg-red-900/30 border-red-500 dark:border-red-400 shadow-md';
                    } else {
                      // Dim other options but do not reveal which is correct yet
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
                      animate={showFeedback && revealCorrect && isCorrect ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ duration: 0.5, repeat: (showFeedback && revealCorrect && isCorrect) ? 1 : 0 }}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className="prose max-w-none text-sm text-gray-900 dark:text-gray-100 flex-1"
                        >
                          {looksLikeHtml(option) ? (
                            <pre className="bg-gray-50 dark:bg-gray-900 p-2 rounded-md overflow-auto text-sm text-gray-900 dark:text-gray-100 mb-0">
                              <code dangerouslySetInnerHTML={{ __html: escapeHtml(option) }} />
                            </pre>
                          ) : (
                            <div
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
                          )}
                        </div>
                        {showFeedback && revealCorrect && isCorrect && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                            className="ml-2 text-green-600 dark:text-green-400"
                          >
                            <CheckCircleIcon className="w-5 h-5" />
                          </motion.div>
                        )}
                        {showFeedback && isWrongSelection && (
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

        {/* Minimal UX: no points, achievements, or combo indicators */}
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
