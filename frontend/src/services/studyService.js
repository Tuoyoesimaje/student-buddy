import axios from 'axios';

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    // Get the auth token from localStorage
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (response.status === 401) {
      // Handle unauthorized access
      window.location.href = '/login';
      throw new Error('Please log in to access this feature');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Quiz API calls
export const getQuizzes = async () => {
  const response = await axios.get(`${API_URL}/study/quizzes`);
  return response.data;
};

export const getQuiz = async (id) => {
  const response = await axios.get(`${API_URL}/study/quizzes/${id}`);
  return response.data;
};

export const submitQuiz = async (quizId, answers) => {
  const response = await axios.post(`${API_URL}/study/quizzes/submit`, {
    quizId,
    answers,
  });
  return response.data;
};

// Practice Exam API calls
export const getPracticeExams = async () => {
  const response = await axios.get(`${API_URL}/study/practice-exams`);
  return response.data;
};

export const getPracticeExam = async (id) => {
  const response = await axios.get(`${API_URL}/study/practice-exams/${id}`);
  return response.data;
};

export const submitPracticeExam = async (examId, answers) => {
  const response = await axios.post(`${API_URL}/study/practice-exams/submit`, {
    examId,
    answers,
  });
  return response.data;
};

// Study Notes API calls
export const getNotes = async () => {
  return apiCall('/notes');
};

export const createNote = async (noteData) => {
  return apiCall('/notes', {
    method: 'POST',
    body: JSON.stringify(noteData),
  });
};

export const updateNote = async (id, noteData) => {
  return apiCall(`/notes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(noteData),
  });
};

export const deleteNote = async (id) => {
  return apiCall(`/notes/${id}`, {
    method: 'DELETE',
  });
};

// Courses API calls
export const getCourses = async () => {
  return apiCall('/courses');
};

export const createCourse = async (courseData) => {
  return apiCall('/courses', {
    method: 'POST',
    body: JSON.stringify(courseData),
  });
};

export const updateCourse = async (id, courseData) => {
  return apiCall(`/courses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(courseData),
  });
};

export const deleteCourse = async (id) => {
  return apiCall(`/courses/${id}`, {
    method: 'DELETE',
  });
};

// Topics API calls
export const getTopics = async () => {
  return apiCall('/topics');
};

export const createTopic = async (topicData) => {
  return apiCall('/topics', {
    method: 'POST',
    body: JSON.stringify(topicData),
  });
};

export const updateTopic = async (id, topicData) => {
  return apiCall(`/topics/${id}`, {
    method: 'PUT',
    body: JSON.stringify(topicData),
  });
};

export const deleteTopic = async (id) => {
  return apiCall(`/topics/${id}`, {
    method: 'DELETE',
  });
}; 