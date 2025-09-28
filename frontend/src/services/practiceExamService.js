import api from '../api';

// Practice Exam API calls

/**
 * Start a new practice exam by providing a topic or note content
 * @param {string} topicOrNote - The topic or note content to generate questions from
 * @returns {Promise} - The response containing examId and questions
 */
export const startPracticeExam = async (topicOrNote) => {
  const response = await api.post('/practice-exam/start', { topicOrNote });
  return response.data;
};

/**
 * Submit answers for a practice exam
 * @param {string} examId - The ID of the practice exam
 * @param {Array} userAnswers - Array of user's answers to the questions
 * @returns {Promise} - The response containing score, feedback, and detailed breakdown
 */
export const submitPracticeExam = async (examId, userAnswers) => {
  const response = await api.post(`/practice-exam/submit/${examId}`, { userAnswers });
  return response.data;
};

/**
 * Get all practice exams for the current user
 * @returns {Promise} - The response containing all practice exams
 */
export const getAllPracticeExams = async () => {
  const response = await api.get('/practice-exam');
  return response.data;
};

/**
 * Get a specific practice exam by ID
 * @param {string} examId - The ID of the practice exam to retrieve
 * @returns {Promise} - The response containing the practice exam details
 */
export const getPracticeExam = async (examId) => {
  try {
    const response = await api.get(`/practice-exam/${examId}`);
    console.log('Response from getPracticeExam API:', response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
};