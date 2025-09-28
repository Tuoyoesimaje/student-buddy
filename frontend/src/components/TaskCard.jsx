import React from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const TaskCard = ({ task, onEdit, onDelete, onToggleComplete }) => {
  const getTaskColor = (type) => {
    switch (type) {
      case 'Assignment':
        return 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-400';
      case 'Exam':
        return 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-400';
      case 'Project':
        return 'bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 dark:border-purple-400';
      case 'Study':
        return 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 dark:border-green-400';
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-l-4 border-gray-500 dark:border-gray-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`rounded-xl shadow-card dark:shadow-gray-900/20 p-4 ${getTaskColor(task.type)} flex flex-col gap-2 ${
        task.completed ? 'opacity-60 line-through' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{task.title}</h3>
          <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">{task.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => onToggleComplete(task)}
              className="form-checkbox h-5 w-5 text-blue-600 dark:text-blue-400 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
            />
            <label className="ml-1 text-gray-600 dark:text-gray-400 text-sm">Done</label>
          </div>
          <button
            onClick={() => onEdit(task)}
            className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            title="Edit Task"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(task._id)}
            className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            title="Delete Task"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400 mt-2">
        <div className="flex items-center">
          <span className="font-medium">Type:</span>
          <span className="ml-1">{task.type}</span>
        </div>
        <div className="flex items-center">
          <span className="font-medium">Start:</span>
          <span className="ml-1">{new Date(task.startTime).toLocaleString()}</span>
        </div>
        {task.endTime && (
          <div className="flex items-center">
            <span className="font-medium">End:</span>
            <span className="ml-1">{new Date(task.endTime).toLocaleString()}</span>
          </div>
        )}
        {task.repeat !== 'none' && (
          <div className="flex items-center">
            <span className="font-medium">Repeat:</span>
            <span className="ml-1">{task.repeat}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TaskCard; 