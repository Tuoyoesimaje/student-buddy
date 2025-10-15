import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { XMarkIcon, AcademicCapIcon, DocumentTextIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { apiRequest } from '../services/api';

const AssessmentTrackerModal = ({ isOpen, onClose, noteId, noteTitle }) => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  // computed improvement (percent) between last two completed assessments
  const improvement = useMemo(() => {
    if (!assessments || assessments.length === 0) return null;

    // Normalize assessments to derive a numeric percentage from either `percentage` or `score`.
    const normalized = assessments.map(a => {
      let value = null;
      if (a.percentage !== undefined && a.percentage !== null) value = Number(a.percentage);
      else if (a.score !== undefined && a.score !== null) value = Number(a.score);

      if (value !== null && !Number.isNaN(value)) {
        // If the value looks like a 0-1 fraction, convert to percentage
        if (value > 0 && value <= 1) value = value * 100;
      } else {
        value = null;
      }

      return { ...a, _computedPercentage: value };
    });

    const completed = normalized
      .filter(a => a._computedPercentage !== null)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (completed.length < 2) return null;

    const latestAssessment = completed[0];
    const previousAssessment = completed[1];
    const latest = latestAssessment._computedPercentage;
    const previous = previousAssessment._computedPercentage;

    if (previous === 0) {
      return {
        percent: latest > 0 ? 100 : 0,
        delta: latest - previous,
        improved: latest > 0,
        latestAssessment,
        previousAssessment,
      };
    }

    const delta = latest - previous;
    const percent = (delta / previous) * 100;

    return { percent, delta, improved: percent > 0, latestAssessment, previousAssessment };
  }, [assessments]);

  useEffect(() => {
    if (isOpen && noteId) {
      fetchAssessmentHistory();
    }
  }, [isOpen, noteId]);


  const fetchAssessmentHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Fetching assessment history for noteId:', noteId);
      const response = await apiRequest(`/practice-exam/history?noteId=${noteId}`);

      console.log('Assessment history response:', response);

      if (response.success) {
        setAssessments(response.assessments);
        setSummary(response.summary);
        setDebugInfo(response.debug);
        console.log('Found assessments:', response.assessments.length);
        console.log('Response data:', response);
      } else {
        setError('Failed to load assessment history');
      }
    } catch (err) {
      console.error('Error fetching assessment history:', err);
      setError('Failed to load assessment history');
    } finally {
      setLoading(false);
    }
  };

  const handleAssessmentClick = (assessment) => {
    console.log('Assessment clicked:', assessment);
    console.log('Assessment type:', assessment.type);
    console.log('Assessment ID:', assessment.id);

    // Close the modal first
    onClose();

    // Small delay allows modal to unmount and page navigation to reliably scroll to top
    setTimeout(() => {
      // Navigate to the specific result page using React Router
      if (assessment.type === 'quiz') {
        console.log('Navigating to quiz results:', `/app/quiz-results/${assessment.id}`);
        navigate(`/app/quiz-results/${assessment.id}`);
      } else if (assessment.type === 'practice-exam') {
        console.log('Navigating to practice exam results:', `/app/practice-exam/results/${assessment.id}`);
        navigate(`/app/practice-exam/results/${assessment.id}`);
      }

      // Ensure the viewport is at the top after navigation
      setTimeout(() => window.scrollTo(0, 0), 60);
    }, 80);
  };

  const CircularProgressBar = ({ percentage, size = 120, strokeWidth = 8 }) => {
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
            className="text-blue-600 dark:text-blue-400 transition-all duration-300"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {percentage?.toFixed(0) || 0}%
          </span>
        </div>
      </div>
    );
  };

  const DeltaRing = ({ percentDelta = 0, improved = true, size = 96, strokeWidth = 8 }) => {
    const absPercent = Math.min(Math.abs(percentDelta), 200); // cap visual at 200%
    // Map percent magnitude to a 0-100 range for the visual ring
    const visualPercent = Math.min(absPercent, 100);
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (visualPercent / 100) * circumference;

    const ringColor = improved ? 'text-green-500' : 'text-red-500';

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
            className={`${ringColor} transition-all duration-300`}
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`text-lg font-bold ${improved ? 'text-green-500' : 'text-red-500'}`}>
            {percentDelta >= 0 ? '+' : ''}{percentDelta.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">vs previous</div>
        </div>
      </div>
    );
  };

  // Areas of Concern feature removed

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl dark:shadow-gray-900/50 w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <AcademicCapIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Assessment Tracker
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {noteTitle} - Quiz and Practice Exam History
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading assessment history...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <XCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : assessments.length === 0 ? (
            <div className="text-center py-12">
              <AcademicCapIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-2">No assessments found for this note</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                Take a quiz or practice exam to see your history here
              </p>

              {/* Debug Information */}
              {debugInfo && (
                <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg text-left">
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">Debug Information:</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    Note ID: {debugInfo.noteId || 'None'}
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    Total quiz results in DB: {debugInfo.allQuizResults || 0}
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    Practice exams: {debugInfo.practiceExams || 0}
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    Status: {debugInfo.message || 'Unknown'}
                  </p>
                  {debugInfo.showingFallbackResults && (
                    <p className="text-sm text-orange-700 dark:text-orange-400 font-medium">
                      ⚠️ Showing all quiz results (not filtered by this specific note)
                    </p>
                  )}
                </div>
              )}

              <button
                onClick={() => {
                  console.log('Current noteId:', noteId);
                  console.log('Current noteTitle:', noteTitle);
                  fetchAssessmentHistory();
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry Loading
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Stats */}
              {summary && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {summary.totalAssessments}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Assessments</div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {summary.completedAssessments}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {summary.practiceExamsCount}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Practice Exams</div>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {summary.quizResultsCount}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Quizzes</div>
                  </div>
                </div>
              )}

              {/* Second row: Average Score + Improvement in a 2x2 style (on narrow screens stacks) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg flex flex-col items-center justify-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center">
                    Average Score
                  </h3>
                  <CircularProgressBar percentage={summary?.averageScore || 0} />
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center">
                    Improvement
                  </h3>
                  {improvement ? (
                    <div className="flex flex-col items-center">
                      <div className="flex items-center space-x-3">
                        <div className={`text-4xl font-bold ${improvement.improved ? 'text-green-500' : 'text-red-500'}`}>
                          {improvement.percent >= 0 ? '+' : ''}{improvement.percent.toFixed(1)}%
                        </div>
                        <div className="w-6 h-6 flex items-center justify-center">
                          {improvement.improved ? (
                            <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5 text-green-500"><path d="M10 4l4 6H6l4-6z" fill="currentColor"/></svg>
                          ) : (
                            <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5 text-red-500"><path d="M10 16l-4-6h8l-4 6z" fill="currentColor"/></svg>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 w-full">
                        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md text-center">
                          <div className="text-xs text-gray-500">Previous</div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {improvement.previousAssessment?._computedPercentage?.toFixed(1) ?? '-'}%
                          </div>
                          <div className="text-xs text-gray-400">{improvement.previousAssessment?.type ?? '-'}</div>
                          <div className="text-xs text-gray-400">{improvement.previousAssessment ? new Date(improvement.previousAssessment.date).toLocaleDateString() : '-'}</div>
                        </div>

                        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md text-center">
                          <div className="text-xs text-gray-500">Latest</div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {improvement.latestAssessment?._computedPercentage?.toFixed(1) ?? '-'}%
                          </div>
                          <div className="text-xs text-gray-400">{improvement.latestAssessment?.type ?? '-'}</div>
                          <div className="text-xs text-gray-400">{improvement.latestAssessment ? new Date(improvement.latestAssessment.date).toLocaleDateString() : '-'}</div>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 mt-3">{improvement.improved ? 'Improved vs previous attempt' : 'Declined vs previous attempt'}</div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600 dark:text-gray-400">Not enough data to calculate improvement</div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Assessment History */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Quizzes
                  </h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {assessments.filter(a => a.type === 'quiz').map((assessment) => (
                      <motion.div
                        key={assessment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                        onClick={() => handleAssessmentClick(assessment)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <AcademicCapIcon className="w-5 h-5 text-blue-600" />
                            <div>
                              <div className="font-medium text-gray-900 dark:text-gray-100">
                                {assessment.title}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(assessment.date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            {assessment.score !== null ? (
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {assessment.percentage !== undefined
                                  ? `${assessment.percentage.toFixed(1)}%`
                                  : assessment.score
                                }
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500">In Progress</div>
                            )}
                            {assessment.passed !== undefined && (
                              <div className={`text-xs ${assessment.passed ? 'text-green-600' : 'text-red-600'}`}>
                                {assessment.passed ? 'Passed' : 'Failed'}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Practice Exams
                  </h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {assessments.filter(a => a.type === 'practice-exam').map((assessment) => (
                      <motion.div
                        key={assessment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                        onClick={() => handleAssessmentClick(assessment)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <DocumentTextIcon className="w-5 h-5 text-purple-600" />
                            <div>
                              <div className="font-medium text-gray-900 dark:text-gray-100">
                                {assessment.title}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(assessment.date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            {assessment.score !== null ? (
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {assessment.percentage !== undefined
                                  ? `${assessment.percentage.toFixed(1)}%`
                                  : assessment.score
                                }
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500">In Progress</div>
                            )}
                            {assessment.passed !== undefined && (
                              <div className={`text-xs ${assessment.passed ? 'text-green-600' : 'text-red-600'}`}>
                                {assessment.passed ? 'Passed' : 'Failed'}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AssessmentTrackerModal;