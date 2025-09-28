import React from 'react';
import { Helmet } from 'react-helmet-async';
import PracticeExamList from '../components/PracticeExamList';

const PracticeExamListPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <Helmet>
        <title>My Practice Exams | Student Buddy</title>
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Practice Exams</h1>
          <p className="mt-2 text-gray-600">
            View and manage all your practice exams. Continue in-progress exams or review completed ones.
          </p>
        </div>
        
        <PracticeExamList />
      </div>
    </div>
  );
};

export default PracticeExamListPage;