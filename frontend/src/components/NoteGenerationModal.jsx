import { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';

export default function NoteGenerationModal({ isOpen, onClose, onNoteGenerated }) {
  const [method, setMethod] = useState('by-course'); // 'by-course' or 'by-input'
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [manualTopic, setManualTopic] = useState('');
  const [manualDescription, setManualDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCourses();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedCourse) {
      const course = courses.find(c => c._id === selectedCourse);
      setTopics(course?.topics || []);
    }
  }, [selectedCourse]);

  const loadCourses = async () => {
    try {
      const data = await apiRequest('/courses');
      setCourses(data);
    } catch (error) {
      console.error('Failed to load courses:', error);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      if (method === 'by-course') {
        const data = await apiRequest('/note-generation/by-course', {
          method: 'POST',
          body: JSON.stringify({
            courseId: selectedCourse,
            topicName: selectedTopic
          })
        });
        onNoteGenerated(data.note);
      } else {
        const data = await apiRequest('/note-generation/by-input', {
          method: 'POST',
          body: JSON.stringify({
            topicName: manualTopic,
            description: manualDescription,
            courseId: selectedCourse
          })
        });
        onNoteGenerated(data.note);
      }
      onClose();
    } catch (error) {
      console.error('Note generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Generate Study Notes</h2>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMethod('by-course')}
            className={`flex-1 py-2 rounded ${
              method === 'by-course'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-600'
            }`}
          >
            By Course/Topic
          </button>
          <button
            onClick={() => setMethod('by-input')}
            className={`flex-1 py-2 rounded ${
              method === 'by-input'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-600'
            }`}
          >
            By Input
          </button>
        </div>

        {method === 'by-course' ? (
          <>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full mb-3 p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">Select Course</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>{course.name}</option>
              ))}
            </select>

            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full mb-4 p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              disabled={!selectedCourse}
            >
              <option value="">Select Topic</option>
              {topics.map(topic => (
                <option key={topic.name} value={topic.name}>{topic.name}</option>
              ))}
            </select>
          </>
        ) : (
          <>
            <input
              value={manualTopic}
              onChange={(e) => setManualTopic(e.target.value)}
              placeholder="Topic Name"
              className="w-full mb-3 p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
            <textarea
              value={manualDescription}
              onChange={(e) => setManualDescription(e.target.value)}
              placeholder="What do you want to learn about this topic?"
              className="w-full mb-3 p-2 border rounded h-24 dark:bg-gray-700 dark:border-gray-600"
            />
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full mb-4 p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">Save to Course</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>{course.name}</option>
              ))}
            </select>
          </>
        )}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 border rounded dark:border-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={
              loading ||
              (method === 'by-course' && !selectedTopic) ||
              (method === 'by-input' && !manualTopic)
            }
            className="flex-1 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>
    </div>
  );
}