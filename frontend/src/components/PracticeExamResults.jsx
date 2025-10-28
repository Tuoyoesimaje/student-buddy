import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPracticeExam } from '../services/practiceExamService';
import { useToast } from "@/components/ui/use-toast";
import { extractNoteTitles } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, AlertCircle, BookOpen, Target, Award, TrendingUp } from 'lucide-react';

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
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-blue-200 dark:border-blue-800">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Award className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-3xl font-bold text-gray-800 dark:text-gray-100">
              Practice Exam Results
            </CardTitle>
          </div>
          <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
            <BookOpen className="h-4 w-4" />
            <span>Topic: {extractNoteTitles(exam.topicOrNote)}</span>
          </div>
        </CardHeader>
      </Card>

      {/* Score Summary Card */}
      <Card className="text-center">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            {/* Score Circle */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg">
                <div className={`text-4xl font-bold ${scoreColorClass.replace('text-green-500', 'text-green-500 dark:text-green-400').replace('text-red-500', 'text-red-500 dark:text-red-400').replace('text-yellow-500', 'text-yellow-500 dark:text-yellow-400')}`}>
                  {percentageScore}%
                </div>
              </div>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-medium">
                  AI-Graded
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-md">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>Performance</span>
                <span>{percentageScore}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${percentageScore}%` }}
                ></div>
              </div>
            </div>

            {/* Performance Level */}
            <div className="flex items-center gap-2">
              {percentageScore >= 80 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : percentageScore >= 60 ? (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {percentageScore >= 80 ? 'Excellent' : percentageScore >= 60 ? 'Good' : 'Needs Improvement'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Feedback Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
            <Target className="h-5 w-5" />
            AI Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown>{exam.feedback}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
            <TrendingUp className="h-5 w-5" />
            Detailed Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {exam.detailed && exam.detailed.map((item, index) => {
            // Determine color and styling based on mark (0-10 scale)
            let markColor = 'text-red-600 dark:text-red-400';
            let bgColor = 'bg-red-50 dark:bg-red-900/20';
            let borderColor = 'border-red-200 dark:border-red-800';
            let badgeVariant = 'destructive';
            let icon = <XCircle className="h-4 w-4" />;

            if (item.mark >= 9) {
              markColor = 'text-green-600 dark:text-green-400';
              bgColor = 'bg-green-50 dark:bg-green-900/20';
              borderColor = 'border-green-200 dark:border-green-800';
              badgeVariant = 'default';
              icon = <CheckCircle className="h-4 w-4" />;
            } else if (item.mark >= 6) {
              markColor = 'text-yellow-600 dark:text-yellow-400';
              bgColor = 'bg-yellow-50 dark:bg-yellow-900/20';
              borderColor = 'border-yellow-200 dark:border-yellow-800';
              badgeVariant = 'secondary';
              icon = <AlertCircle className="h-4 w-4" />;
            }

            return (
              <Card key={index} className={`${bgColor} border ${borderColor}`}>
                <CardContent className="p-6">
                  {/* Question Header */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                      <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-sm font-medium">
                        Q{index + 1}
                      </span>
                      Question {index + 1}
                    </h4>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        item.mark >= 9 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        item.mark >= 6 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {icon}
                        {item.mark}/10
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {item.mark >= 9 ? 'Excellent' : item.mark >= 6 ? 'Good' : item.mark >= 3 ? 'Fair' : 'Needs Work'}
                      </span>
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="mb-4">
                    <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                      {item.question}
                    </p>
                  </div>

                  {/* Student Answer */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Your Answer:</span>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700">
                      {item.studentAnswer ? (
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {item.studentAnswer}
                        </p>
                      ) : (
                        <em className="text-gray-400 dark:text-gray-500 italic">No answer provided</em>
                      )}
                    </div>
                  </div>

                  {/* AI Feedback */}
                  {item.comment && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">AI Feedback:</span>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-200 dark:border-blue-800">
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <ReactMarkdown>{item.comment}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Reference */}
                  {item.reference && item.reference !== 'N/A' && (
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400 italic">Reference:</span>
                        <div className="prose prose-xs max-w-none dark:prose-invert">
                          <ReactMarkdown>{item.reference}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/app/practice-exam')}
              className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              Create New Exam
            </button>

            <button
              onClick={() => navigate('/app/dashboard')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <TrendingUp className="h-4 w-4" />
              Back to Dashboard
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PracticeExamResults;