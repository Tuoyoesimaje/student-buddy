import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { apiRequest } from '../services/api';

export default function CourseTopicsManager({ courseId }) {
  const [topics, setTopics] = useState([]);
  const [newTopic, setNewTopic] = useState({
    name: '',
    description: '',
    keyConcepts: '',
    challenges: '',
    studentNotes: ''
  });

  useEffect(() => {
    if (courseId) {
      loadTopics();
    }
  }, [courseId]);

  const loadTopics = async () => {
    try {
      // Use the detailed endpoint on the backend which returns topics and counts
      const data = await apiRequest(`/courses/${courseId}/details`);
      // The backend returns course details; topics may be present under `topics` or `topicsCount`.
      // If topics are not returned, fall back to an empty array.
      setTopics(data.topics || []);
    } catch (error) {
      console.error('Failed to load topics:', error);
    }
  };

  const handleAddTopic = () => {
    if (!newTopic.name.trim()) return;

    const topicToAdd = {
      ...newTopic,
      keyConcepts: newTopic.keyConcepts.split(',').map(k => k.trim()).filter(k => k)
    };

    setTopics([...topics, topicToAdd]);
    setNewTopic({ name: '', description: '', keyConcepts: '', challenges: '', studentNotes: '' });
  };

  const handleRemoveTopic = (index) => {
    setTopics(topics.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      await apiRequest(`/courses/${courseId}/topics`, {
        method: 'PUT',
        body: JSON.stringify({ topics })
      });
      alert('Topics saved successfully');
    } catch (error) {
      console.error('Failed to save topics:', error);
      alert('Failed to save topics');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Course Topics</h3>
          <div className="text-sm text-gray-500">{topics.length} saved</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topics.map((topic, index) => (
            <div key={index} className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{topic.name}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{topic.description}</p>
                  {topic.keyConcepts && topic.keyConcepts.length > 0 && (
                    <div className="mt-2 text-xs">
                      <span className="text-xs font-medium text-gray-500">Key: </span>
                      <span className="text-xs text-gray-600 dark:text-gray-300">{topic.keyConcepts.join(', ')}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveTopic(index)}
                  className="text-red-500 hover:text-red-700 ml-2"
                  title="Remove topic"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Save All Topics
          </button>
        </div>
      </div>

      <div>
        <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
          <h4 className="font-medium mb-3">Add New Topic</h4>
          <input
            value={newTopic.name}
            onChange={(e) => setNewTopic({...newTopic, name: e.target.value})}
            placeholder="Topic Name"
            className="w-full mb-2 p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          />
          <textarea
            value={newTopic.description}
            onChange={(e) => setNewTopic({...newTopic, description: e.target.value})}
            placeholder="Description"
            className="w-full mb-2 p-2 border rounded h-20 dark:bg-gray-700 dark:border-gray-600"
          />
          <input
            value={newTopic.keyConcepts}
            onChange={(e) => setNewTopic({...newTopic, keyConcepts: e.target.value})}
            placeholder="Key Concepts (comma-separated)"
            className="w-full mb-2 p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          />
          <textarea
            value={newTopic.challenges}
            onChange={(e) => setNewTopic({...newTopic, challenges: e.target.value})}
            placeholder="Challenges/Difficult Areas"
            className="w-full mb-2 p-2 border rounded h-20 dark:bg-gray-700 dark:border-gray-600"
          />
          <div className="flex justify-end">
            <button
              onClick={handleAddTopic}
              disabled={!newTopic.name.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 hover:bg-blue-600"
            >
              <Plus className="w-4 h-4" />
              Add Topic
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}