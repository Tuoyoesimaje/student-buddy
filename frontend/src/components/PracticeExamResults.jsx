import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPracticeExam } from '../services/practiceExamService';
import { useToast } from "@/components/ui/use-toast";

const PracticeExamResults = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [exam, setExam] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await getPracticeExam(examId);
        
        if (!response.exam.submitted) {
          // If exam is not submitted, redirect to questions page
          navigate(`/app/practice-exam/questions/${examId}`);
          return;
        }
        
        setExam(response.exam);
      } catch (error) {
        console.error('Error fetching practice exam results:', error);
        toast({
          title: 'Error',
          description: 'Failed to load exam results. Please try again.',
          status: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchExam();
  }, [examId, navigate, toast]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="text-center p-6">
        <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">Error</h2>
        <p className="mt-2 text-gray-700 dark:text-gray-300">Could not load exam results.</p>
        <button
          onClick={() => navigate('/app/practice-exam')}
          className="mt-4 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Score is now already a percentage from the backend
  const percentageScore = exam.score;
  
  // Determine score color based on percentage
  let scoreColorClass = 'text-yellow-500'; // Default (medium score)
  if (percentageScore >= 80) {
    scoreColorClass = 'text-green-500'; // High score
  } else if (percentageScore < 60) {
    scoreColorClass = 'text-red-500'; // Low score
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/20 border border-gray-200 dark:border-gray-700">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Practice Exam Results</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Topic: {exam.topicOrNote.substring(0, 100)}{exam.topicOrNote.length > 100 ? '...' : ''}
        </p>
      </div>

      {/* Score summary */}
      <div className="mb-10 text-center">
        <div className="inline-block rounded-full bg-gray-100 dark:bg-gray-700 p-6 mb-4">
          <div className={`text-5xl font-bold ${scoreColorClass.replace('text-green-500', 'text-green-500 dark:text-green-400').replace('text-red-500', 'text-red-500 dark:text-red-400').replace('text-yellow-500', 'text-yellow-500 dark:text-yellow-400')}`}>
            {percentageScore}%
          </div>
          <div className="text-gray-600 dark:text-gray-400 mt-1">
            AI-Graded Performance
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">Feedback</h3>
          <p className="text-gray-700 dark:text-gray-300">{exam.feedback}</p>
        </div>
      </div>

      {/* Detailed breakdown */}
      <div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Detailed Breakdown</h3>

        {exam.detailed && exam.detailed.map((item, index) => {
          // Determine color based on mark (0-10 scale)
          let markColor = 'text-red-600 dark:text-red-400'; // Low score
          let bgColor = 'bg-red-50 dark:bg-red-900/20';
          let borderColor = 'border-red-100 dark:border-red-800';

          if (item.mark >= 9) {
            markColor = 'text-green-600 dark:text-green-400';
            bgColor = 'bg-green-50 dark:bg-green-900/20';
            borderColor = 'border-green-100 dark:border-green-800';
          } else if (item.mark >= 6) {
            markColor = 'text-yellow-600 dark:text-yellow-400';
            bgColor = 'bg-yellow-50 dark:bg-yellow-900/20';
            borderColor = 'border-yellow-100 dark:border-yellow-800';
          }

          return (
            <div
              key={index}
              className={`mb-6 p-4 rounded-lg ${bgColor} border ${borderColor}`}
            >
              <div className="flex justify-between items-start">
                <h4 className="text-lg font-medium text-gray-800 dark:text-gray-100">
                  Question {index + 1}:
                </h4>
                <div className="text-right">
                  <span className={`text-lg font-bold ${markColor}`}>
                    {item.mark}/10
                  </span>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {item.mark >= 9 ? 'Excellent' : item.mark >= 6 ? 'Good' : item.mark >= 3 ? 'Fair' : 'Needs Work'}
                  </div>
                </div>
              </div>

              <p className="mt-2 text-gray-700 dark:text-gray-300 font-medium">{item.question}</p>

              <div className="mt-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Your Answer:</p>
                <p className="mt-1 text-gray-700 dark:text-gray-300 pl-3 border-l-2 border-gray-300 dark:border-gray-600">
                  {item.studentAnswer || <em className="text-gray-400 dark:text-gray-500">No answer provided</em>}
                </p>
              </div>

              {item.comment && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">AI Feedback:</p>
                  <p className="mt-1 text-gray-700 dark:text-gray-300 pl-3 border-l-2 border-blue-300 dark:border-blue-600">
                    {item.comment}
                  </p>
                </div>
              )}

              {item.reference && item.reference !== 'N/A' && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                    Reference: {item.reference}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={() => navigate('/app/practice-exam')}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Create New Exam
        </button>

        <button
          onClick={() => navigate('/app/dashboard')}
          className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default PracticeExamResults;