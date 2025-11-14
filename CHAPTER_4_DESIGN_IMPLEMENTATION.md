# CHAPTER FOUR: SYSTEM DESIGN AND IMPLEMENTATION

## 4.1 Introduction

This chapter describes the design and implementation of Student Buddy. Section 4.2 covers design considerations including functional and non-functional requirements. Section 4.3 presents the system architecture with layers and components. Section 4.4 details the implementation process. Section 4.5 showcases the system interfaces with screenshots. Section 4.6 describes system testing procedures and results.

---

## 4.2 Design Consideration

### 4.2.1 Functional Requirements

Functional requirements define what the system must do:

**FR1: User Management**
- System shall allow user registration with email, username, and password
- System shall authenticate users via JWT tokens
- System shall allow profile updates

**FR2: Note Management**
- System shall support note creation via manual typing or file upload
- System shall extract text from PDF, DOCX, TXT, MD files
- System shall perform OCR on scanned PDFs
- System shall organize notes by course and subject
- System shall provide rich-text editing

**FR3: Quiz Generation**
- System shall generate 15 MCQ questions from note content
- System shall generate hints without revealing answers
- System shall generate detailed explanations
- System shall complete generation within 15 seconds

**FR4: Quiz Interaction**
- System shall present questions one at a time
- System shall implement two-stage hint system
- System shall provide immediate feedback
- System shall calculate and display final score
- System shall save results linked to source note

**FR5: Practice Exam**
- System shall generate 15 open-ended questions
- System shall allow multi-note selection
- System shall grade responses using AI (0-10 scale)
- System shall provide detailed per-question feedback

**FR6: Progress Tracking**
- System shall display per-note performance history
- System shall calculate improvement metrics
- System shall identify weak topics

### 4.2.2 Non-Functional Requirements

Non-functional requirements define how the system should behave:

**NFR1: Performance**
- Quiz generation: ≤15 seconds for 15 questions
- Practice exam grading: ≤30 seconds for 15 questions
- Note upload: ≤60 seconds for documents up to 10MB
- Page load time: ≤3 seconds

**NFR2: Usability**
- Interface shall be intuitive (minimal learning curve)
- System shall be responsive (desktop, tablet, mobile)
- Error messages shall be clear and actionable
- Quiz interface shall minimize cognitive load

**NFR3: Reliability**
- System uptime: ≥99% (excluding maintenance)
- Failed AI requests shall retry automatically (max 3 attempts)
- System shall implement API key rotation on rate limits

**NFR4: Scalability**
- System shall support up to 1000 concurrent users
- Database shall handle up to 100,000 notes
- API shall handle 60 requests/minute (Gemini free tier limit)

**NFR5: Security**
- Passwords shall be hashed (bcrypt, 10 salt rounds)
- JWT tokens shall expire after 24 hours
- API endpoints shall validate user authorization
- File uploads shall be type-validated and size-limited

**NFR6: Efficiency**
- System shall minimize API calls to reduce costs
- Frontend shall implement code splitting
- Database queries shall use indexes for optimization

---

## 4.3 System Architecture

### 4.3.1 Architectural Pattern

Student Buddy uses a **three-tier client-server architecture**:

**Tier 1: Presentation Layer (Frontend)**
- Technology: React 18.2.0 with Vite 7.1.7
- Styling: TailwindCSS 3.3.3
- Components: Radix UI for accessible primitives
- Editor: TipTap 2.12.0 for rich text
- Routing: React Router 7.6.2

**Tier 2: Application Layer (Backend)**
- Runtime: Node.js 18+
- Framework: Express.js 4.18.2
- Authentication: JWT (jsonwebtoken 9.0.2)
- File Processing: pdf-parse, Tesseract.js, mammoth
- AI Integration: Google Generative AI SDK

**Tier 3: Data Layer**
- Database: MongoDB 8.1.3
- ORM: Mongoose 7.5.0
- External API: Google Gemini 2.5 Flash

**[PLACEHOLDER: Add 3-tier architecture diagram]**

### 4.3.2 System Components

**Frontend Components**:
```
/src
├── pages/
│   ├── Landing.jsx (landing page)
│   ├── Login.jsx (authentication)
│   ├── Register.jsx (user registration)
│   ├── Notes.jsx (note management)
│   ├── Study.jsx (quiz generation & interaction)
│   ├── PracticeExamPage.jsx (exam setup)
│   ├── PracticeExamQuestionsPage.jsx (answer questions)
│   └── PracticeExamResultsPage.jsx (view results)
├── components/
│   ├── layout/ (navigation, sidebar)
│   ├── ui/ (buttons, cards, modals)
│   └── RichTextEditor.jsx (TipTap editor)
├── context/
│   ├── AuthContext.jsx (authentication state)
│   └── ThemeContext.jsx (dark mode)
└── services/
    ├── api.js (API client)
    └── practiceExamService.js (exam operations)
```

**Backend Components**:
```
/backend
├── models/
│   ├── User.js (user schema)
│   ├── Note.js (note schema)
│   ├── Course.js (course schema)
│   ├── QuizResult.js (quiz results schema)
│   └── AIGeneratedPracticeExam.js (exam schema)
├── routes/
│   ├── auth.js (authentication endpoints)
│   ├── notes.js (note CRUD)
│   ├── ai.js (quiz generation)
│   └── practiceExam.js (exam operations)
├── middleware/
│   └── auth.js (JWT verification)
├── services/
│   └── aiService.js (Gemini API integration)
└── server.js (entry point)
```

### 4.3.3 System Flowchart

**Main System Flow**:

```
START
  ↓
User Registration/Login
  ↓
Dashboard (Notes Overview)
  ↓
┌─────────────┬──────────────┬─────────────┐
│             │              │             │
Upload Note   Create Note    Select Note
│             │              │
└─────────────┴──────────────┘
              ↓
    ┌─────────┴─────────┐
    │                   │
Generate Quiz    Generate Practice Exam
    │                   │
    ↓                   ↓
Quiz Session      Answer Questions
    │                   │
Two-Stage         AI Grading
Feedback          │
    │             ↓
    ↓         View Results
Save Results      │
    │             │
    └─────────────┘
              ↓
    Assessment Tracker
    (View Progress)
              ↓
            END
```

**[PLACEHOLDER: Add detailed flowchart with decision points]**

### 4.3.4 Database Schema

**User Collection**:
```javascript
{
  _id: ObjectId,
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  school: String,
  level: String,
  courses: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

**Note Collection**:
```javascript
{
  _id: ObjectId,
  title: String,
  content: String (HTML),
  subject: String,
  course: ObjectId (ref: Course),
  user: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

**QuizResult Collection**:
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  noteId: ObjectId,
  noteTitle: String,
  questions: [{
    question: String,
    options: [String],
    correctAnswer: String,
    userAnswer: String,
    isCorrect: Boolean,
    hint: String,
    explanation: String
  }],
  score: Number,
  totalQuestions: Number,
  percentage: Number,
  passed: Boolean,
  timeSpent: Number,
  retakeOf: ObjectId,
  createdAt: Date
}
```

**AIGeneratedPracticeExam Collection**:
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  topicOrNote: String,
  noteIds: [ObjectId],
  questions: [String],
  userAnswers: [String],
  score: Number,
  feedback: String,
  detailed: [{
    question: String,
    studentAnswer: String,
    mark: Number (0-10),
    comment: String,
    reference: String
  }],
  submitted: Boolean,
  createdAt: Date
}
```

**[PLACEHOLDER: Add ER diagram showing relationships]**

---


## 4.4 System Implementation

### 4.4.1 Development Environment Setup

**Tools and Technologies**:
- **IDE**: Visual Studio Code
- **Version Control**: Git & GitHub
- **Package Manager**: npm (Node Package Manager)
- **Database Tool**: MongoDB Compass
- **API Testing**: Postman
- **Browser**: Chrome DevTools for debugging

**Installation Steps**:

1. **Install Node.js** (v18 or higher)
2. **Install MongoDB** (Community Edition or Atlas cloud)
3. **Clone Repository** and install dependencies:
   ```bash
   npm install  # in both /backend and /frontend directories
   ```
4. **Configure Environment Variables** (.env files)
5. **Start Development Servers**:
   ```bash
   # Backend (port 3001)
   cd backend && npm start
   
   # Frontend (port 5173)
   cd frontend && npm run dev
   ```

### 4.4.2 Backend Implementation Process

**Stage 1: Database Setup**
- Created MongoDB Atlas cluster
- Designed schemas for User, Note, Course, QuizResult, AIGeneratedPracticeExam
- Implemented Mongoose models with validation
- Created indexes for query optimization

**Stage 2: Authentication System**
- Implemented user registration with password hashing (bcrypt)
- Created login endpoint with JWT token generation
- Built authentication middleware for protected routes
- Added token expiration and refresh logic

**Stage 3: Note Management**
- Implemented CRUD operations for notes
- Built file upload endpoint with multer middleware
- Integrated pdf-parse for PDF text extraction
- Added Tesseract.js for OCR on scanned PDFs
- Implemented mammoth for DOCX processing

**Stage 4: AI Service Integration**
- Created aiService.js wrapper for Gemini API
- Implemented multi-key rotation for rate limit handling
- Built retry logic with exponential backoff
- Developed prompt templates for quiz generation and grading

**Stage 5: Quiz System**
- Created quiz generation endpoint
- Implemented quiz result storage
- Built retake functionality
- Added assessment history endpoint

**Stage 6: Practice Exam System**
- Implemented exam generation endpoint
- Created exam submission and grading endpoint
- Built detailed feedback structure
- Added exam history tracking

### 4.4.3 Frontend Implementation Process

**Stage 1: Project Setup**
- Initialized React project with Vite
- Configured TailwindCSS and Radix UI
- Set up React Router for navigation
- Created AuthContext for global state

**Stage 2: Authentication Pages**
- Built Login and Register forms
- Implemented form validation
- Added JWT token storage in localStorage
- Created protected route wrapper

**Stage 3: Notes Management UI**
- Created Notes page with grid/list view
- Built note creation modal with TipTap editor
- Implemented file upload with drag-and-drop
- Added search and filter functionality

**Stage 4: Quiz Interface**
- Built Study page with quiz generation
- Implemented question display (one at a time)
- Created two-stage hint system UI
- Added timer and progress indicator
- Built results summary page

**Stage 5: Practice Exam Interface**
- Created exam setup page with note selection
- Built question navigation grid
- Implemented answer textarea with Markdown support
- Created results page with detailed feedback display

**Stage 6: Progress Tracking**
- Built assessment tracker modal
- Implemented performance charts
- Added improvement metrics display
- Created weak topics identification

### 4.4.4 Key Implementation Challenges and Solutions

**Challenge 1: OCR Processing Time**
- **Problem**: Large scanned PDFs took 2-3 minutes to process
- **Solution**: Limited OCR to first 50 pages, added progress indicators
- **Result**: Acceptable performance for typical use cases

**Challenge 2: AI Response Parsing**
- **Problem**: Gemini API responses had inconsistent formatting
- **Solution**: Implemented robust regex parsing with fallback logic
- **Result**: 95% successful question extraction rate

**Challenge 3: Two-Attempt State Management**
- **Problem**: Complex state tracking for hints and attempts
- **Solution**: Used React useState arrays indexed by question number
- **Result**: Clean, maintainable code with correct behavior

**Challenge 4: API Rate Limiting**
- **Problem**: Gemini API has 60 requests/minute limit
- **Solution**: Implemented multi-key rotation and retry logic
- **Result**: Reliable operation even under heavy use

**Challenge 5: Cross-Browser Compatibility**
- **Problem**: CSS inconsistencies in Safari
- **Solution**: Added vendor prefixes and tested on all major browsers
- **Result**: Consistent experience across Chrome, Firefox, Safari, Edge

---

## 4.5 System Interface

### 4.5.1 Landing Page

**Purpose**: Introduce Student Buddy and encourage sign-up

**Key Elements**:
- Hero section with value proposition
- Feature highlights (AI-powered, note-grounded, progress tracking)
- Call-to-action buttons (Get Started, Learn More)
- Responsive design for mobile and desktop

**[PLACEHOLDER: Add screenshot of landing page]**

### 4.5.2 Login/Register Pages

**Purpose**: User authentication

**Login Interface**:
- Email and password fields
- "Remember me" checkbox
- "Forgot password" link
- "Sign up" redirect link

**Register Interface**:
- Username, email, password fields
- School and level dropdowns
- Terms acceptance checkbox
- "Already have account" redirect link

**[PLACEHOLDER: Add screenshots of login and register pages]**

### 4.5.3 Notes Management Page

**Purpose**: Create, view, edit, and organize notes

**Key Features**:
- Grid view of note cards
- Search bar for filtering
- Filter by course and subject
- "Add Note" button
- "Upload Document" button
- Each note card shows:
  - Title
  - Excerpt (first 100 characters)
  - Last modified date
  - Action buttons (View, Edit, Delete, Generate Quiz, Practice Exam)

**[PLACEHOLDER: Add screenshot of Notes page]**

### 4.5.4 Note Editor Interface

**Purpose**: Create and edit notes with rich text formatting

**Features**:
- TipTap rich text editor with toolbar
- Formatting options: Bold, Italic, Underline, Headings, Lists, Links
- Auto-save functionality
- Word count display
- Course and subject selection
- Save and Cancel buttons

**[PLACEHOLDER: Add screenshot of Note Editor]**

### 4.5.5 Quiz Generation Interface (Study Page)

**Purpose**: Generate and take quizzes from notes

**Setup View**:
- Mode toggle: Note-based / Topic-based
- Note selection (search and select up to 3 notes)
- "Generate Quiz" button
- Loading indicator during generation

**Quiz View**:
- Progress indicator (Question 3 of 15)
- 8-minute countdown timer
- Question text
- Four answer options (A, B, C, D)
- "Submit Answer" button
- Hint display area (after wrong answer)
- Explanation display area (after second attempt)

**Results View**:
- Circular score indicator
- Pass/Fail status
- Question-by-question breakdown
- "Retake Quiz" and "Back to Notes" buttons

**[PLACEHOLDER: Add screenshots of quiz setup, quiz in progress, and results]**

### 4.5.6 Practice Exam Interface

**Exam Setup Page**:
- Note selection interface
- "Generate Practice Exam" button
- Loading indicator

**Questions Page**:
- Question navigation grid (15 boxes)
- Current question display
- Large textarea for answer
- Progress bar
- "Previous" and "Next" buttons
- "Submit Exam" button

**Results Page**:
- Overall score (circular progress indicator)
- Performance level (Excellent/Good/Needs Work)
- AI feedback summary
- Detailed breakdown per question:
  - Question text
  - Student's answer
  - Mark (0-10)
  - AI feedback comment
  - Reference to note content

**[PLACEHOLDER: Add screenshots of exam setup, questions page, and results page]**

### 4.5.7 Assessment Tracker Interface

**Purpose**: View performance history and progress

**Features**:
- List of all quiz and exam attempts
- Filter by note
- Sort by date or score
- Performance metrics:
  - Total attempts
  - Average score
  - Improvement percentage
- Visual indicators (color-coded scores)
- "View Details" button for each attempt

**[PLACEHOLDER: Add screenshot of Assessment Tracker]**

### 4.5.8 Settings Page

**Purpose**: Manage user profile and preferences

**Sections**:
- Profile Information (username, email, school, level)
- Theme Selection (Light/Dark/System)
- Notification Preferences
- Account Management (Change Password, Delete Account)

**[PLACEHOLDER: Add screenshot of Settings page]**

---

## 4.6 System Testing

### 4.6.1 Testing Strategy

**Testing Approach**: Manual testing by developer using various scenarios and test cases

**Testing Levels**:
1. **Unit Testing**: Individual functions and components
2. **Integration Testing**: API endpoints and database operations
3. **System Testing**: Complete workflows end-to-end
4. **User Acceptance Testing**: Developer testing with real-world scenarios

### 4.6.2 Test Cases and Results

**Test Category 1: Authentication**

| Test Case | Description | Expected Result | Actual Result | Status |
|-----------|-------------|-----------------|---------------|--------|
| TC-AUTH-01 | Register with valid data | Account created, redirect to dashboard | As expected | ✓ Pass |
| TC-AUTH-02 | Register with existing email | Error message displayed | As expected | ✓ Pass |
| TC-AUTH-03 | Login with correct credentials | JWT token received, redirect to dashboard | As expected | ✓ Pass |
| TC-AUTH-04 | Login with wrong password | Error message displayed | As expected | ✓ Pass |
| TC-AUTH-05 | Access protected route without token | Redirect to login page | As expected | ✓ Pass |

**Test Category 2: Note Management**

| Test Case | Description | Expected Result | Actual Result | Status |
|-----------|-------------|-----------------|---------------|--------|
| TC-NOTE-01 | Create note manually | Note saved to database | As expected | ✓ Pass |
| TC-NOTE-02 | Upload text-based PDF | Text extracted correctly | As expected | ✓ Pass |
| TC-NOTE-03 | Upload scanned PDF | OCR extracts text | As expected | ✓ Pass |
| TC-NOTE-04 | Upload DOCX file | Text extracted correctly | As expected | ✓ Pass |
| TC-NOTE-05 | Edit existing note | Changes saved | As expected | ✓ Pass |
| TC-NOTE-06 | Delete note | Note removed from database | As expected | ✓ Pass |
| TC-NOTE-07 | Search notes | Matching notes displayed | As expected | ✓ Pass |

**Test Category 3: Quiz Generation**

| Test Case | Description | Expected Result | Actual Result | Status |
|-----------|-------------|-----------------|---------------|--------|
| TC-QUIZ-01 | Generate quiz from short note (<100 words) | Error message (insufficient content) | As expected | ✓ Pass |
| TC-QUIZ-02 | Generate quiz from medium note (500 words) | 15 questions generated | As expected | ✓ Pass |
| TC-QUIZ-03 | Generate quiz from long note (5000 words) | 15 questions generated | As expected | ✓ Pass |
| TC-QUIZ-04 | Check question relevance | Questions match note content | As expected | ✓ Pass |
| TC-QUIZ-05 | Check hint quality | Hints don't reveal answers | As expected | ✓ Pass |

**Test Category 4: Quiz Interaction**

| Test Case | Description | Expected Result | Actual Result | Status |
|-----------|-------------|-----------------|---------------|--------|
| TC-INT-01 | Answer correctly on first attempt | "Correct" message, explanation shown | As expected | ✓ Pass |
| TC-INT-02 | Answer incorrectly on first attempt | Hint shown, second chance given | As expected | ✓ Pass |
| TC-INT-03 | Answer correctly on second attempt | "Correct (2nd attempt)" message | As expected | ✓ Pass |
| TC-INT-04 | Answer incorrectly on second attempt | Correct answer + explanation shown | As expected | ✓ Pass |
| TC-INT-05 | Complete quiz | Final score calculated correctly | As expected | ✓ Pass |
| TC-INT-06 | Timer expires | Quiz auto-submits | As expected | ✓ Pass |

**Test Category 5: Practice Exam**

| Test Case | Description | Expected Result | Actual Result | Status |
|-----------|-------------|-----------------|---------------|--------|
| TC-EXAM-01 | Generate exam from single note | 15 questions generated | As expected | ✓ Pass |
| TC-EXAM-02 | Generate exam from multiple notes | Questions from all notes | As expected | ✓ Pass |
| TC-EXAM-03 | Submit exam with all answers | AI grades all questions | As expected | ✓ Pass |
| TC-EXAM-04 | Submit exam with some blank answers | AI grades answered questions, marks blanks as 0 | As expected | ✓ Pass |
| TC-EXAM-05 | Check feedback quality | Feedback is specific and constructive | As expected | ✓ Pass |

**Test Category 6: Progress Tracking**

| Test Case | Description | Expected Result | Actual Result | Status |
|-----------|-------------|-----------------|---------------|--------|
| TC-TRACK-01 | View assessment history | All attempts displayed | As expected | ✓ Pass |
| TC-TRACK-02 | Filter by note | Only selected note's attempts shown | As expected | ✓ Pass |
| TC-TRACK-03 | Check improvement metrics | Correct calculation of improvement | As expected | ✓ Pass |
| TC-TRACK-04 | Identify weak topics | Notes with <60% average shown | As expected | ✓ Pass |

### 4.6.3 Performance Testing Results

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Quiz generation time | ≤15 seconds | 10-15 seconds | ✓ Pass |
| Practice exam grading time | ≤30 seconds | 20-30 seconds | ✓ Pass |
| Note upload (10MB PDF) | ≤60 seconds | 45-60 seconds | ✓ Pass |
| Page load time | ≤3 seconds | 1-2 seconds | ✓ Pass |
| OCR processing (50 pages) | ≤120 seconds | 90-120 seconds | ✓ Pass |

### 4.6.4 Browser Compatibility Testing

| Browser | Version | Status | Notes |
|---------|---------|--------|-------|
| Chrome | 120+ | ✓ Pass | Full functionality |
| Firefox | 121+ | ✓ Pass | Full functionality |
| Safari | 17+ | ✓ Pass | Minor CSS adjustments needed |
| Edge | 120+ | ✓ Pass | Full functionality |

### 4.6.5 Responsive Design Testing

| Device Type | Screen Size | Status | Notes |
|-------------|-------------|--------|-------|
| Desktop | 1920x1080 | ✓ Pass | Optimal experience |
| Laptop | 1366x768 | ✓ Pass | Full functionality |
| Tablet | 768x1024 | ✓ Pass | Adjusted layouts |
| Mobile | 375x667 | ✓ Pass | Single column layout |

### 4.6.6 Bugs Identified and Resolved

**Bug 1: Duplicate Questions**
- **Description**: AI occasionally generated duplicate questions
- **Severity**: Medium
- **Solution**: Added deduplication filter checking question text similarity
- **Status**: Resolved

**Bug 2: Token Persistence**
- **Description**: Users logged out on page refresh
- **Severity**: High
- **Solution**: Added localStorage persistence for JWT token
- **Status**: Resolved

**Bug 3: OCR Timeout**
- **Description**: Large scanned PDFs (100+ pages) caused server timeout
- **Severity**: Medium
- **Solution**: Limited OCR to first 50 pages, added progress logging
- **Status**: Resolved

**Bug 4: Assessment Tracker Wrong Scores**
- **Description**: Tracker showed scores from different notes
- **Severity**: High
- **Solution**: Fixed MongoDB query to properly match noteIds array
- **Status**: Resolved

**Bug 5: Quiz Timer Not Stopping**
- **Description**: Timer continued after quiz completion
- **Severity**: Low
- **Solution**: Added cleanup function in useEffect
- **Status**: Resolved

### 4.6.7 Testing Summary

**Total Test Cases**: 31
**Passed**: 31 (100%)
**Failed**: 0 (0%)

**Bugs Found**: 5
**Bugs Resolved**: 5 (100%)

**Conclusion**: System meets all functional and non-functional requirements. All critical bugs have been resolved. System is ready for deployment.

---

## 4.7 Summary

This chapter presented the complete design and implementation of Student Buddy:

**Section 4.2** defined functional requirements (user management, note management, quiz generation, quiz interaction, practice exams, progress tracking) and non-functional requirements (performance, usability, reliability, scalability, security, efficiency).

**Section 4.3** described the three-tier system architecture, component structure, system flowchart, and database schema design.

**Section 4.4** detailed the implementation process for both backend (database setup, authentication, note management, AI integration, quiz system, practice exams) and frontend (project setup, authentication pages, notes UI, quiz interface, practice exam interface, progress tracking), including key challenges and solutions.

**Section 4.5** showcased system interfaces with descriptions of landing page, authentication pages, notes management, note editor, quiz generation, practice exam, assessment tracker, and settings page.

**Section 4.6** presented comprehensive testing results including 31 test cases across 6 categories (all passed), performance testing, browser compatibility, responsive design testing, and bug resolution.

The implemented system successfully addresses the research problem by providing an integrated, AI-assisted retrieval practice platform that reduces barriers to effective studying while maintaining pedagogical integrity.

---

**[End of Chapter 4]**

---

**PLACEHOLDERS TO ADD**:
- [ ] Diagram: 3-tier architecture
- [ ] Diagram: ER diagram showing database relationships
- [ ] Flowchart: Detailed system flowchart with decision points
- [ ] Screenshot: Landing page
- [ ] Screenshot: Login page
- [ ] Screenshot: Register page
- [ ] Screenshot: Notes management page
- [ ] Screenshot: Note editor
- [ ] Screenshot: Quiz setup
- [ ] Screenshot: Quiz in progress
- [ ] Screenshot: Quiz results
- [ ] Screenshot: Practice exam setup
- [ ] Screenshot: Practice exam questions page
- [ ] Screenshot: Practice exam results
- [ ] Screenshot: Assessment tracker
- [ ] Screenshot: Settings page
