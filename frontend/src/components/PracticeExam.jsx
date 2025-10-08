import { startPracticeExam } from '../services/practiceExamService';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRef, useEffect, useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import api from '../utils/axios';
import HierarchicalNoteSelector from './HierarchicalNoteSelector';

const PracticeExam = () => {
  const [topicOrNote, setTopicOrNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [examGenerationMode, setExamGenerationMode] = useState('note-based'); // 'note-based' or 'topic'
  const [selectedExamNotes, setSelectedExamNotes] = useState([]);
  const [notes, setNotes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  // Load notes and courses
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingNotes(true);
        const [notesResponse, coursesResponse] = await Promise.all([
          api.get('/api/notes'),
          api.get('/api/courses')
        ]);
        setNotes(notesResponse.data);
        setCourses(coursesResponse.data);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load notes and courses. Please try again.',
          status: 'error',
        });
      } finally {
        setIsLoadingNotes(false);
      }
    };
    loadData();
  }, []);

  // Handle navigation from Notes page with selected notes
  useEffect(() => {
    const { selectedNotes, mode } = location.state || {};
    if (selectedNotes && Array.isArray(selectedNotes)) {
      setSelectedExamNotes(selectedNotes);
      setExamGenerationMode('note-based');
    }
    if (mode) {
      setExamGenerationMode(mode);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let contentToUse = '';

    if (examGenerationMode === 'note-based') {
      if (selectedExamNotes.length === 0) {
        toast({
          title: 'Error',
          description: 'Please select at least one note to generate a practice exam',
          status: 'error',
        });
        return;
      }
      // Combine content from selected notes
      contentToUse = selectedExamNotes.map(note =>
        `${note.title}\n${note.content.replace(/<[^>]*>/g, '')}`
      ).join('\n\n');
    } else {
      if (!topicOrNote.trim()) {
        toast({
          title: 'Error',
          description: 'Please enter a topic to generate a practice exam',
          status: 'error',
        });
        return;
      }
      contentToUse = topicOrNote;
    }

    setIsLoading(true);
    try {
      const response = await startPracticeExam(contentToUse);
      console.log('Response from startPracticeExam:', response);

      // Only navigate if we have a valid examId
      if (mounted.current && response && response.examId) {
        setIsLoading(false); // Set loading to false before navigation
        navigate(`/app/practice-exam/questions/${response.examId}`);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error starting practice exam:', error);
      if (mounted.current) {
        setIsLoading(false);
        toast({
          title: 'Error',
          description: error.response?.data?.error || 'Failed to generate practice exam. Please try again.',
          status: 'error',
        });
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/20 border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Generate Practice Exam</h2>

      <form onSubmit={handleSubmit}>
        {/* Mode Toggle */}
        <div className="mb-6">
          <div className="flex items-center justify-center space-x-4">
            <span className={`text-sm font-medium ${examGenerationMode === 'note-based' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>
              Note-Based Mode
            </span>
            <button
              type="button"
              onClick={() => setExamGenerationMode(examGenerationMode === 'note-based' ? 'topic' : 'note-based')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                examGenerationMode === 'note-based' ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  examGenerationMode === 'note-based' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${examGenerationMode === 'topic' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>
              Topic Mode
            </span>
          </div>
        </div>

        {examGenerationMode === 'note-based' ? (
          /* Hierarchical Note Selection Interface */
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Notes for Practice Exam
            </label>
            <HierarchicalNoteSelector
              notes={notes}
              courses={courses}
              selectedNotes={selectedExamNotes}
              onSelectionChange={setSelectedExamNotes}
              maxSelections={3}
              singleSelect={false}
              className="border border-gray-200 dark:border-gray-600 rounded-lg"
            />
          </div>
        ) : (
          /* Topic Input */
          <div className="mb-6">
            <label htmlFor="topicOrNote" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Enter a Topic
            </label>
            <textarea
              id="topicOrNote"
              rows="10"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-500 dark:placeholder:text-gray-400"
              placeholder="Enter a specific topic (e.g., 'Photosynthesis in plants')..."
              value={topicOrNote}
              onChange={(e) => setTopicOrNote(e.target.value)}
              disabled={isLoading}
            />
          </div>
        )}

        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          The AI will generate 15 practice questions based on {examGenerationMode === 'note-based' ? 'the selected notes' : 'this topic'}.
        </p>

        <div className="flex justify-end">
          <button
            type="submit"
            className={`px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 ${
              (examGenerationMode === 'note-based' ? selectedExamNotes.length === 0 : !topicOrNote.trim()) || isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={(examGenerationMode === 'note-based' ? selectedExamNotes.length === 0 : !topicOrNote.trim()) || isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Questions...
              </>
            ) : (
              'Generate Practice Exam'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PracticeExam;