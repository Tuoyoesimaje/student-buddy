import React, { Suspense, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import { useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from "@/components/ui/toaster";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Lazy load non-critical components
const Notes = React.lazy(() => import('./pages/Notes'));
const Chatbot = React.lazy(() => import('./pages/Chatbot'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Study = React.lazy(() => import('./pages/Study'));
const SyncSpaces = React.lazy(() => import('./pages/SyncSpaces'));
const SyncSpace = React.lazy(() => import('./components/SyncSpace'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
// Practice Exam pages
const PracticeExamPage = React.lazy(() => import('./pages/PracticeExamPage'));
const PracticeExamQuestionsPage = React.lazy(() => import('./pages/PracticeExamQuestionsPage'));
const PracticeExamResultsPage = React.lazy(() => import('./pages/PracticeExamResultsPage'));
const PracticeExamListPage = React.lazy(() => import('./pages/PracticeExamListPage'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const App = () => {
  const { isAuthenticated } = useAuth();

  const PrivateRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  return (
    <>
      <Toaster />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        toastClassName="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700"
      />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={
          <Suspense fallback={<LoadingFallback />}>
            {!isAuthenticated ? <Login /> : <Navigate to="/app/sync-spaces" />}
          </Suspense>
        } />
        <Route path="/register" element={
          <Suspense fallback={<LoadingFallback />}>
            {!isAuthenticated ? <Register /> : <Navigate to="/app/sync-spaces" />}
          </Suspense>
        } />



        {/* Protected routes with MainLayout */}
        <Route
          path="/app"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/app/sync-spaces" />} />
          <Route path="notes" element={
            <Suspense fallback={<LoadingFallback />}>
              <Notes />
            </Suspense>
          } />
          <Route path="chatbot" element={
            <Suspense fallback={<LoadingFallback />}>
              <Chatbot />
            </Suspense>
          } />
          <Route path="settings" element={
            <Suspense fallback={<LoadingFallback />}>
              <Settings />
            </Suspense>
          } />
          <Route path="study" element={
            <Suspense fallback={<LoadingFallback />}>
              <Study />
            </Suspense>
          } />

          <Route path="sync-spaces" element={
            <Suspense fallback={<LoadingFallback />}>
              <SyncSpaces />
            </Suspense>
          } />
          <Route path="sync-space/:id" element={
            <Suspense fallback={<LoadingFallback />}>
              <SyncSpace />
            </Suspense>
          } />
          
          {/* Practice Exam Routes */}
          <Route path="practice-exam" element={<PracticeExamPage />} />
          <Route path="practice-exam/list" element={
            <Suspense fallback={<LoadingFallback />}>
              <PracticeExamListPage />
            </Suspense>
          } />
          <Route path="practice-exam/questions/:examId" element={<PracticeExamQuestionsPage />} />
          <Route path="practice-exam/results/:examId" element={<PracticeExamResultsPage />} />
        </Route>

        {/* Redirect authenticated users from root to sync spaces */}
        <Route path="*" element={isAuthenticated ? <Navigate to="/app/sync-spaces" /> : <Navigate to="/login" />} />
      </Routes>
      <Toaster />
    </>
  );
};

export default App;