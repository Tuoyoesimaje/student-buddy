import React, { useState, useEffect, useRef } from 'react';
import { XMarkIcon, PaperClipIcon, PhotoIcon, DocumentIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

import toast from 'react-hot-toast';


export default function NoteModal({ isOpen, onClose, noteToEdit, onSave, existingSubjects, selectedFolder, courses, selectedCourse }) {
  const [title, setTitle] = useState('');

  const [subject, setSubject] = useState('');
  const [course, setCourse] = useState('');
  const [isNewSubject, setIsNewSubject] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (noteToEdit) {
        setTitle(noteToEdit.title);

        setSubject(noteToEdit.subject || '');
        setCourse(noteToEdit.course?._id || '');
        if (noteToEdit.subject && !existingSubjects.includes(noteToEdit.subject)) {
          setIsNewSubject(true);
        } else {
          setIsNewSubject(false);
        }
      } else {
        setTitle('');

        setSubject(selectedFolder || '');
        setCourse(selectedCourse || '');
        setIsNewSubject(selectedFolder && !existingSubjects.includes(selectedFolder));
      }
    }
  }, [isOpen, noteToEdit, existingSubjects, selectedFolder, selectedCourse]);



  const handleSubmit = async (e) => {
    e.preventDefault();

    onSave({ 
      title, 

      subject: isNewSubject ? subject : (subject || null),
      course: course || null,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex justify-center items-center z-50 p-4 sm:p-6 lg:p-8">
      <div className="bg-gray-50 dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-2xl dark:shadow-gray-900/50 w-full max-w-4xl max-h-[95vh] overflow-y-auto transform transition-all duration-300 scale-100 opacity-100 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{noteToEdit ? 'Edit Note' : 'Add New Note'}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors rounded-full p-1"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2" htmlFor="title">
              Title
            </label>
            <input
              type="text"
              id="title"
              className="form-input block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>



          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="subject">
                Folder (Subject)
              </label>
              {!isNewSubject && existingSubjects.length > 0 ? (
                <select
                  id="subject"
                  className="form-select block w-full rounded-lg border-gray-300 bg-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                >
                  <option value="">None</option>
                  {existingSubjects.map((subj, index) => (
                    <option key={index} value={subj}>{subj}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  id="subject"
                  className="form-input block w-full rounded-lg border-gray-300 bg-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter new folder name"
                />
              )}
              {existingSubjects.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsNewSubject(!isNewSubject)}
                  className="mt-3 text-sm text-indigo-600 hover:text-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-md px-3 py-1 transition-colors duration-200"
                >
                  {isNewSubject ? 'Select Existing Folder' : 'Create New Folder'}
                </button>
              )}
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="course">
                Course
              </label>
              <select
                id="course"
                className="form-select block w-full rounded-lg border-gray-300 bg-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
              >
                <option value="">None</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex justify-center px-5 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
            >
              {noteToEdit ? 'Save Changes' : 'Add Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}