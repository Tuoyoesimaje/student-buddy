import { startPracticeExam } from '../services/practiceExamService';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRef, useEffect, useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import api from '../utils/axios';
import NoteSearchSelector from './NoteSearchSelector';
import { DocumentTextIcon, PencilIcon } from '@heroicons/react/24/outline';

const PracticeExam = () => {
  const [topicOrNote, setTopicOrNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [examGenerationMode, setExamGenerationMode] = useState('note-based'); // 'note-based' or 'topic'
  const [selectedExamNotes, setSelectedExamNotes] = useState([]);
  // Notes and courses loading removed - handled by NoteSearchSelector
  const navigate = useNavigate();
  const location = useLocation();
  const { autoStart } = location.state || {};
  const { toast } = useToast();
  const mounted = useRef(false);
  const autoStartedRef = useRef(false);
  const initialSelectionFromNav = useRef(Boolean(location.state && location.state.selectedNotes && location.state.selectedNotes.length > 0));

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);


  // Consume navigation state only on mount. If the navigation explicitly requested autoStart
  // with selectedNotes, auto-generate once. Otherwise, preselect notes but DO NOT auto-start
  // when the user later selects notes interactively on this page.
  useEffect(() => {
    const st = location.state || {};
    const { selectedNotes, mode, autoStart: navAutoStart, retakeFrom, topicOrNote: retakeTopic } = st;

    if (selectedNotes && Array.isArray(selectedNotes)) {
      setSelectedExamNotes(selectedNotes);
      setExamGenerationMode('note-based');
    }
    if (mode) {
      setExamGenerationMode(mode);
    }

    // Handle retake functionality
    if (retakeFrom) {
      console.log('Retaking assessment:', retakeFrom);
      if (retakeTopic) {
        // Retaking a topic-based exam
        setTopicOrNote(retakeTopic);
        setExamGenerationMode('topic');
      } else {
        // Retaking a note-based exam - we need to fetch the original exam data
        // For now, we'll just show a message that retake setup is needed
        toast({
          title: 'Retake Setup',
          description: 'Please select the notes again to retake this practice exam.',
          status: 'info',
        });
      }
    }

  // Only auto-start for the explicit 'notes-quick' token coming from Notes quick-action
  if (navAutoStart === 'notes-quick' && selectedNotes && selectedNotes.length > 0) {
      // mark as auto-started to avoid any accidental retriggers
      autoStartedRef.current = true;
      // Programmatic call to submit — make handleSubmit tolerant to missing event
      (async () => {
        try {
          await handleSubmit();
        } catch (err) {
          console.error('Auto-start submission failed:', err);
        }
      })();

      // Clear navigation state so it doesn't persist if the user navigates back
      try {
        navigate(location.pathname, { replace: true, state: {} });
      } catch (navErr) {
        // ignore
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debug logging: show when selected notes change
  useEffect(() => {
    console.debug('[PracticeExam] selectedExamNotes changed', { length: selectedExamNotes.length, selectedExamNotes });
  }, [selectedExamNotes]);

  // Debug logging: show location state on mount
  useEffect(() => {
    console.debug('[PracticeExam] location.state on mount:', location.state || {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    // Support programmatic calls without an event
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    console.debug('[PracticeExam] handleSubmit called', {
      eventType: e?.type || 'programmatic',
      selectedExamNotesLength: selectedExamNotes.length,
      selectedExamNotes,
      locationState: location.state,
      autoStartedRef: autoStartedRef.current,
      stack: (new Error()).stack
    });

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
      // Combine content from selected notes with explicit separators and per-note truncation
      const maxPerNote = 400000; // increased for large textbook content
      contentToUse = selectedExamNotes.map((note, idx) => {
        const plain = (note.content || '').replace(/<[^>]*>/g, '');
        const truncated = plain.length > maxPerNote ? plain.substring(0, maxPerNote) + '...' : plain;
        return `--- NOTE ${idx + 1} START: ${note.title} ---\n${truncated}\n--- NOTE ${idx + 1} END ---`;
      }).join('\n\n');
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
  const noteIdsToSend = selectedExamNotes.map(n => n._id).filter(Boolean);
  const response = await startPracticeExam(contentToUse, noteIdsToSend);
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
        {/* Mode Toggle - icon on top-right */}
        <div className="mb-6 relative">
          <div className="absolute right-0 top-0">
            <button
              type="button"
              onClick={() => setExamGenerationMode(examGenerationMode === 'note-based' ? 'topic' : 'note-based')}
              title={examGenerationMode === 'note-based' ? 'Switch to Topic mode' : 'Switch to Note-based mode'}
              className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
            >
              {examGenerationMode === 'note-based' ? (
                <DocumentTextIcon className="w-5 h-5" />
              ) : (
                <PencilIcon className="w-5 h-5" />
              )}
            </button>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Mode: <span className="font-medium">{examGenerationMode === 'note-based' ? 'Note-Based' : 'Topic'}</span></p>
          </div>
        </div>

        {examGenerationMode === 'note-based' ? (
          /* Search-based Note Selection Interface */
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Notes for Practice Exam
            </label>
            <NoteSearchSelector
              selectedNotes={selectedExamNotes}
              onSelectionChange={setSelectedExamNotes}
              maxSelections={3}
              placeholder="Search for notes to include in practice exam..."
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