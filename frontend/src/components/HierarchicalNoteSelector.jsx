import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronRightIcon, FolderIcon, DocumentTextIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const HierarchicalNoteSelector = ({
  notes = [],
  courses = [],
  selectedNotes = [],
  onSelectionChange,
  maxSelections = 3,
  singleSelect = false,
  className = ""
}) => {
  const [expandedCourses, setExpandedCourses] = useState(new Set());
  const [expandedSubjects, setExpandedSubjects] = useState(new Set());

  // Organize notes by course and subject
  const organizedData = React.useMemo(() => {
    const data = {};

    // First, create course structure
    courses.forEach(course => {
      data[course._id] = {
        course,
        subjects: {}
      };
    });

    // Add a "General" category for notes without courses
    data.general = {
      course: { _id: 'general', name: 'General Notes', code: 'GEN' },
      subjects: {}
    };

    // Organize notes into courses and subjects
    notes.forEach(note => {
      const courseId = note.course?._id || 'general';
      const subject = note.subject || 'Uncategorized';

      if (!data[courseId]) {
        data[courseId] = {
          course: note.course || { _id: 'general', name: 'General Notes', code: 'GEN' },
          subjects: {}
        };
      }

      if (!data[courseId].subjects[subject]) {
        data[courseId].subjects[subject] = [];
      }

      data[courseId].subjects[subject].push(note);
    });

    return data;
  }, [notes, courses]);

  const toggleCourse = (courseId) => {
    setExpandedCourses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };

  const toggleSubject = (subjectKey) => {
    setExpandedSubjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subjectKey)) {
        newSet.delete(subjectKey);
      } else {
        newSet.add(subjectKey);
      }
      return newSet;
    });
  };

  const handleNoteToggle = (note) => {
    const isSelected = selectedNotes.some(n => n._id === note._id);

    if (singleSelect) {
      // Single select mode - only one note at a time
      onSelectionChange(isSelected ? [] : [note]);
    } else {
      // Multi select mode
      if (isSelected) {
        onSelectionChange(selectedNotes.filter(n => n._id !== note._id));
      } else if (selectedNotes.length < maxSelections) {
        onSelectionChange([...selectedNotes, note]);
      }
    }
  };

  const isNoteSelected = (noteId) => {
    return selectedNotes.some(n => n._id === noteId);
  };

  const getSelectionStatus = () => {
    if (singleSelect) {
      return selectedNotes.length > 0 ? `Selected: ${selectedNotes[0].title}` : 'No note selected';
    } else {
      return `${selectedNotes.length} of ${maxSelections} notes selected`;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Selection Status */}
      <motion.div
        className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {getSelectionStatus()}
        {selectedNotes.length > 0 && !singleSelect && (
          <motion.div
            className="mt-2 flex flex-wrap gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <AnimatePresence>
              {selectedNotes.map(note => (
                <motion.span
                  key={note._id}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  whileHover={{ scale: 1.05 }}
                >
                  {note.title}
                </motion.span>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>

      {/* Hierarchical Tree */}
      <div className="border border-gray-200 dark:border-gray-600 rounded-lg max-h-96 overflow-y-auto">
        {Object.entries(organizedData).map(([courseId, courseData]) => {
          const course = courseData.course;
          const subjects = courseData.subjects;
          const hasNotes = Object.keys(subjects).length > 0;
          const isExpanded = expandedCourses.has(courseId);

          if (!hasNotes) return null;

          return (
            <div key={courseId} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0">
              {/* Course Header */}
              <motion.div
                className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                onClick={() => toggleCourse(courseId)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <motion.div
                  animate={{ rotate: isExpanded ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRightIcon className="w-4 h-4 mr-2 text-gray-500" />
                </motion.div>
                <AcademicCapIcon className="w-5 h-5 mr-2 text-blue-500" />
                <div className="flex-1">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {course.name}
                  </span>
                  {course.code && course.code !== 'GEN' && (
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                      ({course.code})
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {Object.values(subjects).reduce((total, notes) => total + notes.length, 0)} notes
                </span>
              </motion.div>

              {/* Subjects and Notes */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    className="ml-6 border-l border-gray-200 dark:border-gray-600"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    {Object.entries(subjects).map(([subjectName, subjectNotes], subjectIndex) => {
                      const subjectKey = `${courseId}-${subjectName}`;
                      const isSubjectExpanded = expandedSubjects.has(subjectKey);

                      return (
                        <motion.div
                          key={subjectKey}
                          className="border-b border-gray-50 dark:border-gray-700 last:border-b-0"
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: subjectIndex * 0.1 }}
                        >
                          {/* Subject Header */}
                          <motion.div
                            className="flex items-center p-2 hover:bg-gray-25 dark:hover:bg-gray-750 cursor-pointer transition-colors"
                            onClick={() => toggleSubject(subjectKey)}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                          >
                            <motion.div
                              animate={{ rotate: isSubjectExpanded ? 90 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronRightIcon className="w-3 h-3 mr-2 text-gray-400" />
                            </motion.div>
                            <FolderIcon className="w-4 h-4 mr-2 text-yellow-500" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {subjectName}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                              {subjectNotes.length}
                            </span>
                          </motion.div>

                          {/* Notes List */}
                          <AnimatePresence>
                            {isSubjectExpanded && (
                              <motion.div
                                className="ml-6 space-y-1"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                {subjectNotes.map((note, noteIndex) => {
                                  const selected = isNoteSelected(note._id);
                                  return (
                                    <motion.div
                                      key={note._id}
                                      className={`flex items-center p-2 rounded cursor-pointer transition-all ${
                                        selected
                                          ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700'
                                          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                                      }`}
                                      onClick={() => handleNoteToggle(note)}
                                      initial={{ x: -10, opacity: 0 }}
                                      animate={{ x: 0, opacity: 1 }}
                                      transition={{ delay: noteIndex * 0.05 }}
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      <motion.input
                                        type={singleSelect ? "radio" : "checkbox"}
                                        checked={selected}
                                        onChange={() => {}}
                                        className="mr-3"
                                        name={singleSelect ? "note-selection" : undefined}
                                        whileHover={{ scale: 1.1 }}
                                      />
                                      <DocumentTextIcon className="w-4 h-4 mr-2 text-gray-400" />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                          {note.title}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                          {note.content.replace(/<[^>]*>/g, '').substring(0, 80)}...
                                        </p>
                                      </div>
                                    </motion.div>
                                  );
                                })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Selection Limit Warning */}
      <AnimatePresence>
        {!singleSelect && selectedNotes.length >= maxSelections && (
          <motion.div
            className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-700"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <strong>Selection limit reached:</strong> You can select up to {maxSelections} notes.
            Deselect a note to choose a different one.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HierarchicalNoteSelector;