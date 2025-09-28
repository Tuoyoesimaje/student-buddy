import React from 'react';
import { Helmet } from 'react-helmet-async';
import PracticeExamQuestions from '../components/PracticeExamQuestions';

const PracticeExamQuestionsPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 transition-colors duration-200">
      <Helmet>
        <title>Practice Exam Questions | Student Buddy</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Practice Exam</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Answer each question to the best of your ability. Your answers will be graded by AI.
          </p>
        </div>

        <PracticeExamQuestions />
      </div>
    </div>
  );
};

export default PracticeExamQuestionsPage;