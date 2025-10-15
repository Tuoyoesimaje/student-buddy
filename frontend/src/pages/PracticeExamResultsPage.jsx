import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import PracticeExamResults from '../components/PracticeExamResults';

const PracticeExamResultsPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 transition-colors duration-200">
      <Helmet>
        <title>Practice Exam Results | Student Buddy</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Ensure page is scrolled to top when mounted (navigating from tracker) */}
        {/* eslint-disable-next-line react-hooks/rules-of-hooks */}
        {useEffect(() => { window.scrollTo(0, 0); }, [])}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Exam Results</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Review your performance and see detailed feedback on each question.
          </p>
        </div>

        <PracticeExamResults />
      </div>
    </div>
  );
};

export default PracticeExamResultsPage;