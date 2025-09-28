import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const ShareModal = ({ isOpen, onClose, syncSpaces, onShare }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/50 p-6 max-w-md w-full border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Share to Sync Space</h3>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          {syncSpaces.length > 0 ? (
            syncSpaces.map((space) => (
              <div key={space._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="font-medium text-gray-700 dark:text-gray-300">{space.name}</span>
                <button
                  onClick={() => onShare(space._id)}
                  className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors duration-200"
                >
                  Share
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400">You are not a member of any Sync Spaces.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;