import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPracticeExam, submitPracticeExam } from '../services/practiceExamService';
import { useToast } from "@/components/ui/use-toast";

const PracticeExamQuestions = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [exam, setExam] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gradingProgress, setGradingProgress] = useState(0);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await getPracticeExam(examId);
        setExam(response.exam);
        console.log('Fetched exam:', response.exam);
        
        // Initialize answers array with nulls
        if (response.exam.questions) {
          setUserAnswers(Array(response.exam.questions.length).fill(''));
        }
      } catch (error) {
        console.error('Error fetching practice exam:', error);
        toast({
          title: 'Error',
          description: 'Failed to load practice exam. Please try again.',
          status: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchExam();
  }, [examId, toast]);

  const handleAnswerChange = (e) => {
    setCurrentAnswer(e.target.value);
  };

  const saveCurrentAnswer = () => {
    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentQuestionIndex] = currentAnswer;
    setUserAnswers(updatedAnswers);
  };

  const goToNextQuestion = () => {
    saveCurrentAnswer();
    if (currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentAnswer(userAnswers[currentQuestionIndex + 1]);
    }
  };

  const goToPreviousQuestion = () => {
    saveCurrentAnswer();
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setCurrentAnswer(userAnswers[currentQuestionIndex - 1]);
    }
  };

  const handleSubmit = async () => {
    // Save the current answer before submitting
    saveCurrentAnswer();

    // Check if all questions have been answered
    const unansweredQuestions = userAnswers.filter(answer => !answer.trim()).length;

    if (unansweredQuestions > 0) {
      const confirmSubmit = window.confirm(
        `You have ${unansweredQuestions} unanswered question(s). Do you want to submit anyway?`
      );

      if (!confirmSubmit) {
        return;
      }
    }

    setIsSubmitting(true);
    setGradingProgress(0);

    // Simulate progress during AI grading
    const progressInterval = setInterval(() => {
      setGradingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 500);

    try {
      const response = await submitPracticeExam(examId, userAnswers);
      setGradingProgress(100);
      setTimeout(() => {
        navigate(`/app/practice-exam/results/${examId}`);
      }, 1000);
    } catch (error) {
      console.error('Error submitting practice exam:', error);
      clearInterval(progressInterval);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to submit practice exam. Please try again.',
        status: 'error',
      });
    } finally {
      setIsSubmitting(false);
      clearInterval(progressInterval);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!exam || !exam.questions || exam.questions.length === 0) {
    return (
      <div className="text-center p-6">
        <h2 className="text-xl font-semibold text-red-600">Error</h2>
        <p className="mt-2">No questions found for this practice exam.</p>
        <button
          onClick={() => navigate('/app/practice-exam')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  // If the exam is already submitted, redirect to results
  if (exam.submitted) {
    navigate(`/app/practice-exam/results/${examId}`);
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/20 border border-gray-200 dark:border-gray-700">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Practice Exam</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Topic: {exam.topicOrNote.substring(0, 100)}{exam.topicOrNote.length > 100 ? '...' : ''}
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
          <span>Question {currentQuestionIndex + 1} of {exam.questions.length}</span>
          <span>{Math.round(((currentQuestionIndex + 1) / exam.questions.length) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div
            className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / exam.questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
          Question {currentQuestionIndex + 1}:
        </h3>
        <p className="text-gray-700 dark:text-gray-300">{exam.questions[currentQuestionIndex]}</p>
      </div>

      {/* Answer textarea */}
      <div className="mb-6">
        <label htmlFor="answer" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Your Answer:
        </label>
        <textarea
          id="answer"
          rows="6"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-500 dark:placeholder:text-gray-400"
          placeholder="Type your answer here..."
          value={currentAnswer}
          onChange={handleAnswerChange}
          disabled={isSubmitting}
        />
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <button
          onClick={goToPreviousQuestion}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 transition-colors duration-200"
          disabled={currentQuestionIndex === 0 || isSubmitting}
        >
          Previous
        </button>

        {currentQuestionIndex < exam.questions.length - 1 ? (
          <button
            onClick={goToNextQuestion}
            className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 transition-colors duration-200"
            disabled={isSubmitting}
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-md hover:bg-green-700 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              'Submit Exam'
            )}
          </button>
        )}
      </div>

      {/* Question navigation dots */}
      <div className="mt-8">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Jump to question:</p>
        <div className="flex flex-wrap gap-2">
          {exam.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                saveCurrentAnswer();
                setCurrentQuestionIndex(index);
                setCurrentAnswer(userAnswers[index]);
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${index === currentQuestionIndex
                ? 'bg-blue-600 dark:bg-blue-500 text-white'
                : userAnswers[index]?.trim()
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-700'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
              disabled={isSubmitting}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* AI Grading Progress Bar */}
      {isSubmitting && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300">AI Grading in Progress</h3>
            <span className="text-sm text-blue-600 dark:text-blue-400">{Math.round(gradingProgress)}%</span>
          </div>
          <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-3">
            <div
              className="bg-blue-600 dark:bg-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${gradingProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
            Our AI is carefully evaluating your answers based on the course material...
          </p>
        </div>
      )}
    </div>
  );
};

export default PracticeExamQuestions;