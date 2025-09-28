import React from 'react';
import { FolderIcon } from '@heroicons/react/24/outline';

const FolderCard = ({ name, count, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm dark:shadow-gray-900/20 hover:shadow-md dark:hover:shadow-gray-900/30 transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center">
        <FolderIcon className="w-8 h-8 text-blue-500 dark:text-blue-400" />
        <div className="ml-3">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{name}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">{count} notes</p>
        </div>
      </div>
    </div>
  );
};

export default FolderCard; 