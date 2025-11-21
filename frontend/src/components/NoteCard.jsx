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
      className={`rounded-xl shadow-sm dark:shadow-gray-900/20 p-5 ${bgColor} flex flex-col transition hover:shadow-md dark:hover:shadow-gray-900/30 border border-gray-200 dark:border-gray-700 cursor-pointer h-full`}
      onClick={handleCardClick}
    >
      {/* Header: Title and Action Buttons */}
      <div className="flex justify-between items-start gap-3 mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 flex-1">
          {title || 'Untitled Note'}
        </h3>
        <div className="flex-shrink-0 flex items-center gap-1">
          <button
            onClick={handleEditClick}
            className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-lg transition-all duration-200"
            aria-label="Edit note"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={handleDeleteClick}
            className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-lg transition-all duration-200"
            aria-label="Delete note"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
          {typeof onShare === 'function' && (
            <button
              onClick={handleShareClick}
              className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-lg transition-all duration-200"
              aria-label="Share note"
            >
              <ShareIcon className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-lg transition-all duration-200"
            aria-label="Copy to clipboard"
          >
            <ClipboardIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content Preview */}
      {content && (
        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 mb-4 leading-relaxed">
          {stripHtml(marked(content)).substring(0, 250) + (stripHtml(marked(content)).length > 250 ? '...' : '')}
        </p>
      )}
      
      {/* Attachments */}
      {attachments && attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {attachments.map((attachment, idx) => (
            <div
              key={idx}
              className="flex items-center bg-white/60 dark:bg-gray-800/60 rounded-md px-2 py-1 text-xs"
            >
              {attachment.type?.startsWith('image/') ? (
                <PhotoIcon className="w-3 h-3 text-blue-500 mr-1 flex-shrink-0" />
              ) : (
                <DocumentIcon className="w-3 h-3 text-gray-500 mr-1 flex-shrink-0" />
              )}
              <span className="truncate max-w-[80px]">{attachment.name}</span>
            </div>
          ))}
        </div>
      )}
      
      {/* Spacer to push metadata to bottom */}
      <div className="flex-grow"></div>
      
      {/* Metadata Footer - Responsive wrapping */}
      <div className="flex flex-wrap gap-x-3 gap-y-2 text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
        {createdAt && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <ClockIcon className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">{new Date(createdAt).toLocaleDateString()}</span>
          </div>
        )}
        {subject && (
          <div className="flex items-center gap-1 min-w-0">
            <FolderIcon className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate max-w-[120px]">{subject}</span>
          </div>
        )}
        {course && (
          <div className="flex items-center gap-1 min-w-0">
            <AcademicCapIcon className={`w-3.5 h-3.5 flex-shrink-0 ${getCourseColor()}`} />
            <span className="truncate max-w-[120px]">
              {typeof course === 'object' && course !== null ? course.name : courses.find(c => c._id === course)?.name}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}