PROJECT OVERVIEW: Student Buddy - AI-Powered Study Platform
TECHNOLOGY STACK
Backend:

Node.js + Express.js
MongoDB (Mongoose ODM)
Google Gemini AI (2.5 Flash model) with multi-key rotation
JWT authentication
File processing: PDF-parse, Mammoth (DOCX), Tesseract.js (OCR)
Cloudinary for media storage
Frontend:

React 18 with Vite
React Router v7 for navigation
TailwindCSS + Radix UI components
TipTap rich text editor
Axios for API calls
Framer Motion for animations
QUIZ GENERATION SYSTEM - COMPLETE FLOW
1. QUIZ GENERATION TRIGGER POINTS
From Notes Page:

User selects a note → clicks "Generate Quiz" button
Navigates to /app/active-learning with selectedNotes in state
Study page auto-generates quiz from the note content
From Study Page:

User manually enters topic or selects notes
Two modes: Note-based (from saved notes) or Topic-based (free text)
2. BACKEND QUIZ GENERATION PROCESS
Endpoint: POST /api/ai/generate-quiz

Flow:

Request received with topic parameter (contains note content or topic text)
AI Service (backend/services/aiService.js):
Uses Google Gemini 2.5 Flash model
Constructs detailed prompt requesting 15 MCQ questions
Each question must have: Question text, 4 options (A/B/C/D), Hint, Explanation, Answer
Key rotation: If one API key fails (rate limit/quota), automatically rotates to next key
Prompt Structure:
Generate 15 multiple-choice quiz questions about [topic]
Format:
Q1: [question]
A) [option]
B) [option]
C) [option]
D) [option]
Hint: [subtle hint without revealing answer]
Explanation: [detailed explanation]
Answer: [A/B/C/D]
Response parsing extracts questions, options, hints, explanations, and correct answers
Returns raw text response to frontend for client-side parsing
3. FRONTEND QUIZ PARSING & DISPLAY
Location: frontend/src/pages/Study.jsx (lines 400-500)

Parsing Logic:

// Split by Q1:, Q2:, etc.
const questionsArray = rawQuizText.split(/Q\d+:/).filter(Boolean).map(q => {
  // Extract Answer: line
  const answerSplit = q.split(/Answer:/);
  const answerLetter = answerSplit[1].trim().charAt(0).toUpperCase();
  
  // Extract Hint: line
  const hintMatch = beforeAnswer.match(/Hint:\s*([\s\S]*?)(?=Explanation:|$)/i);
  const hint = hintMatch ? hintMatch[1].trim() : '';
  
  // Extract Explanation: line
  const explanationMatch = beforeAnswer.match(/Explanation:\s*([\s\S]*?)(?=Hint:|$)/i);
  const explanation = explanationMatch ? explanationMatch[1].trim() : '';
  
  // Split options by A), B), C), D)
  const parts = beforeAnswerNoHint.split(/A\)|B\)|C\)|D\)/);
  const questionText = parts[0].trim();
  const options = [parts[1], parts[2], parts[3], parts[4]].map(s => s.trim());
  
  return { question, options, correctAnswer, hint, explanation };
});
4. QUIZ INTERACTION FLOW
Two-Attempt System:

First Attempt:
User selects answer (A/B/C/D)
If correct → immediate feedback, move to next question
If wrong → show hint, allow second attempt
Second Attempt:
User tries again with hint visible
If correct → partial credit (not counted in final score)
If wrong → show correct answer + explanation
Hint System:

30-second timer starts when question loads
After 30s, hint becomes available (subtle button appears)
User can manually reveal hint
Wrong answer auto-reveals hint
Scoring:

Only first attempt counts toward final score
Score = (correct first attempts / total questions) × 100
5. QUIZ RESULTS & STORAGE
Endpoint: POST /api/practice-exam/quiz-results

Stored Data:

{
  userId,
  noteId,
  noteTitle,
  questions: [{ question, options, correctAnswer, userAnswer, isCorrect, hint, explanation }],
  score,
  totalQuestions,
  percentage,
  passed,
  timeSpent,
  aiRemarks,
  retakeOf: (if retaking previous quiz)
}
Results Display:

Circular progress bar showing percentage
Question-by-question breakdown
Color-coded: Green (correct), Red (incorrect)
Shows user's answer vs correct answer
Displays explanation for wrong answers
PRACTICE EXAM SYSTEM - COMPLETE FLOW
1. PRACTICE EXAM GENERATION
Endpoint: POST /api/practice-exam/start

Process:

User provides topic or selects notes (up to 3 notes)
Backend calls aiService.generatePracticeQuestions()
AI generates 15 open-ended questions (not MCQ)
Questions distributed across note content proportionally
Creates AIGeneratedPracticeExam document with:
userId, topicOrNote, noteIds, questions[], userAnswers[], submitted: false
2. ANSWERING PRACTICE EXAM
Page: /app/practice-exam/questions/:examId

Features:

Question navigation: Grid showing all 15 questions
Progress tracking: Visual indicators for answered/unanswered
Markdown support: User can format answers with markdown
Auto-save: Answers saved as user navigates between questions
Submission warning: Alerts if unanswered questions remain
3. AI GRADING SYSTEM
Endpoint: POST /api/practice-exam/submit/:examId

Grading Process:

AI receives:

All 15 questions
User's answers
Original note content (as reference material)
AI grades each answer on 0-10 scale:

9-10: Complete understanding
7-8: Strong understanding
5-6: Good understanding
3-4: Basic understanding
1-2: Limited understanding
0: No understanding
AI provides:

Mark (0-10) for each question
Detailed comment (lecturer-style feedback)
Reference to specific concept from notes
Overall feedback:

Total percentage score
General performance summary
Detailed breakdown per question
4. RESULTS DISPLAY
Page: /app/practice-exam/results/:examId

Shows:

Large circular score indicator
Performance level (Excellent/Good/Needs Improvement)
AI feedback summary
Question-by-question breakdown with:
Student's answer
AI feedback comment
Mark out of 10
Reference material
AI SERVICE ARCHITECTURE
File: backend/services/aiService.js

Key Features:
Multi-Key Rotation:

setApiKeys([key1, key2, key3])
// If key1 fails → automatically tries key2 → then key3
Error Handling:

Detects rate limiting (429), authentication (403), service unavailable (503)
Rotates to next key on quota/rate limit errors
Returns "All Gemini keys failed" if all keys exhausted
Methods:

generateResponse(prompt) - Core AI generation
summarizeNote(content) - Rewrite notes concisely
explainNote(content) - Expand with detailed explanations
generateNotes(topic, level, context) - Create study notes from scratch
generatePracticeQuestions(topicOrNote, isNoteBased) - 15 open-ended questions
gradePracticeExam(questions, answers, noteContent) - AI grading with JSON response
DATABASE SCHEMA
User Model:
{
  username, email, password (hashed),
  school, level, semesterStart, semesterEnd,
  preferences: { theme, language },
  courses: [ObjectId],
  googleAuth: { accessToken, refreshToken, connected }
}
Note Model:
{
  title, content (HTML/Markdown),
  subject (folder name),
  course: ObjectId,
  attachments: [{ name, type, url, size }],
  user: ObjectId,
  createdAt, updatedAt
}
Course Model:
{
  user: ObjectId,
  name, code, school, level, semester,
  topics: [{ name, description, keyConcepts, challenges, studentNotes }],
  createdAt, updatedAt
}
QuizResult Model:
{
  userId, noteId, noteTitle,
  questions: [{ question, options, correctAnswer, userAnswer, isCorrect, hint, explanation }],
  retakeOf: ObjectId (if retaking),
  score, totalQuestions, percentage, passed,
  timeSpent, difficulty, aiRemarks,
  createdAt, updatedAt
}
AIGeneratedPracticeExam Model:
{
  userId, topicOrNote, noteIds: [],
  questions: [String], // 15 open-ended questions
  userAnswers: [String],
  score, feedback,
  detailed: [{ question, studentAnswer, mark, comment, reference }],
  submitted: Boolean,
  createdAt
}
FILE UPLOAD & TEXT EXTRACTION
Endpoint: POST /api/notes/upload/extract-text

Supported Formats:

PDF (up to 500MB)
DOCX
TXT
Markdown (.md)
Process:

PDF Extraction:

First tries pdf-parse for text-based PDFs
If fails/no text → uses OCR (Tesseract.js)
Converts PDF pages to PNG images
Runs OCR on each page (limited to first 50 pages for performance)
DOCX Extraction:

Uses mammoth library to extract raw text
Text/Markdown:

Direct file read
Limits:

Max file size: 500MB
Max extracted text: 5M characters (truncates with warning)
ROUTING STRUCTURE
Backend Routes:
/api/auth - Login, register, get current user
/api/notes - CRUD operations, file upload
/api/courses - Course management, topics
/api/ai - Explain text, summarize, generate quiz, chat
/api/practice-exam - Start, submit, get results, retake
/api/note-generation - AI-generated notes from topics
/api/users - Profile, preferences, notifications
Frontend Routes:
/ - Landing page
/login, /register - Authentication
/app/notes - Notes management
/app/active-learning - Study page (quiz generation)
/app/practice-exam - Practice exam setup
/app/practice-exam/questions/:examId - Answer questions
/app/practice-exam/results/:examId - View results
/app/quiz-results/:quizId - View quiz results
/app/settings - User settings
KEY FEATURES
AI-Powered Quiz Generation - 15 MCQ questions with hints & explanations
Practice Exams - 15 open-ended questions with AI grading
Two-Attempt Quiz System - Hint after first wrong answer
Assessment Tracking - History of all quizzes and practice exams
Note Management - Rich text editor, folders, course organization
File Upload - PDF/DOCX with OCR support for scanned documents
AI Text Explanation - Highlight text → get hint or full explanation
Note Summarization - AI rewrites notes concisely
Retake Functionality - Retake quizzes with same questions
Dark Mode - Full theme support