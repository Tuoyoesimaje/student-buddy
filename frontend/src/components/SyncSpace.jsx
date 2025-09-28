import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
// Remove socket.io-client import since we're using the socket from context
import { Users, ClipboardList, Plus, CheckCircle, Clock, AlertCircle, X, MessageCircle, ChevronRight, ChevronLeft, Search } from 'lucide-react';
import MemberCard from './MemberCard';
import ChatSidebar from './ChatSidebar';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const SyncSpace = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket(); // Add this line to get socket from context
  const [syncSpace, setSyncSpace] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sharedTasks, setSharedTasks] = useState([]);
  const [sharedNotes, setSharedNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: '' });
  const [taskError, setTaskError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [memberStats, setMemberStats] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleNotes, setVisibleNotes] = useState(3);
  const [visibleActiveTasks, setVisibleActiveTasks] = useState(3);
  const [visibleCompletedTasks, setVisibleCompletedTasks] = useState(3);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isAssigning, setIsAssigning] = useState(false);

  const fetchSyncSpace = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/sync-spaces/${id}`);
      setSyncSpace(response.data);

      const processedMessages = response.data.chat.map(msg => {
        const isCurrentUser = msg.sender && msg.sender._id === user?.id;
        return {
          ...msg,
          sender: isCurrentUser ? 'currentUser' : msg.sender,
          username: isCurrentUser ? 'You' : (msg.sender ? msg.sender.username : 'Unknown User')
        };
      });

      setMessages(processedMessages);
      setSharedTasks(response.data.sharedTasks || []);
      setSharedNotes(response.data.sharedNotes || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching sync space', error);
      setError('Failed to load sync space data. Please try again.');
      setIsLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    if (user) {
      fetchSyncSpace();
    }
  }, [id, user]);
  
  // Calculate member stats whenever sharedTasks or syncSpace.members change
  useEffect(() => {
    if (!syncSpace || !sharedTasks) return;

    const newMemberStats = {};
    syncSpace.members.forEach(member => {
      // Handle both old and new member structures
      const memberId = member.user ? member.user._id : member._id || member;
      const memberData = member.user ? member : { role: 'participant', contributions: {} };

      newMemberStats[memberId] = {
        totalTasks: sharedTasks.length,
        completedTasks: sharedTasks.filter(task =>
          task.completedBy && task.completedBy.includes(memberId)
        ).length,
        role: memberData.role || 'participant',
        contributions: memberData.contributions || {
          tasksCompleted: 0,
          notesShared: 0,
          messagesSent: 0,
          peersHelped: 0,
          learningActivities: 0,
        },
        lastActive: memberData.lastActive,
        learningGoals: memberData.learningGoals,
        studyPreferences: memberData.studyPreferences
      };
    });
    setMemberStats(newMemberStats);
  }, [sharedTasks, syncSpace]);

  // Initialize Socket.IO connection
  // Handle window resize for responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      // Only auto-hide chat on mobile when resizing to mobile view
      // but NOT when the keyboard appears (which can trigger resize events)
      if (window.innerWidth < 768 && window.visualViewport && 
          Math.abs(window.innerHeight - window.visualViewport.height) < 100) {
        setShowChat(false);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleImportNote = async (sharedNoteId) => {
    try {
      await socket.emit('importNote', { sharedNoteId, spaceId: id });
      toast.success('Note added to your notes successfully!');
      // Refetch to update member contributions
      fetchSyncSpace();
    } catch (error) {
      console.error('Error importing note:', error);
      toast.error('Failed to add note to your notes.');
    }
  };

  useEffect(() => {
    if (!user || !id || !socket) return;
    
    console.log('Socket connection initialized');
    
    // Join the sync space room
    socket.emit('joinSyncSpace', id);
    
    // Set up event listeners
    const onNewMessage = (message) => {
      console.log('New message received:', message);
      const senderId = message.sender._id || message.sender;
      const isCurrentUser = message.sender._id === user?.id;
      const processedMessage = {
        ...message,
        sender: isCurrentUser ? 'currentUser' : message.sender,
        username: isCurrentUser ? 'You' : message.sender.username
      };
      setMessages((prevMessages) => [...prevMessages, processedMessage]);
    };
    
    const onNewTask = ({ task, systemMessage }) => {
      console.log('New task received:', task);
      // Add task to the shared tasks list and show system message
      setSharedTasks(prev => [...prev, task]);
      setMessages((prevMessages) => [...prevMessages, systemMessage]);


    };
    
    const onTaskCompleted = ({ taskId, task, systemMessage }) => {
      console.log('Task completed:', taskId, task);
      // Update task status and show system message
      setSharedTasks(prev =>
        prev.map(t => t._id === taskId ? { ...t, ...task } : t)
      );
      setMessages((prevMessages) => [...prevMessages, systemMessage]);

      // Refetch sync space data to update member contributions
      fetchSyncSpace();
    };
    
    const onTaskError = ({ message }) => {
      console.error('Task error:', message);
      setTaskError(message);
      setIsSubmitting(false);
    };
    
    // Register event listeners
    socket.on('newMessage', onNewMessage);
    socket.on('newTask', onNewTask);
    socket.on('taskCompleted', onTaskCompleted);
    socket.on('taskError', onTaskError);

    const onNoteShared = (note) => {
      setSharedNotes(prev => [...prev, note]);
      // Refresh member contribution data since notes shared count was updated
      fetchSyncSpace();
    };

    const onNoteAdded = ({ username, noteTitle, noteId }) => {
      // Find the shared note and update its addedBy array
      // This is a simplified update. A more robust solution would involve fetching the updated note from the backend
      setSharedNotes(prev => prev.map(note => {
        if (note.originalNoteId === noteId) {
          return { ...note, addedBy: [...(note.addedBy || []), user.id] };
        }
        return note;
      }));
    };

    socket.on('noteShared', onNoteShared);
    socket.on('noteAdded', onNoteAdded);

    const onTaskAssigned = ({ taskId, assignments, systemMessage }) => {
      console.log('Task assigned:', taskId, assignments);
      // Update task with assignments and show system message
      setSharedTasks(prev =>
        prev.map(t => t._id === taskId ? { ...t, assignedTo: assignments } : t)
      );
      setMessages((prevMessages) => [...prevMessages, systemMessage]);
      // Refetch to update member contributions
      fetchSyncSpace();
    };

    const onTaskProgressUpdated = ({ taskId, progress }) => {
      console.log('Task progress updated:', taskId, progress);
      // Update task progress
      setSharedTasks(prev =>
        prev.map(t => t._id === taskId ? { ...t, progress } : t)
      );
      // Refetch to update member contributions
      fetchSyncSpace();
    };

    socket.on('taskAssigned', onTaskAssigned);
    socket.on('taskProgressUpdated', onTaskProgressUpdated);
    socket.on('noteAdded', onNoteAdded);
    
    // Cleanup function
    return () => {
      console.log('Cleaning up socket connection');
      if (socket) {
        // Remove event listeners
        socket.off('newMessage', onNewMessage);
        socket.off('newTask', onNewTask);
        socket.off('taskCompleted', onTaskCompleted);
        socket.off('taskError', onTaskError);
        socket.off('noteShared', onNoteShared);
        socket.off('noteAdded', onNoteAdded);
        socket.off('taskAssigned', onTaskAssigned);
        socket.off('taskProgressUpdated', onTaskProgressUpdated);
        
        // Leave the sync space room
        socket.emit('leaveSyncSpace', id);
      }
    };
  }, [id, user, socket, fetchSyncSpace]);
  
  const handleCreateTask = (e) => {
    e.preventDefault();
    setTaskError('');
    setIsSubmitting(true);
    
    // Validate form
    if (!newTask.title.trim()) {
      setTaskError('Task title is required');
      setIsSubmitting(false);
      return;
    }
    
    if (!newTask.dueDate) {
      setTaskError('Due date is required');
      setIsSubmitting(false);
      return;
    }
    
    // Emit socket event to create task
    socket.emit('createTask', {
      spaceId: id,
      task: {
        title: newTask.title,
        description: newTask.description,
        startTime: new Date(newTask.dueDate), // Corrected field
        status: 'in-progress'
      }
    });
    
    // Reset form and close modal
    setNewTask({ title: '', description: '', dueDate: '' });
    setShowTaskModal(false);
    setIsSubmitting(false);
  };
  
  const resetTaskForm = () => {
    setNewTask({ title: '', description: '', dueDate: '' });
    setTaskError('');
    setShowTaskModal(false);
  };

  const handleAssignTask = async () => {
    if (!selectedTask || selectedMembers.length === 0) return;

    setIsAssigning(true);
    try {
      socket.emit('assignTask', {
        spaceId: id,
        taskId: selectedTask._id,
        memberIds: selectedMembers
      });

      setShowAssignModal(false);
      setSelectedTask(null);
      setSelectedMembers([]);
      toast.success('Task assigned successfully!');
    } catch (error) {
      console.error('Error assigning task:', error);
      toast.error('Failed to assign task');
    } finally {
      setIsAssigning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="w-8 h-8 border-4 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-red-500 dark:text-red-400 flex items-center">
          <AlertCircle className="mr-2" />
          {error}
        </div>
      </div>
    );
  }

  if (!syncSpace) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-500 dark:text-gray-400">Sync space not found</div>
      </div>
    );
  }

  const toggleChat = () => {
    // Don't close the chat if the keyboard is visible
    if (document.body.classList.contains('keyboard-visible') && showChat) {
      return; // Prevent closing chat when keyboard is visible
    }
    setShowChat(!showChat);
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 relative transition-colors duration-200">
      <div className={`flex-1 flex flex-col overflow-hidden ${isMobile && showChat ? 'hidden md:flex' : ''}`}>
        <header className="bg-white dark:bg-gray-800 shadow-sm p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{syncSpace.name}</h1>
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Join Code: <span className="font-mono bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">{syncSpace.joinCode}</span>
            </div>
            <button
              onClick={toggleChat}
              className="md:flex items-center justify-center p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 hidden transition-colors duration-200"
              aria-label={showChat ? 'Hide chat' : 'Show chat'}
            >
              {showChat ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>
        </header>
        
        {/* Task Assignment Modal */}
        {showAssignModal && selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Assign Task</h3>
                <button
                  onClick={() => { setShowAssignModal(false); setSelectedTask(null); setSelectedMembers([]); }}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-900 dark:text-white">{selectedTask.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedTask.description}</p>
              </div>

              <div className="mb-4">
                <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>How Task Assignment Works:</strong><br />
                    • Assign specific learning tasks to group members<br />
                    • Members get notified and can track their assigned work<br />
                    • Facilitators and Peer Mentors can assign tasks to promote balanced participation
                  </p>
                </div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Members to Assign:
                </label>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {syncSpace.members.map((member) => {
                    // Handle both old and new member structures
                    const memberId = member.user ? member.user._id : member._id || member;
                    const username = member.user ? member.user.username : 'Unknown User';
                    const role = member.role || 'participant';

                    return (
                      <label key={memberId} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(memberId)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMembers([...selectedMembers, memberId]);
                            } else {
                              setSelectedMembers(selectedMembers.filter(id => id !== memberId));
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-900 dark:text-white">{username}</span>
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">({role})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => { setShowAssignModal(false); setSelectedTask(null); setSelectedMembers([]); }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignTask}
                  disabled={selectedMembers.length === 0 || isAssigning}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isAssigning ? 'Assigning...' : 'Assign Task'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Task Creation Modal */}
        {/* Task Creation Modal */}
        {showTaskModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Create New Task</h3>
                <button
                  onClick={resetTaskForm}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X size={20} />
                </button>
              </div>
              
              {taskError && (
                <div className="mb-4 p-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded">
                  {taskError}
                </div>
              )}

              <form onSubmit={handleCreateTask}>
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="title">
                    Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    placeholder="Task title"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="description">
                    Description
                  </label>
                  <textarea
                    id="description"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    placeholder="Task description"
                    rows="3"
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="dueDate">
                    Due Date
                  </label>
                  <input
                    id="dueDate"
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={resetTaskForm}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating...' : 'Create Task'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <section id="members">
            <div className="flex items-center mb-4">
              <Users className="mr-3 text-gray-600 dark:text-gray-400" size={24} />
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Members ({syncSpace.members.length})</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {syncSpace.members.map((member) => {
                // Handle both old and new member structures
                const memberId = member.user ? member.user._id : member._id || member;
                const memberData = member.user ? member : {};
                const userData = member.user || member;

                return (
                  <MemberCard
                    key={memberId}
                    member={{
                      ...userData,
                      ...memberData,
                      ...memberStats[memberId],
                    }}
                    syncSpaceId={id}
                    currentUserRole={'facilitator'} // User has access to space, so facilitator privileges
                    syncSpace={syncSpace} // Pass full syncSpace for creator check
                  />
                );
              })}
            </div>
          </section>
          <section id="shared-notes" className="mt-10">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <ClipboardList className="mr-3 text-gray-600 dark:text-gray-400" size={24} />
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Shared Notes</h2>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search notes..."
                  className="pl-10 pr-4 py-2 w-full bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              {sharedNotes && sharedNotes.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sharedNotes
                      .filter(note => note.title.toLowerCase().includes(searchTerm.toLowerCase()))
                      .slice(0, visibleNotes)
                      .map(note => (
                        <div key={note._id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{note.title}</h4>
                          {note.course && <p className="text-sm text-gray-500 dark:text-gray-400">{note.course.name}</p>}
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Shared by: {note.sharedBy.username}</p>
                          <div className="mt-4">
                            {note.addedBy && note.addedBy.includes(user.id) ? (
                              <span className="text-sm text-green-600 flex items-center">
                                <CheckCircle size={16} className="mr-1" /> Added
                              </span>
                            ) : (
                              <button
                                onClick={() => handleImportNote(note._id)}
                                className="w-full text-sm bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center"
                              >
                                <Plus size={16} className="mr-1" /> Add to My Notes
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                  {sharedNotes.filter(note => note.title.toLowerCase().includes(searchTerm.toLowerCase())).length > 3 && (
                    <div className="mt-6 text-center">
                      <button
                        onClick={() => setVisibleNotes(prev => (prev === 3 ? sharedNotes.length : 3))}
                        className="text-blue-500 hover:underline"
                      >
                        {visibleNotes === 3 ? 'Show More' : 'Show Less'}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <ClipboardList size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No shared notes yet</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Share a note from your notes page to get started</p>
                </div>
              )}
            </div>
          </section>

          <section id="shared-tasks" className="mt-10">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <ClipboardList className="mr-3 text-gray-600 dark:text-gray-400" size={24} />
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Shared Tasks</h2>
              </div>
              <button 
                onClick={() => setShowTaskModal(true)}
                className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus size={18} className="-ml-1 mr-1.5" />
                Add Task
              </button>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              {sharedTasks && sharedTasks.length > 0 ? (
                <div>
                  {/* Active Tasks */}
                  <div className="space-y-4 mb-6">
                    <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Active Tasks</h3>
                    {sharedTasks
                      .filter(task => !task.completed && task.status !== 'completed')
                      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort by most recent first
                      .slice(0, visibleActiveTasks)
                      .map((task) => (
                        <div key={task._id} className={`border-l-4 pl-4 py-2 ${
                          task.assignedTo && task.assignedTo.some(assignment => assignment.user === user.id)
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/10'
                            : 'border-blue-500'
                        }`}>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{task.title}</h3>
                                {task.assignedTo && task.assignedTo.some(assignment => assignment.user === user.id) && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200">
                                    Assigned to you
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-600 dark:text-gray-300 text-sm">{task.description}</p>
                              {task.assignedTo && task.assignedTo.length > 0 && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  Assigned to: {task.assignedTo.map(assignment => {
                                    const member = syncSpace.members.find(m => m.user === assignment.user);
                                    return member ? member.username || 'Unknown' : 'Unknown';
                                  }).join(', ')}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center ml-4">
                              {task.completedBy && task.completedBy.includes(user.id) ? (
                                <span className="text-green-500 flex items-center text-sm">
                                  <CheckCircle size={16} className="mr-1" /> Completed by you
                                </span>
                              ) : (
                                <span className="text-yellow-500 flex items-center text-sm">
                                  <Clock size={16} className="mr-1" /> In Progress
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex justify-between items-center mt-3">
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Due: {new Date(task.startTime).toLocaleDateString()}
                            </div>
                            <div className="flex space-x-2">
                              {/* Only show assign button for facilitators and peer-mentors */}
                              {syncSpace.members.find(m => m.user === user.id)?.role === 'facilitator' ||
                               syncSpace.members.find(m => m.user === user.id)?.role === 'peer-mentor' ? (
                                <button
                                  className="text-xs bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-800 text-purple-800 dark:text-purple-200 px-2 py-1 rounded"
                                  onClick={() => {
                                    setSelectedTask(task);
                                    setShowAssignModal(true);
                                  }}
                                  title="Assign this task to group members (Facilitators & Peer Mentors only)"
                                >
                                  Assign
                                </button>
                              ) : null}
                              <button
                                className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-2 py-1 rounded"
                                onClick={() => {
                                  // Handle task completion
                                  socket.emit('completeTask', { spaceId: id, taskId: task._id, userId: user.id });
                                }}
                                disabled={task.status === 'completed'}
                              >
                                {task.status === 'completed' ? 'Completed' : 'Mark Complete'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {sharedTasks.filter(task => !task.completed && task.status !== 'completed').length > 3 && (
                        <div className="mt-4 text-center">
                          <button
                            onClick={() => setVisibleActiveTasks(prev => (prev === 3 ? sharedTasks.length : 3))}
                            className="text-blue-500 hover:underline"
                          >
                            {visibleActiveTasks === 3 ? 'Show More' : 'Show Less'}
                          </button>
                        </div>
                      )}
                  </div>
                  
                  {/* Completed Tasks Section */}
                  <div className="mt-8 border-t pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-700 dark:text-gray-300">Completed Tasks</h3>
                      <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-full">
                        {sharedTasks.filter(task => task.completed || task.status === 'completed').length} completed
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      {sharedTasks
                        .filter(task => task.completed || task.status === 'completed')
                        .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt)) // Sort by most recent first
                        .slice(0, visibleCompletedTasks)
                        .map((task) => (
                          <div key={task._id} className="border-l-4 border-green-500 pl-4 py-2 bg-gray-50 dark:bg-gray-700">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium text-gray-700 dark:text-gray-300 line-through">{task.title}</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{task.description}</p>
                              </div>
                              <div className="flex items-center">
                                <span className="text-green-500 flex items-center text-sm">
                                  <CheckCircle size={16} className="mr-1" /> Completed
                                </span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Due: {new Date(task.startTime).toLocaleDateString()}
                              </div>
                              {task.completedBy && task.completedBy.length > 0 && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Completed by: {task.completedBy.includes(user.id) ? 'You' : 'Team member'}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        {sharedTasks.filter(task => task.completed || task.status === 'completed').length > 3 && (
                        <div className="mt-4 text-center">
                          <button
                            onClick={() => setVisibleCompletedTasks(prev => (prev === 3 ? sharedTasks.length : 3))}
                            className="text-blue-500 hover:underline"
                          >
                            {visibleCompletedTasks === 3 ? 'Show More' : 'Show Less'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <ClipboardList size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No shared tasks yet</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Create a task to collaborate with your team</p>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
      {/* Mobile chat toggle button */}
      {isMobile && !showChat && (
        <button
          onClick={toggleChat}
          className="fixed bottom-4 right-4 z-10 flex items-center justify-center p-3 rounded-full bg-blue-600 text-white shadow-lg md:hidden"
          aria-label="Open chat"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat sidebar with conditional rendering based on showChat state */}
      {(showChat || (isMobile && showChat)) && (
        <div className={`${isMobile ? 'fixed inset-0 z-20 flex justify-end' : ''}`}>
          <ChatSidebar 
            messages={messages} 
            onSendMessage={(message) => {
              return new Promise((resolve, reject) => {
                try {
                  socket.emit('sendMessage', { spaceId: id, message: message });
                  resolve();
                } catch (error) {
                  console.error('Error sending message:', error);
                  reject(error);
                }
              });
            }}
            onClose={isMobile ? toggleChat : null}
          />
        </div>
      )}
    </div>
  );
};

export default SyncSpace;