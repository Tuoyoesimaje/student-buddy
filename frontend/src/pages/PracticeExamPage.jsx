import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import PracticeExam from '../components/PracticeExam';

const PracticeExamPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 transition-colors duration-200">
      <Helmet>
        <title>Create Practice Exam | Student Buddy</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/app/study')}
            className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Active Learning
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 text-center lg:text-left">Practice Exam</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Generate practice questions from your notes or a specific topic to test your knowledge.
          </p>
        </div>

        <PracticeExam />
      </div>
    </div>
  );
};

export default PracticeExamPage;