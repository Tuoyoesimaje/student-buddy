import { startPracticeExam } from '../services/practiceExamService';
import { useNavigate } from 'react-router-dom';
import { useRef, useEffect, useState } from 'react';
import { useToast } from "@/components/ui/use-toast";

const PracticeExam = () => {
  const [topicOrNote, setTopicOrNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!topicOrNote.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a topic or paste your notes',
        status: 'error',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await startPracticeExam(topicOrNote);
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
        <div className="mb-6">
          <label htmlFor="topicOrNote" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Enter a Topic or Paste Your Notes
          </label>
          <textarea
            id="topicOrNote"
            rows="10"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-500 dark:placeholder:text-gray-400"
            placeholder="Enter a specific topic (e.g., 'Photosynthesis in plants') or paste your study notes here..."
            value={topicOrNote}
            onChange={(e) => setTopicOrNote(e.target.value)}
            disabled={isLoading}
          />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            The AI will generate 15 practice questions based on this content.
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            disabled={isLoading}
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