import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const TaskModal = ({ isOpen, onClose, onSave, taskToEdit, courses = [] }) => {
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    type: 'study',
    priority: 'medium',
    time: '',
    endTime: '',
    repeat: 'none',
    course: '',
    location: ''
  });

  useEffect(() => {
    if (taskToEdit) {
      // Parse the start time
      const startTime = new Date(taskToEdit.startTime);
      const startTimeStr = `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}`;
      
      // Parse the end time if it exists
      let endTimeStr = '';
      if (taskToEdit.endTime) {
        const endTime = new Date(taskToEdit.endTime);
        endTimeStr = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
      }

      // Set the task data with all fields
      setTaskData({
        title: taskToEdit.title || '',
        description: taskToEdit.description || '',
        type: taskToEdit.type || 'study',
        priority: taskToEdit.priority || 'medium',
        time: startTimeStr,
        endTime: endTimeStr,
        repeat: taskToEdit.repeat || 'none',
        course: taskToEdit.course?._id || '',
        location: taskToEdit.location || ''
      });
    } else {
      // Reset form for new task
      setTaskData({
        title: '',
        description: '',
        type: 'study',
        priority: 'medium',
        time: '',
        endTime: '',
        repeat: 'none',
        course: '',
        location: ''
      });
    }
  }, [taskToEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create a new task object with the form data
    const updatedTask = {
      ...taskToEdit, // Keep existing task data
      title: taskData.title,
      description: taskData.description,
      type: taskData.type,
      priority: taskData.priority,
      repeat: taskData.repeat,
      course: taskData.course || null,
      location: taskData.location,
      time: taskData.time,
      endTime: taskData.endTime || '' // Ensure endTime is at least an empty string
    };

    // If endTime is not provided, set it to one hour after startTime
    if (!updatedTask.endTime && updatedTask.time) {
      const [startHours, startMinutes] = updatedTask.time.split(':').map(Number);
      const tempDate = new Date();
      tempDate.setHours(startHours, startMinutes, 0, 0);
      tempDate.setHours(tempDate.getHours() + 1);
      updatedTask.endTime = `${tempDate.getHours().toString().padStart(2, '0')}:${tempDate.getMinutes().toString().padStart(2, '0')}`;
    }

    onSave(updatedTask);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl dark:shadow-gray-900/50 p-4 sm:p-6 md:p-8 w-full max-w-lg border-t-8 border-blue-600 dark:border-blue-500 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-400 flex items-center gap-2">
            {taskToEdit ? 'Edit Task' : 'Add New Task'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 transition-colors duration-200"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Title <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={taskData.title}
              onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
              required
            />
          </div>
          <div>
              <label htmlFor="course" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Course</label>
            <select
              id="course"
              value={taskData.course}
              onChange={(e) => setTaskData({ ...taskData, course: e.target.value })}
                className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.name}
                </option>
              ))}
            </select>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              id="description"
              value={taskData.description}
              onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
              className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
              rows="2"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
              <label htmlFor="type" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Type</label>
            <select
              id="type"
              value={taskData.type}
              onChange={(e) => setTaskData({ ...taskData, type: e.target.value })}
                className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
            >
              <option value="study">Study Session</option>
              <option value="assignment">Assignment</option>
              <option value="exam">Exam</option>
              <option value="lecture">Lecture</option>
                <option value="personal">Personal</option>
            </select>
          </div>
          <div>
              <label htmlFor="priority" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Priority</label>
            <select
              id="priority"
              value={taskData.priority}
              onChange={(e) => setTaskData({ ...taskData, priority: e.target.value })}
                className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
          <div>
              <label htmlFor="time" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Start Time <span className="text-red-500 dark:text-red-400">*</span></label>
            <input
              type="time"
              id="time"
              value={taskData.time}
              onChange={(e) => setTaskData({ ...taskData, time: e.target.value })}
                className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
              required
            />
          </div>
          <div>
              <label htmlFor="endTime" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">End Time <span className="text-red-500 dark:text-red-400">*</span></label>
            <input
              type="time"
              id="endTime"
              value={taskData.endTime}
              onChange={(e) => setTaskData({ ...taskData, endTime: e.target.value })}
                className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
              required
            />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
              <label htmlFor="repeat" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Repeat</label>
            <select
              id="repeat"
              value={taskData.repeat}
              onChange={(e) => setTaskData({ ...taskData, repeat: e.target.value })}
                className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
            >
              <option value="none">None</option>
              <option value="daily">Daily (60 days)</option>
              <option value="weekly">Weekly (12 weeks)</option>
              <option value="monthly">Monthly (3 months)</option>
            </select>
            {taskData.repeat !== 'none' && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                This will create individual task instances for each occurrence
              </p>
            )}
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Location</label>
              <input
                type="text"
                id="location"
                value={taskData.location}
                onChange={(e) => setTaskData({ ...taskData, location: e.target.value })}
                className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                placeholder="e.g., Room 101, Online, etc."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 dark:bg-blue-500 border border-transparent rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 shadow"
            >
              {taskToEdit ? 'Update Task' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;