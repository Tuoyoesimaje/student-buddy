import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  AcademicCapIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { apiRequest } from '../services/api';

const QuizResultsPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quizResult, setQuizResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (quizId) {
      fetchQuizResult();
    }
  }, [quizId]);

  const fetchQuizResult = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('QuizResultsPage - Fetching quiz result for quizId:', quizId);
      console.log('Making API call to:', `/practice-exam/quiz-results/${quizId}`);

      // Fetch individual quiz results from the practice-exam endpoint
      const response = await apiRequest(`/practice-exam/quiz-results/${quizId}`);

      console.log('QuizResultsPage - API response:', response);

      if (response.success) {
        console.log('QuizResultsPage - Full response:', response);

        // The API returns quizResult directly
        if (response.quizResult) {
          console.log('QuizResultsPage - Found quiz result:', response.quizResult);
          setQuizResult(response.quizResult);
        } else {
          console.error('QuizResultsPage - quizResult field not found in response');
          setError('Quiz result not found');
        }
      } else {
        console.error('QuizResultsPage - API response not successful:', response);
        setError('Failed to load quiz results');
      }
    } catch (err) {
      console.error('QuizResultsPage - Error fetching quiz results:', err);
      setError('Failed to load quiz results');
    } finally {
      setLoading(false);
    }
  };

  const CircularProgressBar = ({ percentage, size = 150, strokeWidth = 10 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-gray-200 dark:text-gray-700"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={`transition-all duration-500 ${
              percentage >= 80 ? 'text-green-500' :
              percentage >= 60 ? 'text-yellow-500' : 'text-red-500'
            }`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {percentage?.toFixed(0) || 0}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {quizResult?.score || 0}/{quizResult?.totalQuestions || 0}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Error Loading Quiz Results
          </h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!quizResult) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AcademicCapIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Quiz Results Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">The quiz results you're looking for don't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/app/notes')}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Notes
          </button>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Quiz Results
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {quizResult.noteTitle}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(quizResult.createdAt).toLocaleDateString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {Math.floor((quizResult.timeSpent || 0) / 60)}m {(quizResult.timeSpent || 0) % 60}s
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Score Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Your Score
            </h2>
            <div className="flex items-center justify-center mb-6">
              <CircularProgressBar percentage={quizResult.percentage} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {quizResult.score}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Correct Answers
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {quizResult.totalQuestions}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Questions
                </div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  quizResult.passed ? 'text-green-600' : 'text-red-600'
                }`}>
                  {quizResult.passed ? 'Passed' : 'Failed'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Status
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Remarks */}
        {quizResult.aiRemarks && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6 mb-8">
            <div className="flex items-start space-x-3">
              <LightBulbIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
                  AI Analysis
                </h3>
                <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
                  {quizResult.aiRemarks}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Question Review */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Question Review
          </h3>

          <div className="space-y-6">
            {quizResult.questions.map((question, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-lg border ${
                  question.isCorrect
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Question {index + 1}
                  </h4>
                  {question.isCorrect ? (
                    <CheckCircleIcon className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircleIcon className="w-6 h-6 text-red-600" />
                  )}
                </div>

                <div className="mb-4">
                  <p className="text-gray-800 dark:text-gray-200 mb-3">
                    {question.question}
                  </p>

                  {question.options && (
                    <div className="space-y-2 mb-4">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className={`p-3 rounded-lg ${
                            optionIndex === question.correctAnswer
                              ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-300 dark:border-green-600'
                              : question.userAnswer === option
                              ? 'bg-red-100 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-600'
                              : 'bg-gray-50 dark:bg-gray-700'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                              optionIndex === question.correctAnswer
                                ? 'bg-green-600 text-white'
                                : question.userAnswer === option
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                            }`}>
                              {String.fromCharCode(65 + optionIndex)}
                            </span>
                            <span className={`${
                              optionIndex === question.correctAnswer
                                ? 'text-green-800 dark:text-green-200'
                                : question.userAnswer === option
                                ? 'text-red-800 dark:text-red-200'
                                : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {option}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {!question.isCorrect && question.explanation && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                    <h5 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                      Explanation:
                    </h5>
                    <p className="text-blue-800 dark:text-blue-200 text-sm">
                      {question.explanation}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Areas of Concern */}
        {quizResult.areasOfConcern && quizResult.areasOfConcern.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-6 mt-8">
            <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-300 mb-4">
              Areas That Need Attention
            </h3>
            <div className="space-y-3">
              {quizResult.areasOfConcern.map((concern, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                      {concern.keyword}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Failed {concern.failedCount} time{concern.failedCount > 1 ? 's' : ''}
                    </div>
                  </div>
                  <button className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300 text-sm underline">
                    Review Topic
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizResultsPage;