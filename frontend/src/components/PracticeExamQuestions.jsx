import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPracticeExam, submitPracticeExam } from '../services/practiceExamService';
import { useToast } from "@/components/ui/use-toast";
import { extractNoteTitles } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, ChevronLeft, ChevronRight, Send, CheckCircle, Circle, Clock } from 'lucide-react';

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
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div>
              <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Practice Exam
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Topic: {extractNoteTitles(exam.topicOrNote)}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Progress Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Question {currentQuestionIndex + 1} of {exam.questions.length}
              </span>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {Math.round(((currentQuestionIndex + 1) / exam.questions.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${((currentQuestionIndex + 1) / exam.questions.length) * 100}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
              Q{currentQuestionIndex + 1}
            </span>
            Question {currentQuestionIndex + 1}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown>{exam.questions[currentQuestionIndex]}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {/* Answer Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-800 dark:text-gray-100">Your Answer</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            id="answer"
            rows="8"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-500 dark:placeholder:text-gray-400 resize-none"
            placeholder="Type your answer here... Markdown formatting is supported!"
            value={currentAnswer}
            onChange={handleAnswerChange}
            disabled={isSubmitting}
          />
        </CardContent>
      </Card>

      {/* Navigation Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <button
              onClick={goToPreviousQuestion}
              className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 transition-colors"
              disabled={currentQuestionIndex === 0 || isSubmitting}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            {currentQuestionIndex < exam.questions.length - 1 ? (
              <button
                onClick={goToNextQuestion}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 transition-colors"
                disabled={isSubmitting}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Exam
                  </>
                )}
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Question Navigation Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-800 dark:text-gray-100">Question Navigation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-3">
            {exam.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  saveCurrentAnswer();
                  setCurrentQuestionIndex(index);
                  setCurrentAnswer(userAnswers[index]);
                }}
                className={`relative w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                  index === currentQuestionIndex
                    ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-lg scale-110'
                    : userAnswers[index]?.trim()
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-2 border-green-300 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-800/40'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 border-2 border-transparent'
                }`}
                disabled={isSubmitting}
                title={`Question ${index + 1}${userAnswers[index]?.trim() ? ' (Answered)' : ' (Not answered)'}`}
              >
                {index + 1}
                {userAnswers[index]?.trim() && index !== currentQuestionIndex && (
                  <CheckCircle className="absolute -top-1 -right-1 h-3 w-3 text-green-600 dark:text-green-400 bg-white dark:bg-gray-800 rounded-full" />
                )}
                {index === currentQuestionIndex && (
                  <Circle className="absolute -top-1 -right-1 h-3 w-3 text-white bg-blue-600 dark:bg-blue-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-4 mt-4 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Circle className="h-3 w-3 text-blue-600 dark:text-blue-500" />
              <span>Current</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded"></div>
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 border border-transparent rounded"></div>
              <span>Not answered</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Grading Progress Card */}
      {isSubmitting && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300">AI Grading in Progress</h3>
              </div>
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded-full">
                {Math.round(gradingProgress)}%
              </span>
            </div>
            <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-3 mb-4">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${gradingProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Our AI is carefully evaluating your answers based on the course material. This may take a few moments...
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PracticeExamQuestions;