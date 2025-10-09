import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllPracticeExams } from '../services/practiceExamService';
import { useToast } from "@/components/ui/use-toast";
import { extractNoteTitles } from '../lib/utils';

const PracticeExamList = () => {
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await getAllPracticeExams();
        setExams(response.exams);
      } catch (error) {
        console.error('Error fetching practice exams:', error);
        toast({
          title: 'Error',
          description: 'Failed to load practice exams. Please try again.',
          status: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchExams();
  }, [toast]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleExamClick = (examId, isSubmitted) => {
    if (isSubmitted) {
      navigate(`/app/practice-exam/results/${examId}`);
    } else {
      navigate(`/app/practice-exam/questions/${examId}`);
    }
  };

  const handleCreateNew = () => {
    navigate('/app/practice-exam');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/20 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Your Practice Exams</h2>
        <button
          onClick={handleCreateNew}
          className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-200"
        >
          Create New Exam
        </button>
      </div>

      {exams.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't created any practice exams yet.</p>
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-200"
          >
            Create Your First Exam
          </button>
        </div>
      ) : (
        <div className="overflow-hidden shadow dark:shadow-gray-900/20 ring-1 ring-black dark:ring-gray-600 ring-opacity-5 dark:ring-opacity-20 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 sm:pl-6">Topic</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Date</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Status</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {exams.map((exam) => (
                <tr 
                  key={exam._id} 
                  onClick={() => handleExamClick(exam._id, exam.submitted)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                    <div className="font-medium text-gray-900">
                      {extractNoteTitles(exam.topicOrNote)}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {formatDate(exam.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    {exam.submitted ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        In Progress
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {exam.submitted ? (
                      <span className="font-medium">
                        {exam.score} / 15 ({Math.round((exam.score / 15) * 100)}%)
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PracticeExamList;