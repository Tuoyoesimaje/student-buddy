# CHAPTER FOUR: SYSTEM IMPLEMENTATION

## 4.1 Introduction

This chapter describes the implementation of Student Buddy, translating design specifications from Chapter 3 into a functional web application. The chapter covers development environment setup (4.2), backend implementation (4.3), frontend implementation (4.4), AI integration and prompt engineering (4.5), security and authentication (4.6), and testing and quality assurance (4.7).

---

## 4.2 Development Environment and Tools

### 4.2.1 Technology Stack

Student Buddy uses the MERN stack (MongoDB, Express, React, Node.js) for three reasons:
1. Full-stack JavaScript consistency reduces context switching
2. Rapid prototyping with extensive libraries
3. Strong community support

**Backend Stack:**
- Node.js v18+ (server-side JavaScript)
- Express.js v4.18.2 (API routing and middleware)
- MongoDB v8.1.3 (document storage)
- Mongoose v7.5.0 (data modeling)

**Frontend Stack:**
- React v18.2.0 (component-based UI)
- Vite v7.1.7 (fast development builds)
- Tailwind CSS v3.3.3 (utility-first styling)
- React Router v7.6.2 (client-side navigation)

**AI and Document Processing:**
- Google Generative AI (Gemini 2.5 Flash)
- pdf-parse, pdf-poppler, tesseract.js (PDF extraction/OCR)
- mammoth (DOCX processing)

**Security:**
- jsonwebtoken (JWT authentication)
- bcryptjs (password hashing)

### 4.2.2 Project Structure

```
student-buddy/
├── backend/
│   ├── controllers/      # Business logic
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth, file upload, errors
│   ├── services/        # AI service integration
│   ├── utils/           # Helper functions
│   ├── uploads/temp/    # Temporary file storage
│   ├── .env             # Environment variables
│   ├── server.js        # Entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/  # Reusable UI components
    │   ├── pages/       # Full page components
    │   ├── context/     # React Context providers
    │   ├── services/    # API client functions
    │   ├── utils/       # Helper functions
    │   └── main.jsx     # Entry point
    ├── .env             # Environment variables
    └── package.json
```

### 4.2.3 Development Workflow

- Backend: `nodemon` for automatic restart on file changes
- Frontend: Vite's hot module replacement for instant updates
- MongoDB: Local instance via MongoDB Community Server
- Testing: Postman for API endpoint testing

---

## 4.3 Backend Implementation

### 4.3.1 Server Architecture

The backend follows an MVC (Model-View-Controller) pattern adapted for REST API development.

**Server Entry Point (server.js):**

Key configuration:
- CORS restricted to localhost:5173 (frontend) for security
- Body parser limit: 20MB for large notes
- MongoDB connection with connection pooling

**[CODE SNIPPET 4.1: Server initialization with Express setup, MongoDB connection, middleware registration, route mounting]**

### 4.3.2 Database Schema Implementation

**User Schema (models/User.js):**

Key features:
- Pre-save middleware hashes passwords (bcrypt, 10 salt rounds)
- Password field excluded by default in queries
- Custom `comparePassword()` method for authentication

**[CODE SNIPPET 4.2: User schema with fields, password hashing middleware, comparePassword method]**

**Note Schema (models/Note.js):**

Key features:
- Text index on title and content for full-text search
- Supports rich text (HTML from TipTap editor)
- Optional course and subject for organization

**[CODE SNIPPET 4.3: Note schema with title, content, subject, course reference, user reference, timestamps]**

**QuizResult Schema (models/QuizResult.js):**

Key features:
- Stores complete quiz session (questions, answers, hints, explanations)
- `retakeOf` field tracks quiz retakes
- Indexes optimize query patterns

**[CODE SNIPPET 4.4: QuizResult schema with userId, noteId, questions array, score, percentage, retakeOf]**

**AIGeneratedPracticeExam Schema (models/AIGeneratedPracticeExam.js):**

Key features:
- `topicOrNote` stores full note content for grading reference
- `detailed` array provides per-question feedback (mark 0-10, comment, reference)
- Supports multi-note exams via `noteIds` array

**[CODE SNIPPET 4.5: AIGeneratedPracticeExam schema with userId, noteIds, questions, userAnswers, detailed feedback]**

**[FIGURE 4.1: Database relationship diagram showing User → Note, User → QuizResult, User → AIGeneratedPracticeExam, Note → QuizResult]**

### 4.3.3 API Route Structure

**Authentication Routes (/api/auth):**
- `POST /register` - Create account
- `POST /login` - Authenticate, return JWT
- `GET /me` - Get current user profile

**Note Routes (/api/notes):**
- `GET /` - List all user notes
- `GET /:id` - Get single note
- `POST /` - Create note
- `PUT /:id` - Update note
- `DELETE /:id` - Delete note
- `POST /upload/extract-text` - Upload document, extract text

**AI Routes (/api/ai):**
- `POST /generate-quiz` - Generate quiz from note
- `POST /explain` - Get AI explanation
- `POST /summarize` - Summarize note

**Practice Exam Routes (/api/practice-exam):**
- `POST /start` - Generate exam
- `POST /submit/:examId` - Submit for grading
- `GET /:examId` - Get results
- `GET /history` - Get assessment history

### 4.3.4 Middleware Implementation

**Authentication Middleware (middleware/auth.js):**

Process:
1. Extract token from Authorization header
2. Verify token using JWT secret
3. Decode payload to get user ID
4. Attach user object to request
5. Return 401 if token missing/invalid

**[CODE SNIPPET 4.6: Authentication middleware with JWT verification, user extraction, error handling]**

**File Upload Middleware:**

Configured using `multer`:
- Destination: `/uploads/temp`
- Unique filenames with timestamps
- File type filter: PDF, DOCX, TXT, MD only
- Size limit: 500MB

### 4.3.5 Document Processing

**Text Extraction Workflow:**

**[FIGURE 4.2: Flowchart showing document processing: upload → type detection → PDF (text/OCR) / DOCX / TXT → return text]**

**For PDF Files:**
1. Attempt text extraction (pdf-parse)
2. If text < 100 chars → scanned PDF detected
3. Convert pages to PNG (pdf-poppler)
4. Run OCR on each image (tesseract.js, limited to 50 pages)
5. Combine text from all pages
6. Clean up temporary images
7. Return combined text

**For DOCX:** Use mammoth library to extract text directly

**For TXT/MD:** Read file contents directly (Node.js `fs` module)

**[CODE SNIPPET 4.7: OCR extraction function with PDF-to-image conversion and Tesseract processing]**

Performance Considerations:
- OCR is expensive (30-60 seconds for large PDFs)
- Page limit (50 pages) prevents timeouts
- Processing time logged for monitoring

### 4.3.6 AI Service Integration

**Gemini API Client (services/aiService.js):**

**[CODE SNIPPET 4.8: AIService class with API key rotation, retry logic, generateResponse method]**

**Key Features:**

1. **API Key Rotation:**
   - Maintains multiple Gemini API keys
   - Automatically switches on rate limit (429/403 errors)
   - Tracks current key index

2. **Retry Logic:**
   - Failed calls retry up to 3 times
   - Handles transient network errors gracefully

3. **Core Methods:**
   - `generateResponse(prompt)` - Core AI generation with key rotation
   - `generateQuizFromNote(noteContent)` - Generate MCQ questions
   - `generatePracticeQuestions(topicOrNote, isNoteBased)` - Generate open-ended questions
   - `gradePracticeExam(questions, userAnswers, noteContent)` - AI grading with feedback

---

## 4.4 Frontend Implementation

### 4.4.1 React Application Structure

**Component Organization:**
- `/src/components`: Reusable UI (buttons, modals, cards)
- `/src/pages`: Full pages (Notes, Study, PracticeExam)
- `/src/context`: React Context providers (AuthContext, ThemeContext)
- `/src/services`: API client functions
- `/src/utils`: Helper functions (axios with interceptors)

**Routing Configuration:**

**[CODE SNIPPET 4.9: React Router with public routes (login, register) and protected routes (notes, study, practice-exam)]**

**State Management:**
- React Context API for global state (authenticated user)
- Component-level `useState` for UI-specific state
- No Redux (complexity doesn't justify overhead)

### 4.4.2 Key Page Components

**Notes Page (pages/Notes.jsx):**

**[FIGURE 4.3: Screenshot of Notes page with note cards grid, search bar, filter options, action buttons]**

Features:
- Grid view of all user notes
- Search bar (filter by title/content)
- Filter by course and subject
- Note card displays: title, excerpt, last modified date
- Actions: view, edit, delete, generate quiz, generate practice exam

**Study Page - Quiz Mode (pages/Study.jsx):**

**[FIGURE 4.4: Screenshot of quiz interface with question, multiple-choice options, hint display, progress indicator]**

Features:
- Progress indicator (Question 3 of 15)
- Clear question typography
- Answer options (radio buttons)
- Two-stage feedback:
  - 1st incorrect: Shows hint + "Try again"
  - 2nd incorrect: Shows correct answer + explanation
  - Correct: Shows "Correct!" + explanation
- 8-minute countdown timer
- Quiz results summary at end

**Practice Exam Page (pages/PracticeExamPage.jsx):**

**[FIGURE 4.5: Screenshot of practice exam setup with note selection interface, "Generate Practice Exam" button]**

**Practice Exam Questions Page (pages/PracticeExamQuestionsPage.jsx):**

**[FIGURE 4.6: Screenshot of exam interface with question navigation grid, current question with textarea, progress bar]**

Features:
- All 15 questions accessible via navigation grid
- Large textarea for each answer (Markdown support)
- Visual indicators: answered (green), unanswered (gray), current (blue)
- Submit button with confirmation dialog

**Practice Exam Results Page (pages/PracticeExamResultsPage.jsx):**

**[FIGURE 4.7: Screenshot of results page with circular score indicator, overall feedback, detailed question-by-question breakdown]**

Features:
- Circular progress indicator (percentage score)
- Overall AI feedback summary
- Detailed per-question breakdown:
  - Student's answer
  - Mark out of 10
  - AI feedback comment
  - Reference to note content

### 4.4.3 Component Implementation Patterns

**Data Fetching Pattern:**

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

**Error Handling:**
- API errors displayed via toast notifications
- Network errors show "Please check connection"
- Authentication errors (401) redirect to login

### 4.4.4 Styling and Responsive Design

**Tailwind CSS Implementation:**
- Utility classes applied directly in JSX
- Common patterns extracted into reusable components

**Responsive Breakpoints:**
- Mobile: < 640px (single column)
- Tablet: 640px - 1024px (two columns)
- Desktop: > 1024px (three columns, sidebar)

**Design System:**
- Primary: Blue/Indigo (buttons, links)
- Success: Green (correct answers)
- Error: Red (incorrect answers, errors)
- Neutral: Gray scale (text, backgrounds)

**Dark Mode:**
- Fully implemented (Tailwind's `dark:` prefix)
- Theme toggle in settings
- Preference stored in localStorage

---

## 4.5 AI Integration and Prompt Engineering

### 4.5.1 Prompt Design Philosophy

Effectiveness depends on AI-generated content quality. Prompt engineering went through six major iterations.

**Core Principles:**
1. **Explicit Constraints**: "Use ONLY information from notes"
2. **Structured Output**: Request JSON format with explicit schema
3. **Context Richness**: Include full note content (up to 400K characters)
4. **Role Definition**: Begin with system message defining AI's role
5. **Quality Criteria**: Specify what makes good questions

### 4.5.2 Quiz Generation Prompts

**[CODE SNIPPET 4.10: Quiz generation prompt with system role, requirements list, note content insertion, JSON response format]**

**Iterative Refinements:**
- Iteration 1-2: Basic prompts → generic questions
- Iteration 3: Added "use ONLY notes" → reduced hallucinations
- Iteration 4: Specified distractor quality → improved difficulty
- Iteration 5: Added hint constraints → hints more helpful
- Iteration 6: Enhanced explanation requirements → better pedagogical feedback

### 4.5.3 Practice Exam Grading Prompts

**Grading Philosophy:**  
AI instructed to be "fair but rigorous", award partial credit, provide constructive feedback.

**[CODE SNIPPET 4.11: Grading prompt with scoring scale (0-10), feedback requirements (strengths, weaknesses, suggestions), JSON format]**

**Feedback Structure:**
- **Strengths**: What student got right
- **Weaknesses**: What student got wrong or missed
- **Suggestions**: How to improve

This ensures feedback is actionable, not just evaluative.

### 4.5.4 AI Hallucination Mitigation

**Problem:**  
Early testing revealed AI sometimes introduced facts not in student notes.

**Solutions Implemented:**
1. Explicit prompt constraints (repeated emphasis on "use ONLY note content")
2. User feedback mechanism (report bad questions)
3. Multiple key rotation (switch if one produces poor output)
4. Context window management (limit to ~400K characters)

**Remaining Limitations:**  
Despite mitigations, occasional hallucinations still occur.

### 4.5.5 Hint Generation Strategy

**Requirement:**  
Hints must help without revealing answers, preserving productive struggle.

**Prompt Instructions:**  
"Generate a minimal hint that guides thinking toward the answer without using any keywords from the correct answer itself. The hint should prompt retrieval by suggesting relevant concepts or asking a leading question."

**Example:**
- Question: "What is the powerhouse of the cell?"
- Bad hint: "It produces ATP" (reveals answer)
- Good hint: "Think about which organelle is responsible for energy production"

---

## 4.6 Security and Authentication

### 4.6.1 Authentication Flow

**Registration Process:**
1. User submits username, email, password
2. Frontend validates (all fields present, email format, password ≥ 6 chars)
3. POST to `/api/auth/register`
4. Backend validates again
5. Check if username/email exists
6. Hash password (bcrypt, 10 salt rounds)
7. Create User document in MongoDB
8. Generate JWT token (user ID as payload)
9. Return token + user profile
10. Frontend stores token in localStorage
11. Redirect to dashboard

**Login Process:**
1. User submits email and password
2. POST to `/api/auth/login`
3. Backend finds user by email
4. Compare password with hash (bcrypt)
5. If match: generate JWT and return
6. If no match: return 401 Unauthorized
7. Frontend stores token and redirects

**Protected Route Access:**
1. Frontend attaches token to Authorization header: `Bearer <token>`
2. Backend auth middleware extracts and verifies token
3. If valid: decode payload, attach user ID to request
4. If invalid/expired: return 401
5. Frontend catches 401, clears token, redirects to login

**[FIGURE 4.8: Authentication flow diagram showing registration, login, protected route access]**

### 4.6.2 Security Measures

**Password Security:**
- Minimum 6 characters
- Hashed with bcrypt (10 salt rounds)
- Password field excluded from query results
- Never sent in API responses

**JWT Security:**
- Secret key in environment variable
- Token payload contains only user ID
- Signed with HS256 algorithm
- 24-hour expiration

**Input Validation:**
- All inputs validated on backend
- Mongoose schema validation (required fields, min/max lengths)
- Text input sanitization

**File Upload Security:**
- File type whitelist (PDF, DOCX, TXT, MD only)
- Size limit (500MB max)
- Unique generated filenames
- Temporary files deleted after processing

**CORS Configuration:**
- Restricted to localhost:5173 (frontend origin)
- Credentials enabled only for trusted origin

### 4.6.3 Data Privacy

**User Data:**
- User accounts isolated (can only access own notes/quizzes)
- No sharing features (no data leakage between users)

**Note Content Privacy:**
- All notes private to owning user
- No public access or cross-user search

**Gemini API Data Handling:**
- Note content sent to Google's Gemini API for processing
- Google's privacy policy applies
- No long-term storage by Google (per API terms)

---

## 4.7 Testing and Quality Assurance

### 4.7.1 Testing Strategy

**Manual Testing:**  
Primary approach during development. Each feature tested manually after implementation and after changes.

**Test Scenarios Covered:**

**Authentication:**
- Register with valid data → success
- Register with existing username/email → error
- Login with correct credentials → success
- Login with wrong password → error
- Access protected route without token → redirect to login

**Note Management:**
- Create note manually → saves correctly
- Upload PDF (text-based) → extracts text
- Upload PDF (scanned) → OCR extracts text
- Upload DOCX → extracts text
- Edit note → saves changes
- Delete note → removes from database
- Search notes → returns matching results

**Quiz Generation:**
- Generate from short note (< 100 words) → error message
- Generate from medium note (500 words) → produces 15 questions
- Check question quality → manually verify relevance

**Quiz Session:**
- Answer correctly (1st attempt) → shows "Correct" + explanation
- Answer incorrectly (1st attempt) → shows hint
- Answer incorrectly (2nd attempt) → shows full explanation
- Complete quiz → displays results summary

**Practice Exam:**
- Generate from single note → produces 15 questions
- Generate from multiple notes → includes content from all
- Submit exam → AI assigns appropriate scores
- Check feedback quality → manually verify constructiveness

**Cross-Browser Testing:**  
Tested on Chrome, Firefox, Safari, Edge. Minor CSS inconsistencies in Safari (flexbox behavior) fixed with vendor prefixes.

**Responsive Testing:**  
Tested at breakpoints: Mobile (375px), Tablet (768px), Desktop (1920px). Adjusted layouts for better mobile experience.

### 4.7.2 Bug Tracking and Resolution

**Major Bugs Encountered:**

**Bug 1: OCR Processing Timeout**
- Issue: Large scanned PDFs (50+ pages) caused server timeout
- Solution: Limited OCR to first 50 pages, added progress logging

**Bug 2: Duplicate Quiz Questions**
- Issue: Gemini occasionally returned duplicate questions
- Solution: Added deduplication filter checking question text similarity

**Bug 3: Token Not Persisting**
- Issue: Users logged out on page refresh
- Solution: Added localStorage persistence for token

**Bug 4: Assessment Tracker Wrong Scores**
- Issue: Tracker showed scores from different notes
- Solution: Fixed MongoDB query to properly match noteIds array

### 4.7.3 Performance Optimization

**Identified Bottlenecks:**

1. **Quiz Generation Speed**: 15 questions took 10-15 seconds
   - Accepted: Gemini API response time unavoidable
   - Mitigation: Added progress indicator, loading messages

2. **Dashboard Load Time**: Fetching all notes took 2-3 seconds
   - Solution: Implemented pagination (20 notes per page)

3. **Search Performance**: Text search on 100+ notes was slow
   - Solution: Added MongoDB text index on title and content fields

**Code Optimization:**
- Removed unused dependencies (reduced bundle size)
- Implemented code splitting for routes (React.lazy)
- Memoized expensive calculations in React components

---

## 4.8 Summary

This chapter described the complete implementation of Student Buddy:

**Backend Implementation:**
- RESTful API with Express.js handling authentication, note management, AI integration
- MongoDB database with optimized schemas (users, notes, quiz results, practice exams)
- Document processing pipeline (PDF with OCR, DOCX, TXT, MD)
- AI service integration with Gemini API (automatic key rotation, retry logic)

**Frontend Implementation:**
- React-based single-page application with responsive design
- Intuitive interfaces for note management, quiz sessions, practice exams
- Two-stage hint system preserving productive struggle
- Assessment tracking visualizing per-note performance

**AI Integration:**
- Sophisticated prompt engineering (six iterations for quality improvement)
- Note-grounded generation ensuring questions test actual study material
- AI grading with detailed, constructive feedback
- Hallucination mitigation strategies

**Security:**
- JWT-based authentication with bcrypt password hashing
- Input validation and sanitization
- File upload security (type whitelisting, size limits)
- CORS configuration restricting access to trusted origins

**Testing:**
- Comprehensive manual testing across all features
- Cross-browser and responsive testing
- Bug tracking and resolution
- Performance optimization

The implemented system successfully addresses research gaps identified in Chapter 2 by providing an integrated, note-grounded retrieval practice platform that reduces friction, maintains pedagogical effectiveness, and supports metacognitive awareness through progress tracking.

---

**[End of Chapter 4]**

---

**Note on Figures and Code Snippets:**

The following should be inserted at indicated locations:
- **Figure 4.1**: Database relationship diagram
- **Figure 4.2**: Document processing flowchart
- **Figure 4.3-4.7**: Screenshots of key pages
- **Figure 4.8**: Authentication flow diagram
- **Code Snippets 4.1-4.11**: Key code implementations
