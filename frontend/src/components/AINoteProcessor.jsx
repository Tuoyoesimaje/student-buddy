import React, { useState } from 'react';
import { SparklesIcon, XMarkIcon, DocumentTextIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function AINoteProcessor({ noteId, onNoteProcessed, className = '', children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { token } = useAuth();

  const processNote = async (action) => {
    try {
      setIsProcessing(true);
      setError('');
      setSuccess('');

      const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
      const response = await axios.post(
        `${baseUrl}/api/ai/process-note`,
        { noteId, action },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-Requested-With': 'XMLHttpRequest'
          },
          withCredentials: true
        }
      );

      if (response.data.success) {
        setSuccess(`Note ${action === 'summarize' ? 'summarized' : 'explained'} successfully!`);
        if (onNoteProcessed) {
          onNoteProcessed(response.data.note);
        }
        // Close the modal after a short delay
        setTimeout(() => {
          setIsOpen(false);
        }, 1500);
      }
    } catch (err) {
      console.error('Error processing note:', err);
      setError(err.response?.data?.error || 'Failed to process note. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <>
        <button
          onClick={() => setIsOpen(true)}
          className={`inline-flex items-center ${className}`}
        >
          {children || (
            <>
              <SparklesIcon className="h-4 w-4 mr-1.5" />
              AI Enhance
            </>
          )}
        </button>
      </>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl dark:shadow-gray-900/50 w-full max-w-md transform transition-all border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold mb-2 text-indigo-700 dark:text-indigo-400">Enhance with AI</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 transition-colors duration-200"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Choose how you'd like to enhance your note with AI:
                </p>


                <button
                  onClick={() => processNote('summarize')}
                  disabled={isProcessing}
                  className="w-full p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-500 rounded-lg group-hover:bg-blue-600 transition-colors">
                      <DocumentTextIcon className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-blue-800 dark:text-blue-300">Summarize</div>
                      <p className="text-sm text-blue-600 dark:text-blue-400">Create a concise, easy-to-review summary</p>
                    </div>
                  </div>
                </button>


                <button
                  onClick={() => processNote('explain')}
                  disabled={isProcessing}
                  className="w-full p-4 bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-700 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-500 rounded-lg group-hover:bg-purple-600 transition-colors">
                      <LightBulbIcon className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-purple-800 dark:text-purple-300">Explain</div>
                      <p className="text-sm text-purple-600 dark:text-purple-400">Get a beginner-friendly explanation</p>
                    </div>
                  </div>
                </button>

                {isProcessing && (
                  <div className="text-center py-4">
                    <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent"></div>
                    <p className="mt-2 text-sm text-gray-500">Processing your note...</p>
                  </div>
                )}

                {error && (
                  <div className="text-red-600 text-sm p-3 bg-red-50 rounded-md">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="text-green-600 text-sm p-3 bg-green-50 rounded-md">
                    {success}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
