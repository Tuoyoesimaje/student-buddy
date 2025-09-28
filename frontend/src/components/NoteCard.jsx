import React, { useState } from 'react';
import { PencilIcon, TrashIcon, ClockIcon, FolderIcon, AcademicCapIcon, ShareIcon, ClipboardIcon } from '@heroicons/react/24/outline'; // Import icons for card details
import { marked } from 'marked';


import { toast } from 'react-toastify';

const stripHtml = (html) => {
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};


export default function NoteCard({ note, index, onView, onEdit, onDelete, onShare, courses }) {
  const { _id, title, content, createdAt, subject, course, attachments } = note;

  // Define a set of background colors to cycle through
  const colors = [
    'bg-yellow-100 dark:bg-yellow-900/20',
    'bg-pink-100 dark:bg-pink-900/20',
    'bg-green-100 dark:bg-green-900/20',
    'bg-blue-100 dark:bg-blue-900/20',
    'bg-purple-100 dark:bg-purple-900/20',
  ];
  const bgColor = colors[index % colors.length];

  // Get course color if note is associated with a course
  const getCourseColor = () => {
    if (!course) return null;
    // If course is already populated, use its color directly
    if (typeof course === 'object' && course !== null && course.color) {
      return course.color;
    }
    // Fallback to finding in courses prop if course is just an ID
    const courseObj = courses.find(c => c._id === course);
    return courseObj?.color || 'text-gray-500';
  };

  // Function to handle clicking the card to view the note
  const handleCardClick = () => {
    onView(note); // Call the onView handler, passing the note object
  };

  const handleEditClick = (e) => {
    e.stopPropagation(); // Prevent card click event
    onEdit(note); // Pass the entire note object to the edit handler
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation(); // Prevent card click event
    if (window.confirm('Are you sure you want to delete this note?')) {
      onDelete(_id); // Pass the note ID to the delete handler
    }
  };

  const handleShareClick = (e) => {
    e.stopPropagation();
    onShare(note);
  };

  // Function to strip HTML tags for preview
  const handleCopy = () => {
    const textToCopy = stripHtml(marked(content));
    navigator.clipboard.writeText(textToCopy)
      .then(() => toast.success('Note content copied to clipboard!'))
      .catch(() => toast.error('Failed to copy note content.'));
  };

  return (
    <div
      className={`rounded-2xl shadow-md dark:shadow-gray-900/20 p-4 ${bgColor} flex flex-col justify-between transition hover:shadow-lg dark:hover:shadow-gray-900/30 relative border border-gray-200 dark:border-gray-700 cursor-pointer`}
      onClick={handleCardClick}
    >
      {/* Top section: Title and Options Icon */}
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">{title || 'Untitled Note'}</h3>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 line-clamp-3">{content ? stripHtml(marked(content)).substring(0, 150) + (stripHtml(marked(content)).length > 150 ? '...' : '') : ''}</p>
        </div>
        <div className="ml-2 flex-shrink-0 flex items-center space-x-1">
          <button
            onClick={handleEditClick}
            className="p-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none transition-colors duration-200"
            aria-label="Edit note"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            onClick={handleDeleteClick}
            className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 focus:outline-none ml-1 transition-colors duration-200"
            aria-label="Delete note"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
          <button
            onClick={handleShareClick}
            className="p-1 text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 focus:outline-none ml-1 transition-colors duration-200"
            aria-label="Share note"
          >
            <ShareIcon className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            className="ml-1 p-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none transition-colors duration-200"
            aria-label="Copy to clipboard"
          >
            <ClipboardIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Content Preview Div restored */}
      {content && (
        <div className="text-sm text-gray-700 line-clamp-3 my-4 prose dark:prose-invert max-w-none">
          <div dangerouslySetInnerHTML={{ __html: marked(content) }} />
        </div>
      )}
      
      {attachments && attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {attachments.map((attachment, index) => (
            <div
              key={index}
              className="flex items-center bg-white bg-opacity-50 rounded-lg px-2 py-1 text-xs"
            >
              {attachment.type?.startsWith('image/') ? (
                <PhotoIcon className="w-3 h-3 text-blue-500 mr-1" />
              ) : (
                <DocumentIcon className="w-3 h-3 text-gray-500 mr-1" />
              )}
              <span className="truncate max-w-[100px]">{attachment.name}</span>
            </div>
          ))}
        </div>
      )}
      
      {/* Bottom section: Date and Subject (optional) */}
      <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
        <div className="flex items-center space-x-4">
          {createdAt && (
             <div className="flex items-center">
               <ClockIcon className="w-3 h-3 mr-1"/>
               <span>{new Date(createdAt).toLocaleDateString()}</span>
             </div>
          )}
          {subject && (
             <div className="flex items-center">
               <FolderIcon className="w-3 h-3 mr-1"/>
               <span>{subject}</span>
             </div>
          )}
          {course && (
             <div className="flex items-center">
               <AcademicCapIcon className={`w-3 h-3 mr-1 ${getCourseColor()}`} />
               <span>{typeof course === 'object' && course !== null ? course.name : courses.find(c => c._id === course)?.name}</span>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}