CHAPTER FOUR: SYSTEM IMPLEMENTATION

4.1 Introduction

This chapter describes the actual implementation of Student Buddy, translating the design specifications from Chapter 3 into a functional web application. The chapter is organized into six main sections: development environment setup (4.2), backend implementation (4.3), frontend implementation (4.4), AI integration (4.5), security and authentication (4.6), and testing and quality assurance (4.7).

The focus is on key implementation decisions, architectural patterns adopted, challenges encountered, and solutions applied. Code snippets and screenshots are provided as figures to illustrate critical components.



4.2 Development Environment and Tools

4.2.1 Technology Stack Selection

Student Buddy was built using the MERN stack (MongoDB, Express, React, Node.js), selected for three primary reasons:

1. Full-stack JavaScript consistency: Single language across frontend and backend reduces context switching
2. Rapid prototyping capability: Extensive libraries and frameworks accelerate development
3. Strong community support: Large ecosystem with solutions for common problems

Backend Stack:
- Node.js v18+ for server-side JavaScript execution
- Express.js v4.18.2 for API routing and middleware
- MongoDB v8.1.3 for flexible document storage
- Mongoose v7.5.0 for data modeling and validation

Frontend Stack:
- React v18.2.0 for component-based UI
- Vite v7.1.7 for fast development builds
- Tailwind CSS v3.3.3 for utility-first styling
- React Router v7.6.2 for client-side navigation

AI and Document Processing:
- Google Generative AI (Gemini 2.5 Flash) API for question generation and grading
- pdf-parse, pdf-poppler, tesseract.js for document text extraction
- mammoth for DOCX processing

Security and Authentication:
- jsonwebtoken for JWT-based authentication
- bcryptjs for password hashing

4.2.2 Development Environment Setup

Project Structure:

The project uses a monorepo structure with separate `/backend` and `/frontend` directories:

```
student-buddy/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── utils/
│   ├── uploads/temp/
│   ├── .env
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── context/
    │   ├── services/
    │   ├── utils/
    │   └── main.jsx
    ├── .env
    └── package.json
```

Development Tools:
- Visual Studio Code as primary IDE
- Git for version control
- MongoDB Compass for database visualization
- Postman for API endpoint testing

Environment Variables:

Configuration managed through `.env` files:

Backend (.env):
```
NODE_ENV=development
PORT=3001
MONGO_URI=mongodb://localhost:27017/student-buddy
JWT_SECRET=your_secure_secret_key
GEMINI_API_KEY_1=your_primary_gemini_key
GEMINI_API_KEY_2=your_secondary_gemini_key
GEMINI_API_KEY_3=your_tertiary_gemini_key
```

Frontend (.env):
```
VITE_BACKEND_URL=http://localhost:3001
VITE_APP_NAME=Student Buddy
```

Development Workflow:

Both frontend and backend run concurrently during development:
- Backend uses `nodemon` for automatic restart on file changes
- Frontend uses Vite's hot module replacement for instant updates
- MongoDB runs locally via MongoDB Community Server

---

4.3 Backend Implementation

4.3.1 Server Architecture and Project Organization

The backend follows an MVC (Model-View-Controller) pattern adapted for REST API development.

Directory Structure:
- `/models`: Mongoose schemas defining data structure
- `/controllers`: Business logic for handling requests
- `/routes`: API endpoint definitions
- `/middleware`: Authentication, file upload, error handling
- `/services`: AI service integration (Gemini API)
- `/utils`: Reusable helper functions
- `/uploads/temp`: Temporary storage for uploaded files

Server Entry Point (server.js):

**[CODE SNIPPET 4.1: Server initialization showing Express setup, MongoDB connection, middleware registration, and route mounting]**

Key configuration decisions:
- CORS restricted to localhost:5173 (frontend) for security
- Body parser limit set to 20MB to handle large notes
- MongoDB connection uses connection pooling for performance

4.3.2 Database Schema Implementation

User Schema (models/User.js):

**[CODE SNIPPET 4.2: User schema showing fields (username, email, password, school, level, courses), pre-save password hashing middleware, and comparePassword method]**

Key features:
- Pre-save middleware automatically hashes passwords using bcrypt (10 salt rounds)
- Password field excluded by default in queries for security
- Custom `comparePassword()` method for authentication

Note Schema (models/Note.js):

**[CODE SNIPPET 4.3: Note schema showing title, content, subject, course reference, user reference, and timestamps]**

Key features:
- Text index on title and content enables full-text search
- Supports rich text content (HTML from TipTap editor)
- Optional course and subject for organization

QuizResult Schema (models/QuizResult.js):

**[CODE SNIPPET 4.4: QuizResult schema showing userId, noteId, questions array with hints/explanations, score, percentage, retakeOf reference]**

Key features:
- Stores complete quiz session including all questions and user responses
- `retakeOf` field enables tracking quiz retakes for spaced repetition
- Indexes optimize common query patterns (user's quiz history)

**AIGeneratedPracticeExam Schema (models/AIGeneratedPracticeExam.js):**

[CODE SNIPPET 4.5: AIGeneratedPracticeExam schema showing userId, noteIds array, questions, userAnswers, score, detailed feedback array]

Key features:
- `topicOrNote` stores full note content for AI grading reference
- `detailed` array provides granular feedback per question (mark 0-10, comment, reference)
- Supports multi-note practice exams via `noteIds` array

[FIGURE 4.1: Database relationship diagram showing User → Note, User → QuizResult, User → AIGeneratedPracticeExam, Note → QuizResult relationships]

4.3.3 API Route Structure

Authentication Routes (/api/auth):
- `POST /register` - Create new user account
- `POST /login` - Authenticate and return JWT token
- `GET /me` - Get current user profile (requires auth)

Note Routes (/api/notes):
- `GET /` - List all notes for authenticated user
- `GET /:id` - Get single note by ID
- `POST /` - Create new note manually
- `PUT /:id` - Update existing note
- `DELETE /:id` - Delete note
- `POST /upload/extract-text` - Upload document and extract text

AI Routes (/api/ai):
- `POST /generate-quiz` - Generate quiz from note content
- `POST /explain` - Get AI explanation of highlighted text
- `POST /summarize` - Summarize note content

Practice Exam Routes (/api/practice-exam):
- `POST /start` - Generate practice exam from notes
- `POST /submit/:examId` - Submit exam for AI grading
- `GET /:examId` - Retrieve exam results
- `GET /history` - Get assessment history for user

4.3.4 Middleware Implementation

Authentication Middleware (middleware/auth.js):

**[CODE SNIPPET 4.6: Authentication middleware showing JWT token verification, user extraction, and error handling]**

Process:
1. Extract token from Authorization header
2. Verify token using JWT secret
3. Decode payload to get user ID
4. Attach user object to request
5. Return 401 if token missing/invalid

File Upload Middleware:

Configured using `multer` for handling multipart/form-data:
- Destination: `/uploads/temp`
- Unique filenames with timestamps
- File type filter: PDF, DOCX, TXT, MD only
- Size limit: 500MB (for large textbooks)

4.3.5 Document Processing Implementation

Text Extraction Workflow:

**[FIGURE 4.2: Flowchart showing document processing: file upload → type detection → PDF (text extraction or OCR) / DOCX (mammoth) / TXT (direct read) → return text]**

For PDF Files:
1. Attempt normal text extraction using `pdf-parse`
2. If extracted text < 100 characters → assume scanned/image-based PDF
3. Convert PDF pages to PNG images using `pdf-poppler`
4. Run Tesseract OCR on each image (limited to first 50 pages for performance)
5. Combine text from all pages with page markers
6. Clean up temporary image files
7. Return combined text

For DOCX Files:
Use `mammoth` library to extract raw text directly.

For TXT/MD Files:
Read file contents directly using Node.js `fs` module.

**[CODE SNIPPET 4.7: Key portion of OCR extraction function showing PDF-to-image conversion and Tesseract processing loop]**

Performance Considerations:
- OCR is computationally expensive (can take 30-60 seconds for large PDFs)
- Implementation logs processing time for monitoring
- Page limit (50 pages) prevents timeouts on very large documents

4.3.6 AI Service Integration

Gemini API Client (services/aiService.js):

**[CODE SNIPPET 4.8: AIService class showing API key rotation, retry logic, and generateResponse method]**

Key Features:

1. API Key Rotation:
- System maintains multiple Gemini API keys
- When one hits rate limit, automatically switches to next available key
- Tracks current key index and rotates on 429/403 errors

2. Retry Logic:
- Failed API calls retry up to 3 times
- Handles transient network errors and rate limits gracefully

3. Core Methods:
- `generateResponse(prompt)` - Core AI generation with automatic key rotation
- `generateQuizFromNote(noteContent)` - Generate MCQ questions
- `generatePracticeQuestions(topicOrNote, isNoteBased)` - Generate open-ended questions
- `gradePracticeExam(questions, userAnswers, noteContent)` - AI grading with detailed feedback



4.4 Frontend Implementation

4.4.1 React Application Structure

Component Organization:
- `/src/components`: Reusable UI components (buttons, modals, cards)
- `/src/pages`: Full page components (Notes, Study, PracticeExam)
- `/src/context`: React Context providers (AuthContext, ThemeContext)
- `/src/services`: API client functions (api.js, practiceExamService.js)
- `/src/utils`: Helper functions (axios.js with interceptors)

**Routing Configuration:**

**[CODE SNIPPET 4.9: React Router configuration showing public routes (login, register) and protected routes (notes, study, practice-exam)]**

State Management:
- React Context API for global state (authenticated user)
- Component-level `useState` for UI-specific state
- No Redux (application complexity doesn't justify overhead)

### 4.4.2 Key Page Components

**Notes Page (pages/Notes.jsx):**

**[FIGURE 4.3: Screenshot of Notes page showing note cards grid, search bar, filter options, and action buttons]**

Features:
- Grid view of all user notes
- Search bar for filtering by title/content
- Filter by course and subject
- Each note card displays: title, excerpt, last modified date
- Actions: view, edit, delete, generate quiz, generate practice exam

Study Page - Quiz Mode (pages/Study.jsx):

[FIGURE 4.4: Screenshot of quiz interface showing question, multiple-choice options, hint display, and progress indicator]**

Features:
- Progress indicator (Question 3 of 15)
- Question display with clear typography
- Answer options (radio buttons for MCQ)
- Two-stage feedback system:
  - First incorrect attempt: Shows hint + "Try again" button
  - Second incorrect attempt: Shows correct answer + explanation
  - Correct answer: Shows "Correct!" + explanation
- 8-minute countdown timer
- Quiz results summary at end

Practice Exam Page (pages/PracticeExamPage.jsx):

[FIGURE 4.5: Screenshot of practice exam setup showing note selection interface and "Generate Practice Exam" button]**

**Practice Exam Questions Page (pages/PracticeExamQuestionsPage.jsx):

[FIGURE 4.6: Screenshot of exam interface showing question navigation grid, current question with textarea, and progress bar]

Features:
- All 15 questions accessible via navigation grid
- Large textarea for each answer (supports Markdown)
- Visual indicators: answered (green), unanswered (gray), current (blue)
- Submit button with confirmation dialog

**Practice Exam Results Page (pages/PracticeExamResultsPage.jsx):**

**[FIGURE 4.7: Screenshot of results page showing circular score indicator, overall feedback, and detailed question-by-question breakdown]**

Features:
- Circular progress indicator showing percentage score
- Overall AI feedback summary
- Detailed breakdown per question:
  - Student's answer
  - Mark out of 10
  - AI feedback comment
  - Reference to note content

4.4.3 Component Implementation Patterns

Data Fetching Pattern:

```javascript
useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/notes');
      setNotes(response.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
```

Error Handling:
- API errors caught and displayed via toast notifications
- Network errors show "Please check connection" message
- Authentication errors (401) redirect to login page

4.4.4 Styling and Responsive Design

Tailwind CSS Implementation:
- Utility classes applied directly in JSX
- Common patterns extracted into reusable components (Button, Card, Input)

Responsive Breakpoints:
- Mobile: < 640px (single column layout)
- Tablet: 640px - 1024px (two column layout)
- Desktop: > 1024px (three column layout, sidebar navigation)

Design System:
- Primary color: Blue/Indigo (buttons, links)
- Success: Green (correct answers)
- Error: Red (incorrect answers, errors)
- Neutral: Gray scale (text, backgrounds)

Dark Mode:
- Fully implemented using Tailwind's `dark:` prefix
- Theme toggle in settings
- Preference stored in localStorage


4.5 AI Integration and Prompt Engineering

4.5.1 Prompt Design Philosophy

The effectiveness of Student Buddy depends heavily on AI-generated content quality. Prompt engineering went through six major iterations during development.

Core Principles:
1. Explicit Constraints: "Use ONLY information from notes", "Do NOT include external information"
2. Structured Output: Request JSON format with explicit schema
3. Context Richness: Include full note content (up to 400K characters)
4. Role Definition: Begin with system message defining AI's role
5. Quality Criteria: Specify what makes good questions

4.5.2 Quiz Generation Prompts

**[CODE SNIPPET 4.10: Quiz generation prompt showing system role, requirements list, note content insertion, and JSON response format]**

Iterative Refinements:
- Iteration 1-2: Basic prompts produced generic questions
- Iteration 3: Added "use ONLY information from notes" → reduced hallucinations
- Iteration 4: Specified distractor quality for MCQs → improved difficulty
- Iteration 5: Added hint constraints → hints became more helpful
- Iteration 6: Enhanced explanation requirements → better pedagogical feedback

4.5.3 Practice Exam Grading Prompts

Grading Philosophy:
AI grader instructed to be "fair but rigorous", award partial credit for partial understanding, provide constructive feedback.

**[CODE SNIPPET 4.11: Grading prompt showing scoring scale (0-10), feedback requirements (strengths, weaknesses, suggestions), and JSON response format]**

Feedback Structure:
- Strengths: What student got right
- Weaknesses: What student got wrong or missed
- Suggestions: How to improve

This three-part structure ensures feedback is actionable rather than just evaluative.

4.5.4 Challenge: AI Hallucination Mitigation

Problem Identified:
Early testing revealed AI sometimes introduced facts not present in student notes.

Solutions Implemented:
1. Explicit Prompt Constraints: Repeated emphasis on "use ONLY note content"
2. User Feedback Mechanism: Students can report bad questions
3. Multiple Key Rotation: If one key produces poor output, system switches
4. Context Window Management: Limit note content to ~400K characters

Remaining Limitations:
Despite mitigations, occasional hallucinations still occur. Documented in Chapter 1 limitations.

4.5.5 Hint Generation Strategy

Requirement:
Hints must help without revealing answers, preserving productive struggle (per Constructivist principles from Chapter 2).

Prompt Instructions:
"Generate a minimal hint that guides thinking toward the answer without using any keywords from the correct answer itself. The hint should prompt retrieval by suggesting relevant concepts or asking a leading question."

Example:
- Question: "What is the powerhouse of the cell?"
- Bad hint: "It produces ATP" (reveals answer)
- Good hint: "Think about which organelle is responsible for energy production"



4.6 Security and Authentication Implementation

4.6.1 Authentication Flow

Registration Process:
1. User submits username, email, password via frontend form
2. Frontend validates (all fields present, email format, password length ≥ 6)
3. POST request to `/api/auth/register`
4. Backend validates inputs again
5. Check if username/email already exists
6. Hash password using bcrypt (10 salt rounds)
7. Create User document in MongoDB
8. Generate JWT token with user ID as payload
9. Return token + user profile to frontend
10. Frontend stores token in localStorage
11. Redirect to dashboard

Login Process:
1. User submits email and password
2. POST request to `/api/auth/login`
3. Backend finds user by email
4. Compare submitted password with hashed password using bcrypt
5. If match: generate JWT token and return
6. If no match: return 401 Unauthorized
7. Frontend stores token and redirects

Protected Route Access:
1. Frontend attaches token to Authorization header: `Bearer <token>`
2. Backend auth middleware extracts and verifies token
3. If valid: decode payload, attach user ID to request
4. If invalid/expired: return 401 error
5. Frontend catches 401, clears token, redirects to login

**[FIGURE 4.8: Authentication flow diagram showing registration, login, and protected route access]**

4.6.2 Security Measures Implemented

Password Security:
- Minimum 6 characters required
- Hashed using bcrypt with 10 salt rounds
- Password field excluded from query results by default
- Passwords never sent in API responses

JWT Security:
- Secret key stored in environment variable
- Token payload contains only user ID
- Tokens signed with HS256 algorithm
- 24-hour expiration limits damage if compromised

Input Validation:
- All user inputs validated on backend
- Mongoose schema validation (required fields, min/max lengths)
- Sanitization of text inputs

File Upload Security:
- File type whitelist (only PDF, DOCX, TXT, MD)
- File size limit (500MB max)
- Uploaded files stored with unique generated names
- Temporary files deleted after processing

CORS Configuration:
- Restricted to localhost:5173 (frontend origin)
- Credentials enabled only for trusted origin

4.6.3 Data Privacy Considerations

User Data:
- User accounts isolated (can only access own notes/quizzes)
- No sharing features means no data leakage between users

Note Content Privacy:
- All notes private to owning user
- No public access or search across users

Gemini API Data Handling:
- Note content sent to Google's Gemini API for processing
- Google's privacy policy applies to this data
- No long-term storage of student data by Google (per API terms)

---

4.7 Testing and Quality Assurance

4.7.1 Testing Strategy

Manual Testing:
Primary testing approach during development. Each feature tested manually after implementation and after changes.

Test Scenarios Covered:

Authentication:
- Register with valid data → success
- Register with existing username/email → error
- Login with correct credentials → success
- Login with wrong password → error
- Access protected route without token → redirect to login

Note Management:
- Create note manually → saves correctly
- Upload PDF (text-based) → extracts text
- Upload PDF (scanned) → OCR extracts text
- Upload DOCX → extracts text
- Edit existing note → saves changes
- Delete note → removes from database
- Search notes → returns matching results

Quiz Generation:
- Generate quiz from short note (< 100 words) → error message
- Generate quiz from medium note (500 words) → produces 15 questions
- Check question quality → manually verify relevance to note

Quiz Session:
- Answer correctly on first attempt → shows "Correct" + explanation
- Answer incorrectly on first attempt → shows hint
- Answer incorrectly on second attempt → shows full explanation
- Complete quiz → displays results summary

Practice Exam:
- Generate exam from single note → produces 15 questions
- Generate exam from multiple notes → includes content from all
- Submit exam → AI assigns appropriate scores
- Check feedback quality → manually verify constructiveness

Cross-Browser Testing:
Tested on Chrome, Firefox, Safari, and Edge. Minor CSS inconsistencies found in Safari (flexbox behavior), fixed with vendor prefixes.

Responsive Testing:
Tested at breakpoints: Mobile (375px), Tablet (768px), Desktop (1920px). Adjusted layouts for better mobile experience.

4.7.2 Bug Tracking and Resolution

Major Bugs Encountered:

Bug 1: OCR Processing Timeout
- Issue: Large scanned PDFs (50+ pages) caused server timeout
- Solution: Limited OCR to first 50 pages, added progress logging

Bug 2: Duplicate Quiz Questions
- Issue: Gemini occasionally returned duplicate questions
- Solution: Added deduplication filter checking question text similarity

Bug 3: Token Not Persisting
- Issue: Users logged out on page refresh
- Solution: Added localStorage persistence for token

Bug 4: Assessment Tracker Wrong Scores
- Issue: Tracker showed scores from different notes
- Solution: Fixed MongoDB query to properly match noteIds array

4.7.3 Performance Optimization

Identified Bottlenecks:

1. Quiz Generation Speed: 15 questions took 10-15 seconds
   - Accepted: Gemini API response time unavoidable
   - Mitigation: Added progress indicator, loading messages

2. Dashboard Load Time: Fetching all notes took 2-3 seconds
   - Solution: Implemented pagination (20 notes per page)

3. Search Performance: Text search on 100+ notes was slow
   - Solution: Added MongoDB text index on title and content fields

Code Optimization:
- Removed unused dependencies (reduced bundle size)
- Implemented code splitting for routes (React.lazy)
- Memoized expensive calculations in React components

---

4.8 Summary

This chapter described the complete implementation of Student Buddy from development environment setup through testing and quality assurance. Key accomplishments include:

Backend Implementation:
- RESTful API with Express.js handling authentication, note management, and AI integration
- MongoDB database with optimized schemas for users, notes, quiz results, and practice exams
- Document processing pipeline supporting PDF (with OCR), DOCX, TXT, and MD formats
- AI service integration with Gemini API featuring automatic key rotation and retry logic

Frontend Implementation:
- React-based single-page application with responsive design
- Intuitive user interfaces for note management, quiz sessions, and practice exams
- Two-stage hint system preserving productive struggle while preventing frustration
- Assessment tracking visualizing per-note performance trends

AI Integration:
- Sophisticated prompt engineering through six iterations to improve question quality
- Note-grounded generation ensuring questions test actual study material
- AI grading system providing detailed, constructive feedback on open-ended responses
- Hallucination mitigation strategies reducing off-topic content

Security:
- JWT-based authentication with bcrypt password hashing
- Input validation and sanitization preventing injection attacks
- File upload security with type whitelisting and size limits
- CORS configuration restricting access to trusted origins

Testing:
- Comprehensive manual testing across authentication, note management, quiz generation, and practice exams
- Cross-browser and responsive testing ensuring compatibility
- Bug tracking and resolution addressing major issues
- Performance optimization reducing load times and improving user experience

The implemented system successfully addresses the research gaps identified in Chapter 2 by providing an integrated, note-grounded retrieval practice platform that reduces friction, maintains pedagogical effectiveness, and supports metacognitive awareness through progress tracking.

---

**[End of Chapter 4]**

---

**Note on Figures and Code Snippets:**

The following should be inserted at indicated locations:
- **Figure 4.1**: Database relationship diagram
- **Figure 4.2**: Document processing flowchart
- **Figure 4.3-4.7**: Screenshots of key pages (Notes, Study, Practice Exam)
- **Figure 4.8**: Authentication flow diagram
- **Code Snippets 4.1-4.11**: Key code implementations (server setup, schemas, middleware, AI prompts)


