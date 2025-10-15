import { apiRequest } from '../services/api';
import api from '../utils/axios';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import FolderCard from '../components/FolderCard';
import NoteCard from '../components/NoteCard';
import { useAuth } from '../context/AuthContext';
import {
  PlusCircleIcon,
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  SparklesIcon,
  LightBulbIcon,
  DocumentTextIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FolderIcon,
  TagIcon,
  ClockIcon,
  PencilSquareIcon,
  ArrowUpTrayIcon,
  ArrowPathIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  AcademicCapIcon,
  ChartBarIcon,
  ClipboardIcon,
  BookOpenIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';
import ReactDOM from 'react-dom';

import AINoteProcessor from '../components/AINoteProcessor';
import AssessmentTrackerModal from '../components/AssessmentTrackerModal';
import { motion } from 'framer-motion';
import { marked } from 'marked';
import RichTextEditor from '../components/RichTextEditor';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';



export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');

  const [selectedNote, setSelectedNote] = useState(null);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [editedNoteContent, setEditedNoteContent] = useState('');
  const [highlightedText, setHighlightedText] = useState(null);
  const [isExplanationModalOpen, setIsExplanationModalOpen] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [aiSummary, setAiSummary] = useState(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [success, setSuccess] = useState('');
  const [sortBy, setSortBy] = useState('date'); // 'date' or 'title'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [isEditMetadataModalOpen, setIsEditMetadataModalOpen] = useState(false);
  const [noteToEditMetadata, setNoteToEditMetadata] = useState(null);
  const [isRetrievalPracticeModalOpen, setIsRetrievalPracticeModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isAssessmentTrackerModalOpen, setIsAssessmentTrackerModalOpen] = useState(false);

  // AI Explain Feature States
   const [selectedText, setSelectedText] = useState('');
   const [aiExplanation, setAiExplanation] = useState('');
   const [aiHint, setAiHint] = useState('');
   const [showFullExplanation, setShowFullExplanation] = useState(false);
   const [showAIExplainModal, setShowAIExplainModal] = useState(false);
   const [isLoadingAIExplain, setIsLoadingAIExplain] = useState(false);
   const [showExplainPopup, setShowExplainPopup] = useState(false);
   const explainPopupPosition = useRef({ x: 0, y: 0 });


  const { userId } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedNote) {
      setEditedNoteContent(selectedNote.content);
    }
  }, [selectedNote]);

  useEffect(() => {
    fetchNotes();
    fetchCourses();
  }, [userId, selectedFolder, selectedCourse, sortBy, sortOrder]);





  const fetchCourses = async () => {
    try {
      const data = await apiRequest('/courses');
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to load courses. Please try again.');
    }
  };




  const fetchNotes = async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      if (selectedFolder) {
        params.append('subject', selectedFolder);
      }
      if (selectedCourse) {
        params.append('course', selectedCourse);
      }
      if (sortBy) {
        params.append('sortBy', sortBy);
        params.append('sortOrder', sortOrder);
      }

      const queryString = params.toString();
      const endpoint = `/notes${queryString ? `?${queryString}` : ''}`;

      console.log('Fetching notes with endpoint:', endpoint);
      const data = await apiRequest(endpoint);

      // Sort notes
      const sortedNotes = sortNotes(data);
      setNotes(sortedNotes);

      // Process folders from notes
      const folderMap = {};
      data.forEach(note => {
        if (note.subject) {
          folderMap[note.subject] = (folderMap[note.subject] || 0) + 1;
        }
      });

      // Update folders state with note counts
      const updatedFolders = Object.keys(folderMap).map(folderName => ({
        id: folderName, // Using name as id for simplicity
        name: folderName,
        noteCount: folderMap[folderName],
        color: 'text-blue-500' // Default color, can be customized
      }));
      setFolders(updatedFolders);
    } catch (error) {
      console.error('Error fetching notes:', error);
      setError('Failed to load notes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const sortNotes = (notesToSort) => {
    return [...notesToSort].sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        return sortOrder === 'asc' 
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
    });
  };

  const handleSort = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  const toggleNoteSelection = (noteId) => {
    setSelectedNotes(prev => 
      prev.includes(noteId)
        ? prev.filter(id => id !== noteId)
        : [...prev, noteId]
    );
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedNotes.length} notes?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      await Promise.all(
        selectedNotes.map(noteId =>
          api.delete(`/api/notes/${noteId}`, config)
        )
      );

      await fetchNotes();
      setSelectedNotes([]);
      setIsMultiSelect(false);
      setSuccess(`${selectedNotes.length} notes deleted successfully`);
    } catch (error) {
      console.error('Error deleting notes:', error);
      setError('Failed to delete notes. Please try again.');
    }
  };

  const handleBulkMove = async (newFolder) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };

      await Promise.all(
        selectedNotes.map(noteId =>
          api.put(`/api/notes/${noteId}`, { subject: newFolder }, config)
        )
      );

      await fetchNotes();
      setSelectedNotes([]);
      setIsMultiSelect(false);
      setSuccess(`${selectedNotes.length} notes moved successfully`);
    } catch (error) {
      console.error('Error moving notes:', error);
      setError('Failed to move notes. Please try again.');
    }
  };

  useEffect(() => {
    if (userId) {
      fetchNotes();
      fetchCourses();
    }
  }, [userId, selectedFolder, selectedCourse, sortBy, sortOrder]);

  // Function to generate consistent colors based on folder name
  const getRandomColor = (name) => {
    const colors = [
      'text-blue-500',
      'text-green-500',
      'text-yellow-500',
      'text-purple-500',
      'text-pink-500',
      'text-indigo-500',
      'text-red-500',
      'text-teal-500'
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  const handleAddNoteClick = () => {
    setIsAddNoteModalOpen(true);
  };

  const handleEditNote = (note) => {
    setNoteToEditMetadata(note);
    setIsEditMetadataModalOpen(true);
  };

  const handleSaveEditedNote = async () => {
    if (!selectedNote) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };

  const response = await api.put(`/api/notes/${selectedNote._id}`, { ...selectedNote, content: editedNoteContent }, config);

      const updatedNote = response.data;
      setNotes(prevNotes => prevNotes.map(note => note._id === updatedNote._id ? updatedNote : note));
      setSelectedNote(updatedNote);
      setIsEditingNote(false);
      toast.success('Note updated successfully!');
    } catch (error) {
      console.error('Error saving edited note:', error);
      setError('Failed to save edited note. Please try again.');
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
  await api.delete(`/api/notes/${noteId}`, config);

      await fetchNotes();
      setSuccess('Note deleted successfully');

      if (selectedNote && selectedNote._id === noteId) {
        setSelectedNote(null);
        setAiSummary(null);
        if (isExplanationModalOpen) {
          setIsExplanationModalOpen(false);
          setHighlightedText(null);
          setAiExplanation(null);
          setIsAILoading(false);
        }
        // Reset popup states
        setSelectedText('');
        setAiExplanation('');
        setShowAIExplainModal(false);
        setIsLoadingAIExplain(false);
        setShowExplainPopup(false);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      setError('Failed to delete note. Please try again.');
    }
  };

  const handleModalClose = () => {
    setNoteModalOpen(false);
    setNoteToEdit(null);
    if (selectedNote) {
      const updatedNote = notes.find(note => note._id === selectedNote._id);
      if (updatedNote) {
        setSelectedNote(updatedNote);
      } else if (selectedNote && !notes.find(note => note._id === selectedNote._id)) {
        setSelectedNote(null);
        setAiSummary(null);
      }
    }
    fetchNotes();
  };



  const handleNoteSaved = async (savedNote) => {
    try {
      const updatedNotes = noteToEdit 
        ? notes.map(note => note._id === savedNote._id ? savedNote : note)
        : [savedNote, ...notes];
      
      setNotes(updatedNotes);
      setNoteToEdit(null);
      setIsModalOpen(false);
      
      setSuccess(noteToEdit ? 'Note updated successfully!' : 'Note created successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving note:', error);
      setError('Failed to save note. Please try again.');
    }
  };

  const handleAINoteCreated = (newNote) => {
    setNotes(prevNotes => [newNote, ...prevNotes]);
    setSuccess('AI note created successfully!');
    setTimeout(() => setSuccess(''), 3000);
    // Optionally navigate to the new note
    // setSelectedNote(newNote);
  };

  const handleViewNote = (note) => {
    setSelectedNote(note);
    setAiSummary(null);
  };

  const handleBackToList = () => {
    setSelectedNote(null);
    setHighlightedText(null);
    setAiExplanation(null);
    setAiHint('');
    setShowFullExplanation(false);
    setIsExplanationModalOpen(false);
    setIsAILoading(false);
    setAiSummary(null);
    setIsSummaryLoading(false);
    setIsEditingNote(false);
    setEditedNoteContent('');
    // Reset popup states
    setSelectedText('');
    setAiExplanation('');
    setAiHint('');
    setShowFullExplanation(false);
    setShowAIExplainModal(false);
    setIsLoadingAIExplain(false);
    setShowExplainPopup(false);
  };

  const handleCreateNote = async (title, folder, course) => {
    if (!userId) {
      setError('You must be logged in to create notes.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };

      const newNoteData = {
        userId,
        title,
        content: 'Start writing your note here...', // Default content
        subject: folder,
        ...(course && { course }), // Conditionally add course if selected
      };

  const response = await api.post(`/api/notes`, newNoteData, config);
      setNotes([...notes, response.data]);
      toast.success('New note created!');
      setSelectedNote(response.data); // Select the new note
      setEditedNoteContent(response.data.content); // Initialize editor with empty content
      setIsEditingNote(true); // Immediately go into edit mode for the new note
      setIsAddNoteModalOpen(false); // Close the modal
    } catch (error) {
      console.error('Error creating new note:', error);
      setError('Failed to create new note. Please try again.');
    }
  };

  const handleUpdateNoteMetadata = async (title, folder, course) => {
    if (!noteToEditMetadata) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const updatedNoteData = {
        ...noteToEditMetadata,
        title,
        subject: folder || '',
        course: course || null
      };

      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };

  const response = await api.put(`/api/notes/${noteToEditMetadata._id}`, updatedNoteData, config);

      const updatedNote = response.data;
      setNotes(prevNotes => prevNotes.map(note => note._id === updatedNote._id ? updatedNote : note));

      // If this note is currently selected, update it
      if (selectedNote && selectedNote._id === updatedNote._id) {
        setSelectedNote(updatedNote);
      }

      toast.success('Note metadata updated successfully!');
      setIsEditMetadataModalOpen(false);
      setNoteToEditMetadata(null);
    } catch (error) {
      console.error('Error updating note metadata:', error);
      setError('Failed to update note metadata. Please try again.');
    }
  };

  const AddNoteModal = ({ isOpen, onClose, onCreateNote, folders, courses }) => {
    const [title, setTitle] = useState('');
    const [selectedFolder, setSelectedFolder] = useState('');
    const [newFolderName, setNewFolderName] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');

    useEffect(() => {
      if (isOpen) {
        setTitle('');
        setSelectedFolder('');
        setNewFolderName('');
        setSelectedCourse('');
      }
    }, [isOpen]);

    const handleSubmit = (e) => {
      e.preventDefault();
      const folderToUse = selectedFolder === 'new' ? newFolderName : selectedFolder;
      onCreateNote(title, folderToUse, selectedCourse);
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Create New Note</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="noteTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Note Title</label>
              <input
                type="text"
                id="noteTitle"
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="folderSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Folder</label>
              <select
                id="folderSelect"
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
              >
                <option value="">Select existing folder</option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.name}>{folder.name}</option>
                ))}
                <option value="new">Create new folder</option>
              </select>
              {selectedFolder === 'new' && (
                <input
                  type="text"
                  className="mt-2 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="New folder name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  required
                />
              )}
            </div>
            <div className="mb-4">
              <label htmlFor="courseSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Course (Optional)</label>
              <select
                id="courseSelect"
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>{course.name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600"
              >
                Create Note
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const EditNoteMetadataModal = ({ isOpen, onClose, onUpdateNote, note, folders, courses }) => {
    const [title, setTitle] = useState('');
    const [selectedFolder, setSelectedFolder] = useState('');
    const [newFolderName, setNewFolderName] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');

    useEffect(() => {
      if (isOpen && note) {
        setTitle(note.title || '');
        setSelectedFolder(note.subject || '');
        setNewFolderName('');
        setSelectedCourse(note.course?._id || '');
      }
    }, [isOpen, note]);

    const handleSubmit = (e) => {
      e.preventDefault();
      const folderToUse = selectedFolder === 'new' ? newFolderName : selectedFolder;
      onUpdateNote(title, folderToUse, selectedCourse);
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Edit Note Metadata</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="editNoteTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Note Title</label>
              <input
                type="text"
                id="editNoteTitle"
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="editFolderSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Folder</label>
              <select
                id="editFolderSelect"
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
              >
                <option value="">No folder</option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.name}>{folder.name}</option>
                ))}
                <option value="new">Create new folder</option>
              </select>
              {selectedFolder === 'new' && (
                <input
                  type="text"
                  className="mt-2 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="New folder name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  required
                />
              )}
            </div>
            <div className="mb-4">
              <label htmlFor="editCourseSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Course (Optional)</label>
              <select
                id="editCourseSelect"
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                <option value="">No course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>{course.name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600"
              >
                Update Note
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  
  // Upload Document Modal Component
  const UploadDocumentModal = ({ isOpen, onClose, onUploadComplete, folders, courses }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [extractedText, setExtractedText] = useState('');
    const [isExtracting, setIsExtracting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [noteTitle, setNoteTitle] = useState('');
    const [selectedFolder, setSelectedFolder] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);
  
    const handleFileSelect = (e) => {
      const file = e.target.files[0];
      if (file) {
        // Validate file type
        const allowedTypes = [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
          'text/markdown'
        ];
  
        if (!allowedTypes.includes(file.type) &&
            !file.name.toLowerCase().endsWith('.md') &&
            !file.name.toLowerCase().endsWith('.txt')) {
          setError('Please select a PDF, DOCX, TXT, or MD file.');
          return;
        }
  
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          setError('File size must be less than 10MB.');
          return;
        }
  
        setSelectedFile(file);
        setError('');
        setExtractedText('');
        setNoteTitle(file.name.replace(/\.[^/.]+$/, '')); // Remove extension for default title
        extractTextFromFile(file);
      }
    };
  
    const extractTextFromFile = async (file) => {
      setIsExtracting(true);
      setUploadProgress(0);
  
      try {
        const formData = new FormData();
        formData.append('file', file);
  
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/notes/upload/extract-text`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });
  
        if (!response.ok) {
          throw new Error('Failed to extract text from file');
        }
  
        const data = await response.json();
        setExtractedText(data.text);
        setUploadProgress(100);
      } catch (error) {
        console.error('Error extracting text:', error);
        setError('Failed to extract text from file. Please try again.');
      } finally {
        setIsExtracting(false);
      }
    };
  
    const handleSaveNote = async () => {
      if (!noteTitle.trim() || !extractedText.trim()) {
        setError('Please provide a title and ensure text was extracted successfully.');
        return;
      }
  
      setIsSaving(true);
      setError('');
  
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/notes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: noteTitle.trim(),
            content: extractedText.trim(),
            subject: selectedFolder || '',
            course: selectedCourse || null
          })
        });
  
        if (!response.ok) {
          throw new Error('Failed to save note');
        }
  
        const savedNote = await response.json();
        onUploadComplete(savedNote);
  
        // Reset form
        setSelectedFile(null);
        setExtractedText('');
        setNoteTitle('');
        setSelectedFolder('');
        setSelectedCourse('');
        setUploadProgress(0);
        onClose();
      } catch (error) {
        console.error('Error saving note:', error);
        setError('Failed to save note. Please try again.');
      } finally {
        setIsSaving(false);
      }
    };
  
    const handleClose = () => {
      setSelectedFile(null);
      setExtractedText('');
      setNoteTitle('');
      setSelectedFolder('');
      setSelectedCourse('');
      setUploadProgress(0);
      setError('');
      onClose();
    };
  
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Upload Document</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
  
          {!selectedFile ? (
            /* File Selection */
            <div className="space-y-4">
              <div
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Upload your document
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Supports PDF, DOCX, TXT, and MD files (max 10MB)
                </p>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                  Select File
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt,.md"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>
          ) : (
            /* Text Extraction and Note Creation */
            <div className="space-y-4">
              {/* Upload Progress */}
              {isExtracting && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <ArrowPathIcon className="w-5 h-5 text-blue-600 animate-spin" />
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                      Extracting text from {selectedFile.name}...
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                    <div
                      className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
  
              {/* Extracted Text Preview */}
              {extractedText && (
                <div className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <DocumentTextIcon className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-green-800 dark:text-green-300">
                        Text extracted successfully! ({extractedText.length} characters)
                      </span>
                    </div>
                  </div>
  
                  {/* Note Configuration */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Note Title
                      </label>
                      <input
                        type="text"
                        value={noteTitle}
                        onChange={(e) => setNoteTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter note title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Folder (Optional)
                      </label>
                      <select
                        value={selectedFolder}
                        onChange={(e) => setSelectedFolder(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">No folder</option>
                        {folders.map((folder) => (
                          <option key={folder.id} value={folder.name}>{folder.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Course (Optional)
                    </label>
                    <select
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">No course</option>
                      {courses.map((course) => (
                        <option key={course._id} value={course._id}>{course.name}</option>
                      ))}
                    </select>
                  </div>
  
                  {/* Text Preview */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Preview (first 500 characters)
                    </label>
                    <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md p-3 max-h-32 overflow-y-auto">
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {extractedText.substring(0, 500)}{extractedText.length > 500 ? '...' : ''}
                      </p>
                    </div>
                  </div>
  
                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md p-3">
                      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                  )}
  
                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={handleClose}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveNote}
                      disabled={isSaving || !noteTitle.trim()}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSaving ? 'Saving...' : 'Save as Note'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleCopyNote = async () => {
    if (!selectedNote) return;

    try {
      // Strip HTML tags for plain text copy
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = selectedNote.content;
      const plainText = tempDiv.textContent || tempDiv.innerText || '';

      // Copy to clipboard
      await navigator.clipboard.writeText(plainText);
      setSuccess('Note copied to clipboard!');
    } catch (error) {
      console.error('Error copying note:', error);
      setError('Failed to copy note. Please try again.');
    }
  };

  const handleGenerateQuiz = (noteContent) => {
    // Navigate to Study page with note content for quiz generation
    window.location.href = `/app/study?noteContent=${encodeURIComponent(noteContent)}`;
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearchQuery = 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (note.subject?.toLowerCase() ?? '').includes(searchQuery.toLowerCase()) ||
      (note.course?.name?.toLowerCase() ?? '').includes(searchQuery.toLowerCase());

    const matchesSelectedCourse = selectedCourse ? note.course?._id === selectedCourse : true;

    return matchesSearchQuery && matchesSelectedCourse;
  });

  const handleHighlight = () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    if (text.length > 0 && selection.anchorNode.closest('.note-content')) {
      setHighlightedText(text);
      setAiExplanation(null);
      setIsExplanationModalOpen(true);
    } else if (isExplanationModalOpen) {
      setHighlightedText(null);
      setAiExplanation(null);
      setIsExplanationModalOpen(false);
      setIsAILoading(false);
    }
  };

  // Function to handle text selection for popup AI explain
  const handleTextSelection = (e) => {
    // Small delay for touch events to ensure selection is complete
    setTimeout(() => {
      const selection = window.getSelection();
      const text = selection && selection.toString().trim();
      if (text && text.trim().length > 0) {
        setSelectedText(text);
        // Get popup position near selection
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
  
          // For touch events, position the popup where it's easily tappable
          const isTouchEvent = e.type === 'touchend';
          explainPopupPosition.current = {
            x: rect.left + window.scrollX + rect.width / 2,
            y: rect.top + window.scrollY - (isTouchEvent ? 10 : 40) // closer to selection on mobile
          };
        }
        setShowExplainPopup(true);
      } else {
        setSelectedText('');
        setShowExplainPopup(false);
      }
    }, 50); // Small delay to ensure selection is complete
  };

  // Function to call AI explain endpoint for popup
  const handleAIExplain = async () => {
    if (!selectedText.trim()) return;
    setIsLoadingAIExplain(true);
    setAiExplanation('');
    setAiHint('');
    setShowFullExplanation(false);

    console.log('Calling AI explain with text:', selectedText.substring(0, 50) + '...');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      const apiUrl = `${backendUrl}/api/ai/explain`;

      console.log('Making request to:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          text: selectedText,
          noteContent: selectedNote?.content || ''
        })
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      setAiHint(data.hint || 'No hint available.');
      setAiExplanation(data.fullExplanation || 'No full explanation available.');
      setShowAIExplainModal(true);
      setShowExplainPopup(false); // Hide the popup button after showing modal
    } catch (err) {
      console.error('Error getting AI explanation:', err);
      setAiHint(`Failed to get hint: ${err.message}`);
      setAiExplanation(`Failed to get full explanation: ${err.message}`);
      setShowAIExplainModal(true);
      setShowExplainPopup(false); // Hide the popup button even on error
    } finally {
      setIsLoadingAIExplain(false);
    }
  };

  const requestAIExplanation = async () => {
    if (!highlightedText) return;

    setIsAILoading(true);
    setAiExplanation(null);
    setAiHint('');
    setShowFullExplanation(false);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          text: highlightedText,
          noteContent: selectedNote?.content || ''
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAiHint(data.hint || 'No hint available.');
      setAiExplanation(data.fullExplanation || 'No full explanation available.');
    } catch (error) {
      console.error('Error getting AI explanation:', error);
      setError('Failed to get AI explanation. Please try again.');
    } finally {
      setIsAILoading(false);
    }
  };

  const requestAISummary = async () => {
    if (!selectedNote) return;

    setIsSummaryLoading(true);
    setAiSummary(null);

    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
      const response = await fetch(`${baseUrl}/api/ai/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ text: selectedNote.content }),
        credentials: 'include',
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAiSummary(data.summary);
    } catch (error) {
      console.error('Error getting AI summary:', error);
      setError('Failed to get AI summary. Please try again.');
    } finally {
      setIsSummaryLoading(false);
    }
  };

  // Add useEffect for auto-dismissing success messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 3000); // Clear after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [success]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <ArrowPathIcon className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 lg:p-12 flex flex-col lg:flex-row gap-8 relative bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      {error && (
        <div className="fixed top-4 right-4 p-4 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-500 text-red-700 dark:text-red-300 rounded-lg shadow-md flex items-center justify-between z-50 max-w-md">
          <span className="block sm:inline">{error}</span>
          <button
            className="ml-4 text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100"
            onClick={() => setError(null)}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      <AddNoteModal
        isOpen={isAddNoteModalOpen}
        onClose={() => setIsAddNoteModalOpen(false)}
        onCreateNote={handleCreateNote}
        folders={folders}
        courses={courses}
      />

      <EditNoteMetadataModal
        isOpen={isEditMetadataModalOpen}
        onClose={() => setIsEditMetadataModalOpen(false)}
        onUpdateNote={handleUpdateNoteMetadata}
        note={noteToEditMetadata}
        folders={folders}
        courses={courses}
      />

      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadComplete={(newNote) => {
          setNotes(prevNotes => [newNote, ...prevNotes]);
          setSuccess('Document uploaded and note created successfully!');
          setTimeout(() => setSuccess(''), 3000);
        }}
        folders={folders}
        courses={courses}
      />

      {success && (
        <div className="fixed top-4 right-4 p-4 bg-green-100 dark:bg-green-900/20 border border-green-400 dark:border-green-500 text-green-700 dark:text-green-300 rounded-lg shadow-md flex items-center justify-between z-50 max-w-md">
          <span className="block sm:inline">{success}</span>
          <button
            className="ml-4 text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100"
            onClick={() => setSuccess(null)}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {!selectedNote ? (
        <div className="space-y-8 w-full">
          {/* Header and Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-4 sm:mb-0">My Notes</h1>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              {isMultiSelect && selectedNotes.length > 0 && (
                <>
                  <button
                    onClick={handleBulkDelete}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all shadow-md hover:shadow-lg flex items-center"
                  >
                    <TrashIcon className="w-5 h-5 mr-2" />
                    Delete Selected
                  </button>
                  <select
                    onChange={(e) => handleBulkMove(e.target.value)}
                    className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Move to folder...</option>
                    {folders.map(folder => (
                      <option key={folder.id} value={folder.name}>{folder.name}</option>
                    ))}
                  </select>
                </>
              )}

              <button
                onClick={() => setIsMultiSelect(!isMultiSelect)}
                className={`px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center ${
                  isMultiSelect ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {isMultiSelect ? 'Cancel' : 'Select Multiple'}
              </button>
              <button
                onClick={handleAddNoteClick}
                className="p-2 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                aria-label="Add Note"
              >
                <PlusIcon className="w-6 h-6" />
              </button>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="p-2 rounded-full bg-green-600 text-white shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
                aria-label="Upload Document"
                title="Upload PDF, DOCX, TXT, or MD file"
              >
                <CloudArrowUpIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="mb-6 w-full">
            <div className="relative">
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-indigo-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-sm"
              />
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>

          {/* TTS controls moved to Settings */}

          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 w-full">
            <div className="flex space-x-2 mb-4 sm:mb-0">
              <button
                onClick={() => handleSort('date')}
                className={`flex items-center px-3 py-1 rounded-lg shadow-sm ${sortBy === 'date' ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600'}`}
              >
                <ClockIcon className="w-4 h-4 mr-1" />
                Date
                {sortBy === 'date' && (
                  <ArrowsUpDownIcon className={`w-4 h-4 ml-1 ${sortOrder === 'asc' ? 'transform rotate-180' : ''}`} />
                )}
              </button>
              <button
                onClick={() => handleSort('title')}
                className={`flex items-center px-3 py-1 rounded-lg shadow-sm ${sortBy === 'title' ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600'}`}
              >
                Title
                {sortBy === 'title' && (
                  <ArrowsUpDownIcon className={`w-4 h-4 ml-1 ${sortOrder === 'asc' ? 'transform rotate-180' : ''}`} />
                )}
              </button>
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
              >
                <option value="">All Courses</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.name}
                  </option>
                ))}
              </select>
              <FunnelIcon className="h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Folders Section */}
          <div className="mb-8 w-full">
            <h2 className="text-xl font-semibold text-indigo-800 mb-4">Folders</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {folders.map((folder, index) => (
                <motion.div
                  key={folder.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedFolder(folder.name)}
                  className={`bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer border-2 ${selectedFolder === folder.name ? 'border-indigo-500' : 'border-transparent'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FolderIcon className={`w-6 h-6 ${folder.color} mr-2`} />
                      <span className="font-medium text-gray-800 dark:text-gray-200">{folder.name}</span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{folder.count} notes</span>
                  </div>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: folders.length * 0.1 }}
                onClick={() => setSelectedFolder(null)}
                className={`bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer border-2 ${selectedFolder === null ? 'border-indigo-500' : 'border-transparent'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FolderIcon className="w-6 h-6 text-gray-400 mr-2" />
                    <span className="font-medium text-gray-800 dark:text-gray-200">All Notes</span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{notes.length} notes</span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Notes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {filteredNotes.map((note, index) => (
              <div key={note._id} className="relative">
                {isMultiSelect && (
                  <input
                    type="checkbox"
                    checked={selectedNotes.includes(note._id)}
                    onChange={() => toggleNoteSelection(note._id)}
                    className="absolute top-4 right-4 z-10 w-5 h-5"
                  />
                )}
                <NoteCard
                  key={note._id}
                  note={note}
                  index={index}
                  onView={handleViewNote}
                  onEdit={handleEditNote}
                  onDelete={handleDeleteNote}
                  onAINoteCreated={handleAINoteCreated}
                  courses={courses}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
         <div
          className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 lg:p-6 border border-indigo-100 dark:border-gray-700 animate-fadeIn transition-all duration-300 ease-in-out max-w-full ${isEditingNote ? 'w-full h-full' : 'w-full h-full'} relative`}
          onClick={() => {
            // Clear popup when clicking outside
            setSelectedText('');
            setShowExplainPopup(false);
          }}
           >
          <div className="flex felx-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <button
              onClick={handleBackToList}
              className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Back to Notes"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <div className="flex space-x-2">
              <button
                onClick={() => handleCopyNote(selectedNote)}
                className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Copy Note"
                title="Copy note to clipboard"
              >
                <ClipboardIcon className="w-6 h-6" />
              </button>
              <button
                onClick={() => setIsRetrievalPracticeModalOpen(true)}
                className="p-2 rounded-full text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
                aria-label="Retrieval Practice"
                title="Quiz and Practice Exam options"
              >
                <AcademicCapIcon className="w-6 h-6" />
              </button>
              <button
                onClick={() => {
                  setNoteToEditMetadata(selectedNote);
                  setIsEditMetadataModalOpen(true);
                }}
                className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Edit Note Metadata"
                title="Edit title, folder, and course"
              >
                <TagIcon className="w-6 h-6" />
              </button>
              <button
                onClick={() => handleDeleteNote(selectedNote._id)}
                className="p-2 rounded-full text-red-600 hover:bg-red-200 transition-colors"
                aria-label="Delete Note"
              >
                <TrashIcon className="w-6 h-6" />
              </button>
              <AINoteProcessor 
                noteId={selectedNote._id} 
                onNoteProcessed={handleAINoteCreated}
                className="p-2 rounded-full text-blue-600 hover:bg-blue-200 transition-colors" 
                aria-label="AI Enhance"
              >
                <SparklesIcon className="w-6 h-6" />
              </AINoteProcessor>
            </div>
          </div>

          {!isEditingNote && (
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-4 leading-tight">{selectedNote.title}</h2>
          )}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mb-8 text-gray-500 dark:text-gray-400 text-sm">
            {selectedNote.subject && (
              <span className="flex items-center pr-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                <FolderIcon className="w-4 h-4 mr-1 ml-1" />
              {selectedNote.subject}
            </span>
            )}
            <span className="flex items-center">
              <ClockIcon className="w-4 h-4 mr-1" />
              {new Date(selectedNote.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            {selectedNote.course && selectedNote.course.name && (
               <span className="flex items-center">
                 <AcademicCapIcon className="w-4 h-4 mr-1" />
                 {selectedNote.course.name}
               </span>
             )}
             {selectedNote.tags && selectedNote.tags.length > 0 ? (
               <span className="flex items-center">
                 <TagIcon className="w-4 h-4 mr-1" />
                 {selectedNote.tags.join(', ')}
               </span>
             ) : null}
          </div>

          {!isEditingNote ? (
            <div
              className="note-content prose dark:prose-invert prose-sm max-w-none px-2 py-3 md:px-4 md:py-6 md:prose-lg mb-6 bg-white dark:bg-gray-700 rounded-lg shadow-sm text-gray-800 dark:text-gray-200 relative"
              onMouseUp={(e) => {
                e.stopPropagation();
                handleTextSelection(e);
              }}
              onKeyUp={(e) => {
                e.stopPropagation();
                handleTextSelection(e);
              }}
              onTouchEnd={(e) => {
                e.stopPropagation();
                handleTextSelection(e);
              }}
              dangerouslySetInnerHTML={{ __html: marked.parse(selectedNote.content) }}
            />
          ) : (
            <RichTextEditor
              content={editedNoteContent}
              onChange={setEditedNoteContent}
              placeholder="Start writing your note..."
              className="min-h-[300px] md:min-h-[400px] prose prose-sm max-w-none px-2 py-3 md:px-4 md:py-6 md:prose-lg"
            />
          )}

          {/* Floating Edit Button */}
          <div className="fixed bottom-6 right-6 z-50">
            {!isEditingNote ? (
              <button
                onClick={() => {
                  setEditedNoteContent(selectedNote.content);
                  setIsEditingNote(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
                aria-label="Edit Note Content"
                title="Edit note content"
              >
                <PencilIcon className="w-6 h-6" />
              </button>
            ) : (
              <button
                onClick={handleSaveEditedNote}
                className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
                aria-label="Save Note Content"
                title="Save note content"
              >
                <CheckCircleIcon className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Floating AI Explain Popup Button */}
          {showExplainPopup && typeof explainPopupPosition.current.x === 'number' && typeof explainPopupPosition.current.y === 'number' && (
            <div
              style={{
                position: 'absolute',
                left: explainPopupPosition.current.x,
                top: explainPopupPosition.current.y,
                zIndex: 1000,
                transform: 'translate(-50%, -100%)',
                pointerEvents: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAIExplain();
                }}
                className="px-4 py-3 bg-indigo-50 dark:bg-indigo-800 border-2 border-indigo-200 dark:border-indigo-700 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-700 transition-all duration-200 group flex items-center gap-3"
                disabled={isLoadingAIExplain}
              >
                <div className="p-2 bg-indigo-600 rounded-lg group-hover:bg-indigo-700 transition-colors">
                  <BookOpenIcon className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-indigo-800 dark:text-indigo-300">
                    {isLoadingAIExplain ? 'Explaining...' : 'AI Explain'}
                  </div>
                </div>
              </button>
            </div>
          )}

          <div className="flex space-x-2">
            <button
              onClick={() => requestAISummary(selectedNote.content)}
              disabled={isSummaryLoading}
              className="p-2 rounded-full text-green-600 hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={isSummaryLoading ? 'Summarizing...' : 'AI Summary'}
            >
              <DocumentTextIcon className="w-6 h-6" />
            </button>
            <button
              onClick={() => setIsAssessmentTrackerModalOpen(true)}
              className="p-2 rounded-full text-blue-600 hover:bg-blue-200 transition-colors"
              aria-label="Assessment Tracker"
              title="View quiz and practice exam history for this note"
            >
              <ChartBarIcon className="w-6 h-6" />
            </button>
            <button
              onClick={() => requestAIExplanation(highlightedText)}
              disabled={!highlightedText || isAILoading}
              className="p-2 rounded-full text-purple-600 hover:bg-purple-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={isAILoading ? 'Explaining...' : 'AI Explain'}
            >
              <LightBulbIcon className="w-6 h-6" />
            </button>
          </div>

          {aiSummary && (
            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200 text-gray-700 text-sm leading-relaxed">
              <h3 className="text-lg font-semibold text-indigo-800 mb-2">AI Summary</h3>
              <p>{aiSummary}</p>
            </div>
          )}
        </div>
      )}




      {/* AI Explanation Modal */}
      {isExplanationModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-indigo-800 dark:text-indigo-400">AI Explanation</h3>
              <button
                onClick={() => setIsExplanationModalOpen(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4">
              <p className="text-gray-600 italic">"{highlightedText}"</p>
            </div>
            {isAILoading ? (
              <div className="flex items-center justify-center py-4">
                <ArrowPathIcon className="w-6 h-6 animate-spin text-indigo-600" />
              </div>
            ) : aiHint ? (
              <div className="space-y-4">
                {/* Encouraging Header */}
                <div className="text-center py-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                    "Learning is a journey, not a destination. Let's explore this together! 🤝"
                  </p>
                </div>

                {/* Hint Section */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                  <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                    💡 Think about this...
                  </h4>
                  <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed">{aiHint}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 italic">
                    Does this spark any connections for you?
                  </p>
                </div>

                {/* Full Explanation Section */}
                {showFullExplanation ? (
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                    <h4 className="text-sm font-semibold text-green-800 dark:text-green-300 mb-2 flex items-center gap-2">
                      📚 Let's dive deeper...
                    </h4>
                    <div className="text-gray-800 dark:text-gray-200 text-sm whitespace-pre-line max-h-60 overflow-y-auto leading-relaxed">
                      {aiExplanation}
                    </div>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2 italic">
                      How does this fit with what you already know?
                    </p>
                  </div>
                ) : (
                  <div className="text-center space-y-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Ready for the complete picture?
                    </p>
                    <button
                      onClick={() => setShowFullExplanation(true)}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
                    >
                      <BookOpenIcon className="w-4 h-4" />
                      Show Full Explanation
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={requestAIExplanation}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg flex items-center"
              >
                <SparklesIcon className="w-5 h-5 mr-2" />
                Get AI Explanation
              </button>
            )}
          </div>
        </div>
      )}

      {/* AI Explain Modal for Popup */}
      {showAIExplainModal && (
        <AIExplainModalPopup
          aiHint={aiHint}
          aiExplanation={aiExplanation}
          showFullExplanation={showFullExplanation}
          setShowFullExplanation={setShowFullExplanation}
          isLoadingAIExplain={isLoadingAIExplain}
          onClose={() => setShowAIExplainModal(false)}
        />
      )}

      {/* Assessment Tracker Modal */}
      {isAssessmentTrackerModalOpen && (
        <AssessmentTrackerModal
          isOpen={isAssessmentTrackerModalOpen}
          onClose={() => setIsAssessmentTrackerModalOpen(false)}
          noteId={selectedNote?._id}
          noteTitle={selectedNote?.title}
        />
      )}

      {/* Retrieval Practice Modal */}
      {isRetrievalPracticeModalOpen && (
        <RetrievalPracticeModal
          onClose={() => setIsRetrievalPracticeModalOpen(false)}
            onSelectQuiz={() => {
            navigate('/app/active-learning', { state: { selectedNotes: [selectedNote], mode: 'note-based' } });
            setIsRetrievalPracticeModalOpen(false);
          }}
            onSelectPracticeExam={() => {
            navigate('/app/practice-exam', { state: { selectedNotes: [selectedNote], mode: 'note-based', autoStart: 'notes-quick' } });
            setIsRetrievalPracticeModalOpen(false);
          }}
        />
      )}

    </div>
  );
}

// AI Explain Modal Component for Popup
const AIExplainModalPopup = ({ aiHint, aiExplanation, showFullExplanation, setShowFullExplanation, isLoadingAIExplain, onClose }) => {
  const [countdown, setCountdown] = React.useState(20);
  const [canShowFullExplanation, setCanShowFullExplanation] = React.useState(false);

  // Start countdown when hint is available and full explanation is not yet unlocked
  useEffect(() => {
    if (aiHint && !canShowFullExplanation) {
      setCountdown(20);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setCanShowFullExplanation(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [aiHint, canShowFullExplanation]);

  // Reset countdown state when modal closes
  useEffect(() => {
    if (!aiHint) {
      setCountdown(20);
      setCanShowFullExplanation(false);
    }
  }, [aiHint]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 dark:bg-black dark:bg-opacity-60">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl dark:shadow-gray-900/50 p-8 max-w-lg w-full relative animate-fadeIn border border-gray-200 dark:border-gray-700">
        <button
          className="absolute top-3 right-3 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          onClick={onClose}
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold mb-4 text-indigo-700 dark:text-indigo-400">AI Explanation</h2>
        {isLoadingAIExplain ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Getting explanation...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Subtle Countdown Timer - shows when hint is available but full explanation is locked */}
            {aiHint && !canShowFullExplanation && (
              <div className="flex justify-end items-center space-x-2 text-xs text-yellow-600 dark:text-yellow-400 mb-2">
                <span>Full explanation in {countdown}s</span>
                <div className="w-16 bg-yellow-200 dark:bg-yellow-800 rounded-full h-1">
                  <div
                    className="bg-yellow-500 dark:bg-yellow-400 h-1 rounded-full transition-all duration-1000 ease-linear"
                    style={{ width: `${((20 - countdown) / 20) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Main content area - clickable to toggle when unlocked */}
            <div
              className={`p-4 rounded-lg border transition-colors ${
                showFullExplanation
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/30'
                  : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30'
              } ${!canShowFullExplanation && aiHint ? 'opacity-60' : 'cursor-pointer'}`}
              onClick={() => {
                // Only allow toggle if countdown is complete
                if (canShowFullExplanation) {
                  setShowFullExplanation(!showFullExplanation);
                }
              }}
              role={!canShowFullExplanation && aiHint ? "button" : "button"}
              tabIndex={!canShowFullExplanation && aiHint ? -1 : 0}
              aria-disabled={!canShowFullExplanation && aiHint}
            >
              {showFullExplanation ? (
                /* Full Explanation Section */
                <>
                  <h3 className="text-sm font-semibold text-green-800 dark:text-green-300 mb-2 flex items-center gap-2">
                    📚 Let's dive deeper...
                    <span className="text-xs text-green-600 dark:text-green-400 ml-auto">
                      ▲ Click anywhere to go back
                    </span>
                  </h3>
                  <div className="prose max-w-none text-gray-800 dark:text-gray-200 whitespace-pre-line overflow-y-auto text-sm leading-relaxed" style={{maxHeight: '40vh'}}>
                    {aiExplanation}
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2 italic">
                    How does this fit with what you already know?
                  </p>
                </>
              ) : (
                /* Hint Section */
                <>
                  <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                    💡 Think about this...
                    <span className="text-xs text-blue-600 dark:text-blue-400 ml-auto">
                      {canShowFullExplanation ? '▶ Click anywhere for full explanation' : '⏳ Full explanation coming soon...'}
                    </span>
                  </h3>
                  <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed">{aiHint}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 italic">
                    Does this spark any connections for you?
                  </p>
                </>
              )}
            </div>

            {/* Unlock message when countdown completes */}
            {canShowFullExplanation && aiHint && !showFullExplanation && (
              <div className="text-center">
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  ✅ Full explanation is now available!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Retrieval Practice Modal Component
const RetrievalPracticeModal = ({ onClose, onSelectQuiz, onSelectPracticeExam }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 dark:bg-black dark:bg-opacity-60">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl dark:shadow-gray-900/50 p-8 max-w-md w-full relative border border-gray-200 dark:border-gray-700"
      >
        <button
          className="absolute top-3 right-3 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          onClick={onClose}
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold mb-6 text-indigo-700 dark:text-indigo-400 text-center">Retrieval Practice</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center">
          Strengthen your memory through active recall
        </p>

        <div className="space-y-4">
          <button
            onClick={onSelectQuiz}
            className="w-full p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg group-hover:bg-blue-600 transition-colors">
                <AcademicCapIcon className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-blue-800 dark:text-blue-300">Take Quiz</h3>
                <p className="text-sm text-blue-600 dark:text-blue-400">Quick questions to test your knowledge</p>
              </div>
            </div>
          </button>

          <button
            onClick={onSelectPracticeExam}
            className="w-full p-4 bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-700 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500 rounded-lg group-hover:bg-purple-600 transition-colors">
                <DocumentTextIcon className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-purple-800 dark:text-purple-300">Practice Exam</h3>
                <p className="text-sm text-purple-600 dark:text-purple-400">Full-length exam simulation</p>
              </div>
            </div>
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Both options use AI to create personalized questions from your notes
          </p>
        </div>
      </motion.div>
    </div>
  );
};
