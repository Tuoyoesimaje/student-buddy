# Student Buddy - Comprehensive Technical Documentation

## 1. PROJECT OVERVIEW

### 1.1 What This Application Is

Student Buddy is a comprehensive AI-powered study companion platform designed to enhance student learning through intelligent note-taking, automated content generation, and interactive assessment tools. The application serves as a digital study assistant that combines traditional note management with cutting-edge AI capabilities to create personalized learning experiences.

### 1.2 Core Problem Being Solved

Student Buddy addresses several critical challenges in modern education:

1. **Inefficient Study Methods**: Traditional note-taking and review methods are often passive and don't promote deep understanding or long-term retention.

2. **Time-Intensive Content Creation**: Students spend excessive time creating study materials when they could focus on learning.

3. **Lack of Immediate Feedback**: Students often don't receive timely feedback on their understanding of concepts.

4. **Poor Study Habits**: Without structured tools, students struggle to maintain consistent, effective study routines.

5. **Limited Access to Practice Materials**: Finding relevant practice questions and exams is challenging and time-consuming.

### 1.3 Key Capabilities

- **AI-Powered Note Generation**: Automatically create comprehensive study notes from course topics
- **Intelligent Content Analysis**: AI explanations, summaries, and insights from existing notes
- **Interactive Quizzes**: AI-generated quizzes with gamification and progress tracking
- **Practice Exams**: Full-length practice examinations with automated grading
- **Rich Text Note Editor**: Advanced note-taking with formatting and organization
- **Course Management**: Organize study materials by courses, topics, and subjects
- **Study Tools**: Pomodoro timer and retrieval practice techniques
- **Progress Tracking**: Monitor learning progress and identify knowledge gaps

---

## 2. SYSTEM ARCHITECTURE

### 2.1 Technology Stack

**Frontend:**
- Framework: React 18.2.0 with Vite 7.1.7
- UI Library: Tailwind CSS 3.3.3 with Radix UI components
- Routing: React Router DOM 7.6.2
- Rich Text Editor: TipTap 2.12.0
- State Management: React Context API
- HTTP Client: Axios 1.9.0
- Animations: Framer Motion 10.18.0
- PDF Generation: html2pdf.js 0.10.3

**Backend:**
- Runtime: Node.js with Express 4.18.2
- Database: MongoDB 8.1.3 with Mongoose ODM
- Authentication: JWT (jsonwebtoken 9.0.2) with bcryptjs 2.4.3
- AI Integration: Google Generative AI (@google/generative-ai 0.24.1)
- File Upload: Multer 2.0.0 with Cloudinary 2.6.1
- Scheduling: node-cron 4.1.0
- WebSockets: ws 8.16.0 for real-time features

**External Services:**
- Google Gemini AI API for content generation and analysis
- Cloudinary for image storage and management
- JWT for secure authentication

### 2.2 High-Level Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend│────│  Express Backend │────│    MongoDB      │
│   (Vite + SPA)  │    │   (Node.js)      │    │   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Interface│    │   API Routes     │    │   Data Models   │
│   - Notes Editor│    │   - Auth         │    │   - User        │
│   - Quiz Player │    │   - Notes        │    │   - Note        │
│   - Study Tools │    │   - AI Services  │    │   - Course      │
│                 │    │   - Practice Exam│    │   - Quiz        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                                                       ▼
                                            ┌─────────────────┐
                                            │ Google Gemini AI │
                                            │ - Content Gen    │
                                            │ - Quiz Creation  │
                                            │ - Text Analysis  │
                                            └─────────────────┘
```

### 2.3 Project File Structure

```
student-buddy/
├── backend/
│   ├── controllers/
│   │   └── noteController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Note.js
│   │   ├── Course.js
│   │   ├── CourseTopic.js
│   │   ├── Quiz.js
│   │   ├── PracticeExam.js
│   │   └── AIGeneratedPracticeExam.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── notes.js
│   │   ├── courses.js
│   │   ├── courseTopics.js
│   │   ├── ai.js
│   │   ├── practiceExam.js
│   │   ├── noteGeneration.js
│   │   ├── users.js
│   │   └── study.js
│   ├── services/
│   │   └── aiService.js
│   ├── utils/
│   │   └── dateParser.js
│   ├── server.js
│   └── app.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   └── MainLayout.jsx
│   │   │   ├── ui/
│   │   │   │   ├── button.jsx
│   │   │   │   ├── card.jsx
│   │   │   │   └── ...
│   │   │   ├── PracticeExam.jsx
│   │   │   ├── PracticeExamList.jsx
│   │   │   ├── PracticeExamQuestions.jsx
│   │   │   ├── PracticeExamResults.jsx
│   │   │   ├── NoteCard.jsx
│   │   │   ├── RichTextEditor.jsx
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── Notes.jsx
│   │   │   ├── Study.jsx
│   │   │   ├── PracticeExamPage.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   └── utils/
│   │       └── axios.js
│   ├── App.jsx
│   └── main.jsx
└── README.md
```

---

## 3. DATABASE SCHEMA

### User Model
**Purpose**: Stores user account information, authentication data, and user preferences
**Used By**: Authentication system, profile management, course associations

**Schema**:
```javascript
{
  username: String (required, unique, 3-30 chars),
  email: String (required, unique, lowercase),
  password: String (required, min 6 chars, hashed),
  school: String (default: ''),
  class: String (default: ''),
  profilePicture: String (default: ''),
  level: String (default: ''),
  semesterStart: String (default: ''),
  semesterEnd: String (default: ''),
  semesterGoals: String (default: '', max 1000 chars),
  preferences: Object (default: {theme: 'system', language: 'en'}),
  courses: [ObjectId] (references Course),
  googleAuth: {
    accessToken: String,
    refreshToken: String,
    expiryDate: Date,
    connected: Boolean (default: false)
  },
  createdAt: Date (default: now),
  updatedAt: Date (default: now)
}
```

**Relationships**:
- References: Course (many-to-many through courses array)
- Referenced by: Note, Course, AIGeneratedPracticeExam

### Note Model
**Purpose**: Stores user-created study notes with rich text content
**Used By**: Note management system, AI analysis features

**Schema**:
```javascript
{
  title: String (required),
  content: String (required),
  subject: String,
  course: ObjectId (references Course),
  attachments: [{
    name: String,
    type: String,
    url: String,
    size: Number
  }],
  user: ObjectId (references User, required),
  createdAt: Date (default: now),
  updatedAt: Date (default: now)
}
```

**Relationships**:
- References: Course, User
- Referenced by: None directly (used in AI processing)

### Course Model
**Purpose**: Organizes study materials by academic courses
**Used By**: Course management, note organization

**Schema**:
```javascript
{
  user: ObjectId (references User, required),
  name: String (required),
  code: String,
  school: String (required),
  level: String (required),
  semester: String,
  topics: [{
    name: String (required),
    description: String,
    keyConcepts: [String],
    challenges: String,
    studentNotes: String
  }],
  createdAt: Date (default: now),
  updatedAt: Date (default: now)
}
```

**Relationships**:
- References: User
- Referenced by: Note, CourseTopic

### CourseTopic Model
**Purpose**: Detailed breakdown of course topics for AI note generation
**Used By**: AI note generation system

**Schema**:
```javascript
{
  courseId: ObjectId (references Course, required),
  userId: ObjectId (references User, required),
  topicName: String (required),
  about: String (default: ''),
  understanding: String (default: ''),
  challenges: String (default: ''),
  weekDate: String (required),
  createdAt: Date (default: now)
}
```

**Relationships**:
- References: Course, User

### Quiz Model
**Purpose**: Pre-defined quiz templates (currently minimal implementation)
**Used By**: Quiz system (limited use)

**Schema**:
```javascript
{
  title: String (required),
  description: String (required),
  questions: [{
    question: String (required),
    options: [String] (required),
    correctAnswer: Number (required),
    explanation: String (required)
  }],
  timeLimit: Number (required, in minutes),
  difficulty: String (enum: easy/medium/hard, default: medium),
  category: String (required),
  createdAt: Date (default: now),
  updatedAt: Date (default: now)
}
```

### PracticeExam Model
**Purpose**: Pre-defined practice exam templates
**Used By**: Practice exam system

**Schema**:
```javascript
{
  title: String (required),
  description: String (required),
  duration: Number (required, in minutes),
  totalMarks: Number (required),
  passingMarks: Number (required),
  questions: [{
    question: String (required),
    options: [String] (required),
    correctAnswer: Number (required),
    marks: Number (required)
  }],
  category: String (required),
  difficulty: String (enum: easy/medium/hard, default: medium),
  createdAt: Date (default: now),
  updatedAt: Date (default: now)
}
```

### AIGeneratedPracticeExam Model
**Purpose**: Stores AI-generated practice exams and user responses
**Used By**: AI practice exam system

**Schema**:
```javascript
{
  userId: ObjectId (references User, required),
  topicOrNote: String (required),
  questions: [String] (required),
  userAnswers: [String] (default: null),
  score: Number (default: null),
  feedback: String (default: null),
  detailed: [{
    question: String,
    studentAnswer: String,
    mark: Number,
    comment: String,
    reference: String
  }],
  submitted: Boolean (default: false),
  createdAt: Date (default: now)
}
```

**Relationships**:
- References: User

---

## 4. API DOCUMENTATION

### Authentication Endpoints

#### POST /api/auth/register
**Purpose**: Register a new user account
**Authentication**: Not Required

**Request**:
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "school": "string",
  "level": "string",
  "semesterStart": "string",
  "semesterEnd": "string"
}
```

**Response**:
```json
{
  "token": "jwt_token_string",
  "userId": "user_id_string"
}
```

**Used By**: Register.jsx component
**Implementation**: `backend/routes/auth.js`

#### POST /api/auth/login
**Purpose**: Authenticate user and return JWT token
**Authentication**: Not Required

**Request**:
```json
{
  "email": "string",
  "password": "string"
}
```

**Response**:
```json
{
  "token": "jwt_token_string",
  "userId": "user_id_string"
}
```

**Used By**: Login.jsx component
**Implementation**: `backend/routes/auth.js`

#### GET /api/auth/me
**Purpose**: Get current authenticated user information
**Authentication**: Required

**Response**:
```json
{
  "_id": "user_id",
  "username": "string",
  "email": "string",
  "school": "string",
  "level": "string",
  "preferences": {...}
}
```

**Used By**: AuthContext, profile components
**Implementation**: `backend/routes/auth.js`

### Notes Management Endpoints

#### GET /api/notes
**Purpose**: Retrieve user's notes with optional filtering
**Authentication**: Required

**Query Parameters**:
- `subject`: Filter by folder/subject
- `course`: Filter by course ID
- `sortBy`: 'date' or 'title'
- `sortOrder`: 'asc' or 'desc'

**Response**:
```json
[
  {
    "_id": "note_id",
    "title": "string",
    "content": "string",
    "subject": "string",
    "course": {...},
    "createdAt": "date",
    "updatedAt": "date"
  }
]
```

**Used By**: Notes.jsx page
**Implementation**: `backend/routes/notes.js` → `backend/controllers/noteController.js`

#### POST /api/notes
**Purpose**: Create a new note
**Authentication**: Required

**Request**:
```json
{
  "title": "string",
  "content": "string",
  "subject": "string",
  "course": "course_id",
  "tags": ["array", "of", "tags"]
}
```

**Used By**: Notes.jsx, NoteModal.jsx
**Implementation**: `backend/routes/notes.js` → `backend/controllers/noteController.js`

#### PUT /api/notes/:id
**Purpose**: Update an existing note
**Authentication**: Required

**Request**: Same as POST, with updated fields

**Used By**: Notes.jsx, RichTextEditor.jsx
**Implementation**: `backend/routes/notes.js` → `backend/controllers/noteController.js`

#### DELETE /api/notes/:id
**Purpose**: Delete a note
**Authentication**: Required

**Used By**: Notes.jsx
**Implementation**: `backend/routes/notes.js` → `backend/controllers/noteController.js`

### AI Services Endpoints

#### POST /api/ai/explain
**Purpose**: Get AI-powered explanation of selected text
**Authentication**: Required

**Request**:
```json
{
  "text": "selected text to explain",
  "noteContent": "full note content for context"
}
```

**Response**:
```json
{
  "hint": "brief hint text",
  "fullExplanation": "detailed explanation"
}
```

**Used By**: Notes.jsx (text selection feature)
**Implementation**: `backend/routes/ai.js` → `backend/services/aiService.js`

#### POST /api/ai/summarize
**Purpose**: Generate AI summary of note content
**Authentication**: Required

**Request**:
```json
{
  "text": "note content to summarize"
}
```

**Response**:
```json
{
  "summary": "concise summary text"
}
```

**Used By**: Notes.jsx
**Implementation**: `backend/routes/ai.js` → `backend/services/aiService.js`

#### POST /api/ai/generate-quiz
**Purpose**: Generate quiz questions from topic or note content
**Authentication**: Required

**Request**:
```json
{
  "topic": "topic or note content"
}
```

**Response**:
```json
{
  "success": true,
  "response": "raw AI-generated quiz text"
}
```

**Used By**: Study.jsx
**Implementation**: `backend/routes/ai.js` → `backend/services/aiService.js`

### Practice Exam Endpoints

#### POST /api/practice-exam/start
**Purpose**: Generate AI practice exam questions
**Authentication**: Required

**Request**:
```json
{
  "topicOrNote": "topic or note content"
}
```

**Response**:
```json
{
  "success": true,
  "examId": "exam_id",
  "questions": ["question1", "question2", ...]
}
```

**Used By**: PracticeExamPage.jsx
**Implementation**: `backend/routes/practiceExam.js` → `backend/services/aiService.js`

#### POST /api/practice-exam/submit/:examId
**Purpose**: Submit answers and get AI grading
**Authentication**: Required

**Request**:
```json
{
  "userAnswers": ["answer1", "answer2", ...]
}
```

**Response**:
```json
{
  "success": true,
  "score": 85,
  "feedback": "overall feedback",
  "detailed": [...]
}
```

**Used By**: PracticeExamQuestions.jsx
**Implementation**: `backend/routes/practiceExam.js` → `backend/services/aiService.js`

### Course Management Endpoints

#### GET /api/courses
**Purpose**: Get user's courses
**Authentication**: Required

**Response**: Array of course objects

**Used By**: Notes.jsx, course selection components
**Implementation**: `backend/routes/courses.js`

#### POST /api/courses
**Purpose**: Create new course
**Authentication**: Required

**Request**:
```json
{
  "name": "string",
  "code": "string",
  "school": "string",
  "level": "string",
  "semester": "string"
}
```

**Used By**: Course management components
**Implementation**: `backend/routes/courses.js`

### Note Generation Endpoints

#### POST /api/note-generation/by-course
**Purpose**: Generate notes from course topic
**Authentication**: Required

**Request**:
```json
{
  "courseId": "course_id",
  "topicName": "topic_name"
}
```

**Response**:
```json
{
  "note": {...}
}
```

**Used By**: NoteGenerationModal.jsx
**Implementation**: `backend/routes/noteGeneration.js` → `backend/services/aiService.js`

---

## 5. CORE FEATURES AND IMPLEMENTATION

### Feature: AI-Powered Note Generation

**User Journey**:
1. User selects a course and topic in the Study page
2. User fills in topic details (description, key concepts, challenges)
3. User clicks "Generate Notes"
4. AI analyzes the topic information and generates comprehensive study notes
5. New note is created and saved to user's note collection
6. User is redirected to Notes page to view the generated content

**Key Files**:
- Frontend: `frontend/src/pages/Study.jsx`, `frontend/src/components/NoteGenerationModal.jsx`
- Backend: `backend/routes/noteGeneration.js`, `backend/services/aiService.js`
- Database: `backend/models/Note.js`, `backend/models/Course.js`

**Major Functions**:

#### `generateNotes(topic, level, context)` in `backend/services/aiService.js`
**Purpose**: Generate comprehensive study notes using Google Gemini AI
**Parameters**: topic (string), level (string), context (string)
**Returns**: Generated note content (string)
**Key Logic**: Constructs detailed prompt for AI, handles API calls with fallback keys, parses response

### Feature: Interactive AI Explanations

**User Journey**:
1. User selects text in a note
2. Popup appears with "AI Explain" button
3. User clicks for hint or full explanation
4. AI analyzes selected text in context of full note
5. Modal displays hint first, then full explanation on demand

**Key Files**:
- Frontend: `frontend/src/pages/Notes.jsx` (text selection logic)
- Backend: `backend/routes/ai.js`, `backend/services/aiService.js`

**Major Functions**:

#### `generateResponse(prompt)` in `backend/services/aiService.js`
**Purpose**: Send prompts to Google Gemini AI with automatic key rotation
**Parameters**: prompt (string)
**Returns**: AI-generated response (string)
**Key Logic**: Manages multiple API keys, handles rate limiting, rotates keys on failure

### Feature: AI-Generated Quizzes

**User Journey**:
1. User navigates to Study page and selects "Quiz Mode"
2. User chooses between note-based or topic-based quiz generation
3. For note-based: User selects a specific note
4. For topic-based: User enters a topic manually
5. AI generates 10 multiple-choice questions
6. User takes quiz with 5-minute timer
7. Immediate feedback with gamification elements
8. Results screen shows score and question review

**Key Files**:
- Frontend: `frontend/src/pages/Study.jsx` (quiz UI and logic)
- Backend: `backend/routes/ai.js`, `backend/services/aiService.js`

**Major Functions**:

#### `generatePracticeQuestions(topicOrNote, isNoteBased)` in `backend/services/aiService.js`
**Purpose**: Generate quiz questions from content
**Parameters**: topicOrNote (string), isNoteBased (boolean)
**Returns**: Array of question strings
**Key Logic**: Different prompts for note-based vs topic-based, parses AI response into structured questions

### Feature: AI-Graded Practice Exams

**User Journey**:
1. User navigates to Practice Exam section
2. User provides topic or note content
3. AI generates 15 practice questions
4. User takes exam with answers recorded
5. User submits exam for AI grading
6. AI analyzes answers against original content
7. Detailed feedback provided with scores and explanations

**Key Files**:
- Frontend: `frontend/src/pages/PracticeExamPage.jsx`, `frontend/src/components/PracticeExamQuestions.jsx`, `frontend/src/components/PracticeExamResults.jsx`
- Backend: `backend/routes/practiceExam.js`, `backend/services/aiService.js`
- Database: `backend/models/AIGeneratedPracticeExam.js`

**Major Functions**:

#### `gradePracticeExam(questions, userAnswers, noteContent)` in `backend/services/aiService.js`
**Purpose**: AI-powered exam grading with detailed feedback
**Parameters**: questions (array), userAnswers (array), noteContent (string)
**Returns**: Score, feedback, and detailed analysis object
**Key Logic**: Constructs complex grading prompt, handles JSON parsing of AI response, provides specific feedback with content references

---

## 6. DATA FLOW EXAMPLES

### Example 1: Creating and AI-Enhancing a Note

1. **User Action**: User clicks "Add Note" in Notes page
2. **Frontend**: `Notes.jsx` opens `AddNoteModal` component
3. **User Input**: User enters title, selects folder/course, writes content
4. **HTTP Request**: `POST /api/notes` with note data
5. **Backend Route**: `notes.js` → `noteController.createNote()`
6. **Controller Logic**: Creates new Note document, associates with user
7. **Database**: Saves to `notes` collection in MongoDB
8. **Response**: Returns created note object
9. **Frontend Update**: Adds note to local state, shows success message

### Example 2: AI Quiz Generation and Taking

1. **User Action**: User selects "Quiz Mode" and chooses a note
2. **Frontend**: `Study.jsx` calls `generateQuizFromNotes()`
3. **HTTP Request**: `POST /api/ai/generate-quiz` with note content
4. **Backend Route**: `ai.js` → `aiService.generatePracticeQuestions()`
5. **AI Processing**: Google Gemini analyzes content and generates questions
6. **Response**: Returns parsed question array
7. **Frontend**: Starts quiz timer, displays questions sequentially
8. **User Interaction**: User answers questions with immediate feedback
9. **Scoring**: Frontend calculates score, shows results with gamification

### Example 3: AI Practice Exam with Grading

1. **User Action**: User enters topic in Practice Exam page
2. **HTTP Request**: `POST /api/practice-exam/start` with topic
3. **Backend**: Creates `AIGeneratedPracticeExam` document, generates questions
4. **Database**: Saves exam with user ID and questions
5. **Frontend**: Displays questions for user to answer
6. **User Submission**: `POST /api/practice-exam/submit/:examId` with answers
7. **AI Grading**: `aiService.gradePracticeExam()` analyzes answers vs original content
8. **Database Update**: Saves score, feedback, and detailed results
9. **Frontend**: Shows results with AI feedback and recommendations

---

## 7. EXTERNAL INTEGRATIONS

### Google Generative AI (Gemini)
**Purpose**: Powers all AI features including content generation, explanations, and grading
**Implementation**: `backend/services/aiService.js`
**Key Functions Using It**:
- `generateNotes()` - Creates study notes from topics
- `generateResponse()` - General AI text generation
- `gradePracticeExam()` - Automated exam grading
- `generatePracticeQuestions()` - Quiz question creation

**Configuration**: 
- Environment variables: `GEMINI_API_KEY_1`, `GEMINI_API_KEY_2`, `GEMINI_API_KEY_3`
- Automatic key rotation for rate limit handling
- Model: `gemini-2.5-flash`

### Cloudinary
**Purpose**: Image storage and management for profile pictures and note attachments
**Implementation**: Integrated in user routes for profile picture uploads
**Configuration**: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

---

## 8. FRONTEND ARCHITECTURE

### 8.1 Routing Structure

```
/ → /login (if not authenticated)
/login → Login.jsx
/register → Register.jsx
/app → MainLayout.jsx (protected)
/app/notes → Notes.jsx
/app/settings → Settings.jsx
/app/active-learning → Study.jsx
/app/practice-exam → PracticeExamPage.jsx
/app/practice-exam/list → PracticeExamListPage.jsx
/app/practice-exam/questions/:examId → PracticeExamQuestionsPage.jsx
/app/practice-exam/results/:examId → PracticeExamResultsPage.jsx
```

### 8.2 State Management

**Authentication State**:
- `AuthContext.jsx` - Manages user authentication, JWT tokens, login/logout
- Stores userId, isAuthenticated status
- Handles token expiration and auto-logout

**Theme State**:
- `ThemeContext.jsx` - Manages light/dark/system theme preferences
- Persists to localStorage
- Applies theme classes to document root

**Component-Level State**:
- Notes page: notes array, selected note, editing state, search filters
- Study page: quiz state, timer, gamification data
- Practice exam: questions, answers, results

### 8.3 Key Components

#### Component: `Notes.jsx`
**Location**: `frontend/src/pages/Notes.jsx`
**Purpose**: Main note management interface with CRUD operations and AI features
**Props**: None (uses context)
**State**: notes, selectedNote, searchQuery, filters, AI states
**API Calls**: `/api/notes` (GET, POST, PUT, DELETE), `/api/ai/*`
**Rendered By**: App.jsx routing

#### Component: `Study.jsx`
**Location**: `frontend/src/pages/Study.jsx`
**Purpose**: Active learning hub with quizzes, practice exams, and study tools
**Props**: None
**State**: currentMode, quiz data, timer, gamification stats
**API Calls**: `/api/ai/generate-quiz`, `/api/practice-exam/*`
**Rendered By**: App.jsx routing

#### Component: `RichTextEditor.jsx`
**Location**: `frontend/src/components/RichTextEditor.jsx`
**Purpose**: WYSIWYG editor for note content creation and editing
**Props**: content, onChange, placeholder
**State**: editor instance, formatting state
**API Calls**: None (pure component)
**Rendered By**: Notes.jsx

#### Component: `PracticeExamQuestions.jsx`
**Location**: `frontend/src/components/PracticeExamQuestions.jsx`
**Purpose**: Interactive exam interface with question navigation and submission
**Props**: examId, questions
**State**: currentQuestion, answers, timeLeft
**API Calls**: `/api/practice-exam/submit/:examId`
**Rendered By**: PracticeExamPage.jsx

---

## 9. AUTHENTICATION & SECURITY

### 9.1 Authentication Flow

1. **Registration**: User submits credentials → Server validates → Password hashed with bcrypt → User created → JWT token generated → Token returned
2. **Login**: User submits credentials → Server validates password → JWT token generated → Token returned with userId
3. **Token Verification**: All protected routes use `authenticateToken` middleware → Verifies JWT → Attaches userId to request
4. **Auto-logout**: Frontend checks token expiration on app load → Redirects to login if expired

### 9.2 Security Measures

- **Password Hashing**: bcryptjs with salt rounds for secure password storage
- **JWT Tokens**: 24-hour expiration with userId payload
- **CORS Configuration**: Restricted origins for production and development
- **Input Validation**: Server-side validation for all user inputs
- **Authentication Middleware**: Protects all sensitive routes
- **File Upload Security**: Multer configuration with file type and size restrictions
- **Environment Variables**: Sensitive data stored in environment variables

---

## 10. KEY ALGORITHMS AND BUSINESS LOGIC

### Algorithm: AI Content Analysis and Generation

**Location**: `backend/services/aiService.js`
**Purpose**: Generate educational content using advanced AI prompts
**Input**: Topic description, context, content type needed
**Process**:
1. Construct detailed prompt based on content type (notes, quiz, explanation)
2. Send to Google Gemini API with appropriate model
3. Handle API responses and potential errors
4. Parse and format AI response for frontend consumption
5. Implement fallback logic for API failures
**Output**: Structured educational content (notes, questions, explanations)

### Algorithm: Gamified Learning Progress Tracking

**Location**: `frontend/src/pages/Study.jsx`
**Purpose**: Implement spaced repetition and motivation through gamification
**Input**: User quiz performance, time spent, accuracy rates
**Process**:
1. Track correct/incorrect answers with immediate feedback
2. Award points based on difficulty and speed
3. Maintain streaks and combo multipliers
4. Unlock achievements based on milestones
5. Provide encouraging feedback messages
**Output**: Points, streaks, achievements, motivational messaging

### Algorithm: Intelligent Exam Grading

**Location**: `backend/services/aiService.js` - `gradePracticeExam()`
**Purpose**: Provide detailed, context-aware feedback on student answers
**Input**: Questions, student answers, reference material
**Process**:
1. Construct comprehensive grading prompt with reference material
2. Send to AI for analysis of each answer
3. Parse structured JSON response with scores and feedback
4. Calculate overall percentage and provide summary
5. Generate specific improvement suggestions
**Output**: Detailed grading report with scores, comments, and recommendations

---

## 11. DEPLOYMENT & CONFIGURATION

### 11.1 Environment Variables

**Backend (.env)**:
```
NODE_ENV=production
PORT=3001
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY_1=your_gemini_key
GEMINI_API_KEY_2=backup_key
GEMINI_API_KEY_3=backup_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_secret
BACKEND_BASE_URL=https://your-backend-url
FRONTEND_URLS=https://your-frontend-url
```

**Frontend (.env.production)**:
```
VITE_BACKEND_URL=https://your-backend-api
VITE_APP_ENV=production
```

### 11.2 Build Process

**Frontend**:
```bash
npm run build  # Vite builds optimized production bundle
# Outputs to dist/ directory
```

**Backend**:
```bash
npm start  # Production server
# or
npm run dev  # Development with nodemon
```

### 11.3 Deployment Setup

**Frontend**: Deployed to Vercel with automatic builds from GitHub
**Backend**: Deployed to Heroku with MongoDB Atlas
**Database**: MongoDB Atlas with connection pooling and replica sets
**CDN**: Cloudinary for media assets
**Monitoring**: Basic error logging and health checks

---

## 12. DEVELOPMENT WORKFLOW

### 12.1 Local Development Setup

1. **Clone Repository**
2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   cp .env.example .env  # Configure environment variables
   npm run dev
   ```
3. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
4. **Database**: Ensure MongoDB Atlas connection is configured

### 12.2 Code Quality

- **Linting**: ESLint configuration for both frontend and backend
- **Prettier**: Code formatting standards
- **Git Hooks**: Pre-commit hooks for code quality checks
- **Testing**: Basic test structure (needs expansion)

### 12.3 API Design Principles

- RESTful endpoints with consistent naming
- JWT authentication for protected routes
- Comprehensive error handling with appropriate HTTP status codes
- Input validation and sanitization
- Rate limiting considerations for AI endpoints

---

This documentation provides a comprehensive overview of the Student Buddy application, covering its architecture, features, and implementation details. The system successfully combines traditional educational tools with cutting-edge AI capabilities to create an effective learning platform.