import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/index'; 
import { useAuth } from '../context/AuthContext'; // Import useAuth

import { Plus, Users, ArrowRight } from 'lucide-react';

const SyncSpaces = () => {
  const [spaces, setSpaces] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [spaceName, setSpaceName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated, authLoading } = useAuth(); // Use auth context

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchSpaces();
    }
  }, [isAuthenticated, authLoading]);

  const fetchSpaces = async () => {
    try {
      const response = await api.get('/sync-spaces');
      setSpaces(response.data);
    } catch (error) {
      console.error('Error fetching sync spaces:', error);
    }
  };

  const handleCreateSpace = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/sync-spaces', { name: spaceName });
      setSpaces([...spaces, response.data]);
      setShowCreateModal(false);
      setSpaceName('');
      navigate(`/app/sync-space/${response.data._id}`);
    } catch (error) {
      console.error('Error creating sync space:', error);
    }
  };

  const handleJoinSpace = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/sync-spaces/join', { joinCode });
      setSpaces([...spaces, response.data]);
      setShowJoinModal(false);
      setJoinCode('');
      navigate(`/app/sync-space/${response.data._id}`);
    } catch (error) {
      console.error('Error joining sync space:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Sync Spaces</h1>
        <div className="space-x-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg shadow-sm hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-blue-500 transition-colors duration-200"
          >
            <Plus size={20} className="-ml-1 mr-2" />
            Create Space
          </button>
          <button
            onClick={() => { setShowJoinModal(true); setError(null); }}
            className="inline-flex items-center px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg shadow-sm hover:bg-green-700 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-green-500 transition-colors duration-200"
          >
            <Users size={20} className="-ml-1 mr-2" />
            Join Space
          </button>
        </div>
      </div>

      {/* Spaces Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {spaces.map((space) => (
          <div
            key={space._id}
            onClick={() => navigate(`/app/sync-space/${space._id}`)}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/20 overflow-hidden transform hover:-translate-y-1 transition-all duration-300 cursor-pointer group border border-gray-200 dark:border-gray-700"
          >
            <div className="p-5">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{space.name}</h3>
              <div className="flex items-center text-gray-500 dark:text-gray-400 mt-2">
                <Users size={16} className="mr-2" />
                <span>{space.members.length} members</span>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3 flex justify-between items-center">
              <span className="text-xs font-mono bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">{space.joinCode}</span>
              <ArrowRight size={20} className="text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-transform duration-300 transform group-hover:translate-x-1" />
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-black dark:bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl dark:shadow-gray-900/50 w-full max-w-md border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Create New Space</h2>
            <form onSubmit={handleCreateSpace}>
              <input
                type="text"
                value={spaceName}
                onChange={(e) => setSpaceName(e.target.value)}
                placeholder="E.g., 'Quantum Physics Study Group'"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow mb-4 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                required
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-blue-500 transition-colors duration-200"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96 border border-gray-200 dark:border-gray-700 shadow-xl dark:shadow-gray-900/50">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Join Space</h2>
            <form onSubmit={handleJoinSpace}>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="Enter join code"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow mb-2 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                required
              />
              {error && <p className="text-red-500 dark:text-red-400 text-sm mb-4">{error}</p>}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => { setShowJoinModal(false); setError(null); }}
                  className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                >
                  Join
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SyncSpaces;