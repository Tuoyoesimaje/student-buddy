import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlassIcon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import api from '../utils/axios';

const NoteSearchSelector = ({
  selectedNotes = [],
  onSelectionChange,
  maxSelections = 1,
  placeholder = "Search for notes...",
  className = ""
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [allNotes, setAllNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  // Load all notes on component mount
  useEffect(() => {
    const loadNotes = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/api/notes');
        setAllNotes(response.data);
      } catch (error) {
        console.error('Error loading notes:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadNotes();
  }, []);

  // Filter notes based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredNotes([]);
      setShowDropdown(false);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = allNotes.filter(note => {
      const titleMatch = note.title?.toLowerCase().includes(query);
      const contentMatch = note.content?.toLowerCase().includes(query);
      const subjectMatch = note.subject?.toLowerCase().includes(query);
      const courseMatch = note.course?.name?.toLowerCase().includes(query);

      return titleMatch || contentMatch || subjectMatch || courseMatch;
    }).slice(0, 10); // Limit to 10 results for performance

    setFilteredNotes(filtered);
    setShowDropdown(filtered.length > 0);
  }, [searchQuery, allNotes]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target) &&
          dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNoteSelect = (note) => {
    console.debug('[NoteSearchSelector] handleNoteSelect called', { note, stack: (new Error()).stack });
    if (selectedNotes.length >= maxSelections) {
      return; // Don't allow more selections than max
    }

    // Check if note is already selected
    if (selectedNotes.some(selected => selected._id === note._id)) {
      return; // Already selected
    }

    const newSelection = [...selectedNotes, note];
    onSelectionChange(newSelection);
    setSearchQuery('');
    setShowDropdown(false);
  };

  const handleRemoveNote = (noteId) => {
    const newSelection = selectedNotes.filter(note => note._id !== noteId);
    onSelectionChange(newSelection);
  };

  const canAddMore = selectedNotes.length < maxSelections;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Selected Notes Display */}
      <AnimatePresence>
        {selectedNotes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Selected Notes ({selectedNotes.length}/{maxSelections})
            </h4>
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {selectedNotes.map((note) => (
                  <motion.div
                    key={note._id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="inline-flex items-center px-3 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 text-sm border border-indigo-200 dark:border-indigo-700"
                  >
                    <span className="font-medium truncate max-w-32">{note.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveNote(note._id)}
                      className="ml-2 p-0.5 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Input */}
      {canAddMore && (
        <div className="relative">
          <div ref={searchRef} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim() && setShowDropdown(filteredNotes.length > 0)}
              placeholder={placeholder}
              className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
              disabled={isLoading}
            />
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            {isLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>
              </div>
            )}
          </div>

          {/* Dropdown */}
          <AnimatePresence>
            {showDropdown && (
              <motion.div
                ref={dropdownRef}
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-64 overflow-y-auto"
              >
                {filteredNotes.map((note) => (
                  <motion.button
                    type="button"
                    key={note._id}
                    onClick={() => handleNoteSelect(note)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors"
                    whileHover={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
                  >
                    <div className="flex flex-col space-y-1">
                      <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {note.title}
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        {note.course?.name && (
                          <span className="flex items-center">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1"></span>
                            {note.course.name}
                          </span>
                        )}
                        {note.subject && (
                          <span className="flex items-center">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
                            {note.subject}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Add Another Note Button */}
      {selectedNotes.length > 0 && canAddMore && (
            <motion.button
          type="button"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => {
            // Focus the search input
            if (searchRef.current) {
              searchRef.current.querySelector('input').focus();
            }
          }}
          className="flex items-center px-4 py-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors text-sm font-medium"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Add another note
        </motion.button>
      )}

      {/* No results message */}
      {searchQuery.trim() && !showDropdown && !isLoading && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-gray-500 dark:text-gray-400"
        >
          No notes found matching "{searchQuery}"
        </motion.p>
      )}
    </div>
  );
};

export default NoteSearchSelector;