# CHAPTER FOUR: SYSTEM DESIGN AND IMPLEMENTATION

## 4.1 Introduction

This chapter describes the design and implementation of Student Buddy, translating the methodology and specifications from Chapter 3 into a functional web application.

Section 4.2 covers design considerations including functional and non-functional requirements, addressing both system behavior and quality/performance aspects. Section 4.3 presents the system architecture with detailed explanation of layers, components, and system flowcharts. Section 4.4 details the implementation process, describing all stages required to make the system operational. Section 4.5 showcases the system interfaces with descriptions and screenshots of each major page. Section 4.6 describes system testing procedures, types of tests carried out, and results demonstrating the system meets user requirements.

---

## 4.2 Design Consideration

### 4.2.1 Functional Requirements

Functional requirements define what the system must do - the specific behaviors and functions it must provide.

**FR1: User Management**
- System shall allow user registration with email, username, and password
- System shall authenticate users via JWT tokens with 24-hour expiration
- System shall allow users to update profile information (school, level, courses)
- System shall maintain user session across page refreshes

**FR2: Note Management**
- System shall support note creation via manual typing in rich-text editor
- System shall support note creation via document upload (PDF, DOCX, TXT, MD)
- System shall extract text from uploaded documents automatically
- System shall perform OCR on scanned/image-based PDFs
- System shall allow users to organize notes by course and subject (folders)
- System shall provide search functionality across all notes
- System shall allow editing and deletion of existing notes

**FR3: Quiz Generation**
- System shall generate 15 multiple-choice questions from note content
- System shall generate questions with 4 options (A, B, C, D) each
- System shall create hints that don't contain keywords from correct answers
- System shall generate detailed explanations for each question
- System shall complete generation within 15 seconds
- System shall validate question structure before delivery

**FR4: Quiz Interaction**
- System shall present questions one at a time to minimize cognitive load
- System shall implement two-stage hint system:
  - First incorrect attempt: Show hint, allow second attempt
  - Second incorrect attempt: Show correct answer + explanation
- System shall provide immediate feedback after each answer submission
- System shall include 8-minute countdown timer for focused practice
- System shall calculate and display final score (only first attempts count)
- System shall save quiz results linked to source note

**FR5: Practice Exam**
- System shall generate 15 open-ended questions from note content
- System shall allow selection of multiple notes for exam generation
- System shall provide large textarea for essay-style answers
- System shall support Markdown formatting in answers
- System shall grade responses using AI (0-10 scale per question)
- System shall provide detailed per-question feedback (strengths, weaknesses, suggestions)
- System shall calculate overall percentage score

**FR6: Progress Tracking**
- System shall display per-note performance history
- System shall calculate improvement metrics (comparing recent to previous attempts)
- System shall identify weak topics (notes with <60% average score)
- System shall show attempt counts, average scores, and trends
- System shall support quiz retakes with performance comparison

### 4.2.2 Non-Functional Requirements

Non-functional requirements define how the system should behave - addressing quality and performance characteristics.

**NFR1: Performance**
- Quiz generation shall complete within 15 seconds for 15 questions
- Practice exam grading shall complete within 30 seconds for 15 questions
- Note upload and text extraction shall complete within 60 seconds for documents up to 10MB
- Page load time shall not exceed 3 seconds on standard broadband connection
- System shall handle concurrent requests from multiple users without degradation

**NFR2: Usability**
- Interface shall be intuitive, requiring minimal learning curve
- System shall be responsive, adapting to desktop, tablet, and mobile screens
- Error messages shall be clear and actionable (not technical jargon)
- Quiz interface shall minimize cognitive load (one question per screen)
- Navigation shall be consistent across all pages
- Visual feedback shall confirm user actions (loading states, success messages)

**NFR3: Reliability**
- System uptime shall be ≥99% (excluding scheduled maintenance)
- Failed AI requests shall retry automatically (maximum 3 attempts with exponential backoff)
- System shall implement API key rotation when rate limits are hit
- Database operations shall use transactions where data consistency is critical
- System shall gracefully handle network failures

**NFR4: Scalability**
- System shall support up to 1000 concurrent users without performance degradation
- Database shall efficiently handle up to 100,000 notes
- API shall respect Gemini free tier limit (60 requests/minute)
- System architecture shall allow horizontal scaling if needed

**NFR5: Security**
- Passwords shall be hashed using bcrypt with minimum 10 salt rounds
- JWT tokens shall expire after 24 hours
- API endpoints shall validate user authorization before data access
- File uploads shall be type-validated (whitelist approach)
- File uploads shall be size-limited (500MB maximum)
- CORS shall be restricted to trusted origins only
- User data shall be isolated (no cross-user data access)

**NFR6: Efficiency**
- System shall minimize API calls to reduce costs
- Frontend shall implement code splitting to reduce initial load time
- Database queries shall use indexes for optimization
- Unused dependencies shall be removed to reduce bundle size
- Images and assets shall be optimized for web delivery

---

## 4.3 System Architecture

### 4.3.1 Architectural Pattern

Student Buddy employs a **three-tier client-server architecture** with clear separation of concerns:

**Tier 1: Presentation Layer (Frontend)**
- **Technology**: React 18.2.0 with Vite 7.1.7 build tool
- **Styling**: TailwindCSS 3.3.3 for utility-first styling
- **UI Components**: Radix UI for accessible primitives
- **Rich Text Editor**: TipTap 2.12.0 for note editing
- **Routing**: React Router 7.6.2 for client-side navigation
- **State Management**: React Context API for global state
- **HTTP Client**: Axios with interceptors for API communication

**Tier 2: Application Layer (Backend)**
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18.2 for API routing and middleware
- **Authentication**: JWT (jsonwebtoken 9.0.2) with bcrypt password hashing
- **File Processing**: 
  - pdf-parse for PDF text extraction
  - pdf-poppler for PDF-to-image conversion
  - Tesseract.js 6.0.1 for OCR
  - mammoth 1.6.0 for DOCX processing
- **File Upload**: multer 2.0.0 for multipart/form-data handling
- **AI Integration**: Google Generative AI SDK (@google/generative-ai 0.24.1)

**Tier 3: Data Layer**
- **Database**: MongoDB 8.1.3 (document-oriented NoSQL)
- **ORM**: Mongoose 7.5.0 for data modeling and validation
- **External API**: Google Gemini 2.5 Flash for AI generation
- **Storage**: User accounts, notes, courses, quiz results, practice exams

**Communication Protocol**: RESTful API with JSON data exchange, JWT tokens for authentication

**[PLACEHOLDER: Add 3-tier architecture diagram showing all components and their interactions]**

### 4.3.2 System Components

**Frontend Component Structure**:

```
/src
├── pages/                    # Full page components
│   ├── Landing.jsx          # Landing page
│   ├── Login.jsx            # User login
│   ├── Register.jsx         # User registration
│   ├── Notes.jsx            # Note management
│   ├── Study.jsx            # Quiz generation & interaction
│   ├── PracticeExamPage.jsx           # Exam setup
│   ├── PracticeExamQuestionsPage.jsx  # Answer questions
│   ├── PracticeExamResultsPage.jsx    # View results
│   ├── QuizResultsPage.jsx            # Quiz results
│   └── Settings.jsx         # User settings
├── components/
│   ├── layout/              # Navigation, sidebar
│   ├── ui/                  # Reusable UI (buttons, cards, modals)
│   └── RichTextEditor.jsx   # TipTap editor wrapper
├── context/
│   ├── AuthContext.jsx      # Authentication state
│   └── ThemeContext.jsx     # Dark mode state
├── services/
│   ├── api.js               # API client functions
│   └── practiceExamService.js  # Exam-specific operations
└── utils/
    └── axios.js             # Axios instance with interceptors
```

**Backend Component Structure**:

```
/backend
├── models/                  # Mongoose schemas
│   ├── User.js             # User account schema
│   ├── Note.js             # Note schema
│   ├── Course.js           # Course schema
│   ├── QuizResult.js       # Quiz results schema
│   └── AIGeneratedPracticeExam.js  # Practice exam schema
├── routes/                  # API endpoints
│   ├── auth.js             # Authentication routes
│   ├── notes.js            # Note CRUD operations
│   ├── ai.js               # Quiz generation
│   ├── practiceExam.js     # Practice exam operations
│   └── users.js            # User profile operations
├── middleware/
│   └── auth.js             # JWT verification middleware
├── services/
│   └── aiService.js        # Gemini API integration
├── utils/
│   └── dateParser.js       # Date parsing utilities
└── server.js               # Application entry point
```

### 4.3.3 System Flowchart

**Main System Flow**:

```
START
  ↓
User Registration/Login
  ↓
JWT Token Generated & Stored
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
Quiz Session      Answer Questions (15)
    │                   │
Two-Stage         Submit for AI Grading
Feedback          │
    │             ↓
    ↓         View Detailed Results
Save Results      │
    │             │
    └─────────────┘
              ↓
    Assessment Tracker
    (View Progress & Trends)
              ↓
    ┌─────────┴─────────┐
    │                   │
Retake Quiz      Study Weak Topics
    │                   │
    └─────────┬─────────┘
              ↓
            END
```

**[PLACEHOLDER: Add detailed flowchart with decision points, error handling, and all system paths]**

### 4.3.4 Database Schema

**User Collection**:
```javascript
{
  _id: ObjectId,                    // Primary key
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  school: String,
  level: String,
  courses: [ObjectId],              // References to Course documents
  createdAt: Date,
  updatedAt: Date
}
```

**Note Collection**:
```javascript
{
  _id: ObjectId,
  title: String (required),
  content: String (rich HTML, required),
  subject: String,                  // Folder/category
  course: ObjectId,                 // Reference to Course
  user: ObjectId (required),        // Reference to User
  createdAt: Date,
  updatedAt: Date
}
```

**QuizResult Collection**:
```javascript
{
  _id: ObjectId,
  userId: ObjectId (required),
  noteId: ObjectId,
  noteTitle: String (required),
  questions: [{
    question: String,
    options: [String],              // 4 options for MCQ
    correctAnswer: String,
    userAnswer: String,
    isCorrect: Boolean,
    hint: String,
    explanation: String
  }],
  score: Number,                    // Count of correct answers
  totalQuestions: Number,
  percentage: Number (0-100),
  passed: Boolean,                  // true if percentage >= 60
  timeSpent: Number,                // seconds
  retakeOf: ObjectId,               // Reference to original quiz
  createdAt: Date
}
```

**AIGeneratedPracticeExam Collection**:
```javascript
{
  _id: ObjectId,
  userId: ObjectId (required),
  topicOrNote: String,              // Full note content for grading
  noteIds: [ObjectId],              // References to source notes
  questions: [String],              // 15 open-ended questions
  userAnswers: [String],
  score: Number (0-100),            // Percentage
  feedback: String,                 // Overall AI feedback
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

**[PLACEHOLDER: Add ER diagram showing relationships between all entities]**

---

