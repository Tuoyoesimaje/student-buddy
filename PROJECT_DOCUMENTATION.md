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

## 13. KEY FUNCTIONS AND CODE IMPLEMENTATION

### Core AI Service Functions

#### `generateResponse(prompt)` - Core AI Communication
**Location**: `backend/services/aiService.js:71-129`
**Purpose**: Handles all communication with Google Gemini AI with automatic key rotation and error handling

```javascript
async generateResponse(prompt) {
  if (this.apiKeys.length === 0) {
    throw new Error('AI Service not initialized. API keys might be missing or invalid.');
  }

  if (!prompt || typeof prompt !== 'string') {
    throw new Error('Invalid prompt provided');
  }

  // Try all available keys if needed
  for (let attempt = 0; attempt < this.apiKeys.length; attempt++) {
    try {
      if (!this.model) {
        this.initializeClient();
        if (!this.model) {
          throw new Error('Failed to initialize AI model');
        }
      }

      console.log(`Sending prompt to Gemini (${this.modelName}) with key index ${this.currentKeyIndex}: "${prompt.substring(0, 100)}..."`);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log(`Received response from Gemini (${this.modelName}): "${text.substring(0,100)}..."`);
      return text;

    } catch (error) {
      console.error(`Error generating response from Google AI (key index ${this.currentKeyIndex}):`, error);

      // Check if error is related to rate limiting or authentication
      const errorMessage = error.message || '';
      const statusCode = error.status || error.statusCode || (error.response && error.response.status);

      // If error is related to rate limiting (429), authentication (403), or service unavailable (503)
      if (statusCode === 403 || statusCode === 429 || statusCode === 503 ||
          errorMessage.includes('quota') || errorMessage.includes('rate limit') ||
          errorMessage.includes('authentication') || errorMessage.includes('unauthorized')) {

        // Try rotating to the next key
        const rotated = this.rotateToNextKey();
        if (rotated && attempt < this.apiKeys.length - 1) {
          console.log(`Retrying with next API key (index: ${this.currentKeyIndex})`);
          continue; // Try again with the new key
        }
      }

      // If we've tried all keys or it's not a rate limit/auth error, throw the error
      if (attempt === this.apiKeys.length - 1) {
        throw new Error('All Gemini keys failed or hit their limit. Try again later.');
      } else {
        throw error; // Throw the original error for other types of errors
      }
    }
  }

  // This should never be reached due to the error handling above
  throw new Error('Failed to generate response after trying all available API keys.');
}
```

#### `generateNotes(topic, level, context)` - AI Note Generation
**Location**: `backend/services/aiService.js:157-178`
**Purpose**: Generates comprehensive study notes from topics using AI

```javascript
async generateNotes(topic, level = 'intermediate', context = '') {
  console.log(`Generating notes for topic: ${topic}, level: ${level}`);

  const prompt = `Generate comprehensive study notes for the following topic.

Topic: ${topic}
Level: ${level}
${context ? `Additional Context:\n${context}` : ''}

Please create detailed, well-structured study notes that include:
1. **Key Concepts**: Main ideas and definitions
2. **Detailed Explanations**: Clear explanations of each concept
3. **Examples**: Practical examples where applicable
4. **Important Points**: Key takeaways and formulas if relevant
5. **Summary**: Concise overview at the end

Format the notes in a clean, readable structure with headings and bullet points. Make it suitable for studying, detailed, long if possible and easy to understand.`;

  const result = await this.generateResponse(prompt);
  console.log(`Notes generated successfully for topic: ${topic}`);
  return result;
}
```

#### `gradePracticeExam(questions, userAnswers, noteContent)` - AI Exam Grading
**Location**: `backend/services/aiService.js:215-323`
**Purpose**: Provides intelligent grading and feedback for practice exams

```javascript
async gradePracticeExam(questions, userAnswers, noteContent = null) {
  // Construct the prompt for grading based on note content
  let prompt = `You are an expert exam grader evaluating student answers based on specific course content.

${noteContent ? `REFERENCE MATERIAL (grade answers based on this content, not general knowledge):\n${noteContent}\n\n` : ''}

Grade each of the ${questions.length} questions using this scoring scale:
- 9-10: Fully correct, complete understanding
- 6-8: Partially correct, main idea present but missing details
- 3-5: Weak understanding, missing context or has errors
- 0-2: Off-topic, wrong, or no understanding shown

Return a JSON array where each object has:
{
  "question": "exact question text",
  "studentAnswer": "student's answer (or 'No answer provided')",
  "mark": number (0-10),
  "comment": "specific feedback referencing the reference material",
  "reference": "specific section/page from reference material that supports this answer"
}

Example format:
[
  {
    "question": "What is the main function of mitochondria?",
    "studentAnswer": "They produce energy for the cell",
    "mark": 8,
    "comment": "Correct main function but didn't mention ATP production specifically",
    "reference": "Section 3.2: Cellular Energy Production"
  }
]

Questions to grade:\n`;

  // Add questions and answers to prompt
  questions.forEach((q, i) => {
    prompt += `${i + 1}. ${q}\n`;
    prompt += `Student Answer: ${userAnswers[i] || 'No answer provided'}\n\n`;
  });

  // Get AI response
  const response = await this.generateResponse(prompt);

  try {
    // Try to parse the response as JSON
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Could not find JSON array in response');
    }

    const jsonStr = jsonMatch[0];
    const detailedResults = JSON.parse(jsonStr);

    // Validate the result structure
    if (!Array.isArray(detailedResults) || detailedResults.length === 0) {
      throw new Error('Response is not a valid array');
    }

    // Ensure each result has the student answer included
    const enrichedResults = detailedResults.map((result, index) => ({
      question: result.question || questions[index] || `Question ${index + 1}`,
      studentAnswer: userAnswers[index] || 'No answer provided',
      mark: result.mark || 0,
      comment: result.comment || 'No feedback available',
      reference: result.reference || 'N/A'
    }));

    // Calculate total score
    const totalScore = enrichedResults.reduce((sum, item) => sum + (item.mark || 0), 0);
    const maxScore = questions.length * 10;
    const percentageScore = Math.round((totalScore / maxScore) * 100);

    // Generate overall feedback
    const averageMark = totalScore / enrichedResults.length;
    let feedback = '';
    if (averageMark >= 8) {
      feedback = 'Excellent work! You demonstrated strong understanding of the material.';
    } else if (averageMark >= 6) {
      feedback = 'Good effort! You captured most key concepts but could review some details.';
    } else if (averageMark >= 4) {
      feedback = 'Fair understanding shown. Focus on reviewing the core concepts and examples.';
    } else {
      feedback = 'More review needed. Consider revisiting the fundamental concepts in the material.';
    }

    return {
      score: percentageScore,
      feedback: feedback,
      detailed: enrichedResults
    };

  } catch (error) {
    console.error('Error parsing grade response:', error);
    // Fallback: return a basic structure with student answers
    const fallbackResults = questions.map((q, i) => ({
      question: q,
      studentAnswer: userAnswers[i] || 'No answer provided',
      mark: 0,
      comment: 'Grading error occurred - unable to process AI feedback',
      reference: 'N/A'
    }));

    return {
      score: 0,
      feedback: 'Error processing grades. The AI grading system encountered an issue.',
      detailed: fallbackResults
    };
  }
}
```

### Frontend Component Functions

#### `handleQuizAnswer(answerIndex)` - Quiz Interaction Logic
**Location**: `frontend/src/pages/Study.jsx:535-620`
**Purpose**: Handles quiz answer selection with gamification and feedback

```javascript
const handleQuizAnswer = (answerIndex) => {
  try {
    if (!quizQuestions[currentQuestion] || isAnswerLocked) {
      return;
    }

    const answerLetter = String.fromCharCode(65 + answerIndex);
    const isCorrect = answerLetter === quizQuestions[currentQuestion].correctAnswer;

    // Set feedback state
    setSelectedAnswerIndex(answerIndex);
    setFeedbackType(isCorrect ? 'correct' : 'wrong');
    const msg = getRandomFeedback(isCorrect ? 'correct' : 'wrong');
    setFeedbackMessage(msg);
    setShowFeedback(true);
    setIsAnswerLocked(true);

    // Update answers array
    const newAnswers = [...quizAnswers];
    newAnswers[currentQuestion] = answerLetter;
    setQuizAnswers(newAnswers);
    // keep a ref copy for immediate calculations inside intervals/closures
    answersRef.current = newAnswers;

    // Handle scoring and achievements
    if (isCorrect) {
      // Update combo
      setCombo(prev => prev + 1);

      // Award points based on combo
      const pointsToAward = Math.round(10 * (1 + (combo * 0.5))); // Base 10 points, increases with combo
      setPoints(prev => prev + pointsToAward);
      setPointsToAdd(pointsToAward);
      setShowPointsAnimation(true);
      setTimeout(() => setShowPointsAnimation(false), 1000);

      // Check for combo achievements
      if (combo === 3 && !achievements.includes('combo3')) {
        setAchievements(prev => [...prev, achievementDefinitions.combo3]);
        setPoints(prev => prev + achievementDefinitions.combo3.points);
        toast.success('Achievement Unlocked: Combo Master!');
      }
      if (combo === 5 && !achievements.includes('combo5')) {
        setAchievements(prev => [...prev, achievementDefinitions.combo5]);
        setPoints(prev => prev + achievementDefinitions.combo5.points);
        toast.success('Achievement Unlocked: Combo Legend!');
      }
    } else {
      setCombo(0);
    }

    // Start 4-second progress bar timer (clear existing first)
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setProgressWidth(0);
    const startTime = Date.now();
    const duration = 6000; // 6 seconds

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / duration) * 100, 100);
      setProgressWidth(progress);

      if (progress >= 100) {
        // clear and finalize/advance
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
        setProgressWidth(100);
        // Auto-advance to next question after 4 seconds
        if (currentQuestion < quizQuestions.length - 1) {
          handleNextQuestion();
        } else {
          // Finish quiz if it's the last question
          finalizeQuiz(answersRef.current);
        }
      }
    }, 50);

  } catch (error) {
    console.error('Error handling quiz answer:', error);
    toast.error('An error occurred while processing your answer');
  }
};
```

#### `handleAIExplain()` - Text Selection AI Explanation
**Location**: `frontend/src/pages/Notes.jsx:788-845`
**Purpose**: Processes selected text and calls AI for explanations

```javascript
const handleAIExplain = async () => {
  if (!selectedText.trim()) return;
  setIsLoadingAIExplain(true);
  setAiExplanation('');
  setAiHint('');
  setShowFullExplanation(false);

  console.log('Calling AI explain with text:', selectedText.substring(0, 50) + '...');

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
    const apiUrl = `${backendUrl}/api/ai/explain`;

    console.log('Making request to:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        text: selectedText,
        noteContent: selectedNote?.content || ''
      })
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    console.log('Response data:', data);

    setAiHint(data.hint || 'No hint available.');
    setAiExplanation(data.fullExplanation || 'No full explanation available.');
    setShowAIExplainModal(true);
    setShowExplainPopup(false); // Hide the popup button after showing modal
  } catch (err) {
    console.error('Error getting AI explanation:', err);
    setAiHint(`Failed to get hint: ${err.message}`);
    setAiExplanation(`Failed to get full explanation: ${err.message}`);
    setShowAIExplainModal(true);
    setShowExplainPopup(false); // Hide the popup button even on error
  } finally {
    setIsLoadingAIExplain(false);
  }
};
```

### Authentication Middleware

#### `authenticateToken` - JWT Authentication
**Location**: `backend/server.js:169-196`
**Purpose**: Validates JWT tokens and attaches user information to requests

```javascript
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('No token provided in request');
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log('Token verified for user:', decoded.userId);

    // Log specific route access
    if (req.originalUrl === '/api/notifications/count') {
      console.log('Accessing notification count route with authenticated token');
    }

    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please login again.' });
    }
    res.status(403).json({ message: 'Invalid token.' });
  }
};
```

### Database Operations

#### Note Creation with AI Processing
**Location**: `backend/controllers/noteController.js:33-53`
**Purpose**: Creates new notes with proper validation and associations

```javascript
exports.createNote = async (req, res) => {
  const { title, content, subject, course, tags, attachments } = req.body;

  try {
    const newNote = new Note({
      title,
      content,
      subject,
      course,
      tags,
      attachments,
      user: req.user.userId,
    });

    const note = await newNote.save();
    res.json(note);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
```

---

## 14. FRONTEND-BACKEND INTERACTION FLOWS

### AI Notes Feature: Text Selection and Explanation

#### Frontend: Text Selection Process
**Location**: `frontend/src/pages/Notes.jsx:760-786`

```javascript
// Function to handle text selection for popup AI explain
const handleTextSelection = (e) => {
  // Small delay for touch events to ensure selection is complete
  setTimeout(() => {
    const selection = window.getSelection();
    const text = selection && selection.toString().trim();
    if (text && text.trim().length > 0) {
      setSelectedText(text);
      // Get popup position near selection
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        // For touch events, position the popup where it's easily tappable
        const isTouchEvent = e.type === 'touchend';
        explainPopupPosition.current = {
          x: rect.left + window.scrollX + rect.width / 2,
          y: rect.top + window.scrollY - (isTouchEvent ? 10 : 40) // closer to selection on mobile
        };
      }
      setShowExplainPopup(true);
    } else {
      setSelectedText('');
      setShowExplainPopup(false);
    }
  }, 50); // Small delay to ensure selection is complete
};
```

**Process Flow:**
1. User selects text in note content
2. `handleTextSelection` captures selected text and calculates popup position
3. Floating "AI Explain" button appears near selection
4. User clicks button → `handleAIExplain()` is called

#### Frontend-Backend Communication
**Frontend Request**: `frontend/src/pages/Notes.jsx:788-845`

```javascript
const handleAIExplain = async () => {
  if (!selectedText.trim()) return;
  setIsLoadingAIExplain(true);
  setAiExplanation('');
  setAiHint('');
  setShowFullExplanation(false);

  try {
    const token = localStorage.getItem('token');
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
    const apiUrl = `${backendUrl}/api/ai/explain`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        text: selectedText,
        noteContent: selectedNote?.content || ''
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    setAiHint(data.hint || 'No hint available.');
    setAiExplanation(data.fullExplanation || 'No full explanation available.');
    setShowAIExplainModal(true);
    setShowExplainPopup(false);
  } catch (err) {
    console.error('Error getting AI explanation:', err);
    setAiHint(`Failed to get hint: ${err.message}`);
    setAiExplanation(`Failed to get full explanation: ${err.message}`);
    setShowAIExplainModal(true);
  } finally {
    setIsLoadingAIExplain(false);
  }
};
```

**Backend Processing**: `backend/routes/ai.js:7-72`

```javascript
// Explain text endpoint
router.post('/explain', auth, async (req, res) => {
  try {
    const { text, noteContent } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }

    // Create prompt for active, thought-provoking hint
    const hintPrompt = `You are a skilled tutor creating an active learning hint for a student. The student highlighted this text: "${text}"

${noteContent ? `Context from their notes: ${noteContent}` : ''}

Create a brief, engaging hint (2-3 sentences max) that actively pushes the student to think deeply about the concept WITHOUT giving away the answer or explanation directly. Choose the most effective approach:

- Ask a Socratic question that probes their understanding
- Suggest a connection to something they already know
- Provide a thought-provoking analogy or comparison
- Pose a "what if" scenario
- Challenge a common misconception
- Ask them to consider implications or applications

Make it conversational and encouraging, like a friendly tutor. Start with phrases like "Think about this...", "Consider...", "Have you ever wondered...", "What if...". The hint should spark curiosity and guide their thinking toward the concept, not explain it.`;

    // Create prompt for conversational full explanation
    const fullPrompt = `You are a friendly, encouraging tutor explaining this concept to a student. Provide a comprehensive but conversational explanation of: "${text}"

${noteContent ? `Additional context from their notes: ${noteContent}` : ''}

Structure your explanation like a natural conversation:
1. Start with a clear, relatable explanation
2. Break down the key components in simple terms
3. Give a real-world example they can relate to
4. Explain why this matters in the bigger picture
5. End with a thought-provoking question to deepen their understanding

Use conversational language - phrases like "Think of it this way...", "Here's what makes this interesting...", "The key insight is...". Make them feel like you're having a one-on-one tutoring session.

IMPORTANT: Keep the explanation concise but comprehensive - aim for 100-300 words total. Do not make it longer than 300 words.`;

    // Generate both responses
    console.log('Generating hint for text:', text.substring(0, 50) + '...');
    const [hint, fullExplanation] = await Promise.all([
      aiService.generateResponse(hintPrompt),
      aiService.generateResponse(fullPrompt)
    ]);

    console.log('Hint generated:', hint.substring(0, 100) + '...');
    console.log('Full explanation length:', fullExplanation.length);

    res.json({
      hint: hint.trim(),
      fullExplanation: fullExplanation.trim()
    });
  } catch (error) {
    console.error('Error in explain endpoint:', error);
    if (error.message.includes('All Gemini keys failed')) {
      return res.status(503).json({
        message: 'All Gemini keys failed or hit their limit. Try again later.'
      });
    }
    res.status(500).json({ message: error.message });
  }
});
```

**Response Flow:**
1. Backend receives `{text, noteContent}` from frontend
2. Creates two AI prompts: one for hint, one for full explanation
3. Calls `aiService.generateResponse()` twice in parallel
4. Returns `{hint, fullExplanation}` to frontend
5. Frontend displays hint first, then full explanation on user request

### Quiz Feature: AI-Generated Quiz Creation and Taking

#### Frontend: Quiz Generation Request
**Location**: `frontend/src/pages/Study.jsx:825-895`

```javascript
// Function to generate quiz questions from selected note using AI
const generateQuizFromNotes = async () => {
  if (selectedQuizNotes.length === 0) {
    setError('Please select a note to generate a quiz.');
    return;
  }

  if (selectedQuizNotes.length > 1) {
    setError('You can only generate a quiz from one note at a time. Please select only one note.');
    return;
  }

  setIsLoadingAI(true);
  setError(null);
  setQuizQuestions([]); // Clear previous questions
  setQuizAnswers([]); // Clear previous answers
  setTimeLeft(3 * 60); // Reset timer to 3 minutes

  try {
    const selectedNote = selectedQuizNotes[0];

    // Use the note content directly
    const noteContent = `${selectedNote.title}\n${selectedNote.content.replace(/<[^>]*>/g, '')}`;

    // Call backend endpoint to generate quiz from the note
    const response = await api.post('/api/ai/generate-quiz', {
      topic: `Based on this note: ${noteContent.substring(0, 1500)}...` // Limit content length
    });

    // Parse the AI response
    const rawQuestions = response.data.response;
    const questionsArray = rawQuestions.split(/Q\d+:/).filter(Boolean).map(q => {
      const parts = q.trim().split(/A\)|B\)|C\)|Answer:/);
      if (parts.length < 5) return null; // Skip if format is incorrect

      const questionText = parts[0].trim();
      const options = parts.slice(1, 4).map(opt => opt.trim());
      const correctAnswer = parts[4].trim().toUpperCase();

      // Validate the format
      if (questionText && options.length === 3 && ['A', 'B', 'C'].includes(correctAnswer)) {
        return {
          question: questionText,
          options: options,
          correctAnswer: correctAnswer
        };
      }
      return null;
    }).filter(Boolean); // Remove any null entries

    if (questionsArray.length > 0) {
      setQuizQuestions(questionsArray);
      const initAnswers = new Array(questionsArray.length).fill(null);
      setQuizAnswers(initAnswers);
      answersRef.current = initAnswers;
      setCurrentQuestion(0);
      setQuizMode('in_progress');
      setTimeLeft(5 * 60); // Reset timer to 5 minutes
      setIsRunning(true); // Start the timer
      setSuccess(`Quiz generated successfully from "${selectedNote.title}"`);
    } else {
      setError('Failed to generate valid questions from the selected note. Please try again.');
    }

  } catch (err) {
    console.error('Error generating quiz from note:', err);
    setError('Failed to generate quiz from the selected note. Please try again.');
  } finally {
    setIsLoadingAI(false);
  }
};
```

#### Backend: Quiz Generation Processing
**Location**: `backend/routes/ai.js:102-172`

```javascript
// Generate Quiz endpoint
router.post('/generate-quiz', async (req, res) => {
  try {
    const { topic } = req.body;

    // Validate input
    if (!topic) {
      return res.status(400).json({
        success: false,
        error: 'Topic is required to generate a quiz.'
      });
    }

    // Construct prompt for AI to generate quiz questions
    const prompt = `Generate 10 multiple-choice quiz questions about ${topic}. Each question should have exactly 3 multiple-choice options: A, B, and C. Provide the correct answer for each question.
Format the output clearly, with each question starting with 'Q#:', followed by the question text, then options A, B, C on separate lines, and finally 'Answer: [Correct Option Letter]'.

Example Format:
Q1: What is the capital of France?
A) London
B) Berlin
C) Paris
Answer: C

Q2: What is the main function of photosynthesis?
A) Producing oxygen
B) Converting light energy to chemical energy
C) Absorbing carbon dioxide
Answer: B

Now generate 10 questions about ${topic} in this exact format, using only options A, B, and C.`;

    console.log('Sending quiz generation prompt to AI service...');
    const rawQuizText = await aiService.generateResponse(prompt);

    // Log the raw AI response
    console.log('Raw quiz text from AI:', rawQuizText);

    // Send the raw text back to the frontend for parsing
    res.json({
      success: true,
      response: rawQuizText
    });

  } catch (error) {
    console.error('AI Quiz Generation Error:', error);

    // Handle different types of errors
    if (error.message.includes('Invalid prompt')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    if (error.message.includes('No response received') || error.message.includes('All Gemini keys failed')) {
      return res.status(503).json({
        success: false,
        error: error.message.includes('All Gemini keys failed') ?
          'All Gemini keys failed or hit their limit. Try again later.' :
          'AI service is currently unavailable for quiz generation.'
      });
    }

    // Default error response
    res.status(500).json({
      success: false,
      error: 'Error generating quiz. Please try again.'
    });
  }
});
```

#### Frontend: Quiz Answer Processing with Gamification
**Location**: `frontend/src/pages/Study.jsx:535-620`

```javascript
const handleQuizAnswer = (answerIndex) => {
  try {
    if (!quizQuestions[currentQuestion] || isAnswerLocked) {
      return;
    }

    const answerLetter = String.fromCharCode(65 + answerIndex);
    const isCorrect = answerLetter === quizQuestions[currentQuestion].correctAnswer;

    // Set feedback state
    setSelectedAnswerIndex(answerIndex);
    setFeedbackType(isCorrect ? 'correct' : 'wrong');
    const msg = getRandomFeedback(isCorrect ? 'correct' : 'wrong');
    setFeedbackMessage(msg);
    setShowFeedback(true);
    setIsAnswerLocked(true);

    // Update answers array
    const newAnswers = [...quizAnswers];
    newAnswers[currentQuestion] = answerLetter;
    setQuizAnswers(newAnswers);
    answersRef.current = newAnswers;

    // Handle scoring and achievements
    if (isCorrect) {
      // Update combo
      setCombo(prev => prev + 1);

      // Award points based on combo
      const pointsToAward = Math.round(10 * (1 + (combo * 0.5)));
      setPoints(prev => prev + pointsToAward);
      setPointsToAdd(pointsToAward);
      setShowPointsAnimation(true);
      setTimeout(() => setShowPointsAnimation(false), 1000);

      // Check for combo achievements
      if (combo === 3 && !achievements.includes('combo3')) {
        setAchievements(prev => [...prev, achievementDefinitions.combo3]);
        setPoints(prev => prev + achievementDefinitions.combo3.points);
        toast.success('Achievement Unlocked: Combo Master!');
      }
      if (combo === 5 && !achievements.includes('combo5')) {
        setAchievements(prev => [...prev, achievementDefinitions.combo5]);
        setPoints(prev => prev + achievementDefinitions.combo5.points);
        toast.success('Achievement Unlocked: Combo Legend!');
      }
    } else {
      setCombo(0);
    }

    // Start 4-second progress bar timer
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setProgressWidth(0);
    const startTime = Date.now();
    const duration = 6000; // 6 seconds

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / duration) * 100, 100);
      setProgressWidth(progress);

      if (progress >= 100) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
        setProgressWidth(100);
        // Auto-advance to next question
        if (currentQuestion < quizQuestions.length - 1) {
          handleNextQuestion();
        } else {
          finalizeQuiz(answersRef.current);
        }
      }
    }, 50);

  } catch (error) {
    console.error('Error handling quiz answer:', error);
    toast.error('An error occurred while processing your answer');
  }
};
```

### Practice Exam Feature: Full Exam Generation and Grading

#### Frontend: Practice Exam Creation
**Location**: `frontend/src/pages/PracticeExamPage.jsx` (exam creation flow)

**Request Flow:**
1. User enters topic or note content
2. Frontend calls `POST /api/practice-exam/start`
3. Sends `{topicOrNote: "content"}` to backend

#### Backend: Exam Generation and Storage
**Location**: `backend/routes/practiceExam.js:7-63`

```javascript
// Generate practice exam questions
router.post('/start', auth, async (req, res) => {
  try {
    const { topicOrNote } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!topicOrNote || typeof topicOrNote !== 'string' || topicOrNote.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Topic or note content is required'
      });
    }

    console.log(`Generating practice exam questions for user ${userId} on topic: ${topicOrNote.substring(0, 50)}...`);

    // Generate questions using AI service
    const isNoteBased = topicOrNote.startsWith('--- NOTE');
    const questions = await aiService.generatePracticeQuestions(topicOrNote, isNoteBased);

    // Ensure we have exactly 15 questions
    const finalQuestions = questions.slice(0, 15);
    if (finalQuestions.length < 15) {
      console.warn(`AI only generated ${finalQuestions.length} questions instead of 15`);
    }

    // Create a new practice exam in the database
    const practiceExam = new AIGeneratedPracticeExam({
      userId,
      topicOrNote,
      questions: finalQuestions,
      userAnswers: Array(finalQuestions.length).fill(null),
      submitted: false
    });

    console.log('Attempting to save practice exam...');
    const savedExam = await practiceExam.save();
    console.log('Practice exam saved successfully. Saved exam ID:', savedExam._id);

    res.status(201).json({
      success: true,
      examId: savedExam._id,
      questions: finalQuestions
    });

  } catch (error) {
    console.error('Error generating practice exam:', error);
    res.status(500).json({
      success: false,
      error: 'Error generating practice exam questions',
      details: error.message
    });
  }
});
```

#### Frontend: Exam Submission and Results
**Location**: `frontend/src/components/PracticeExamQuestions.jsx`

**Submission Flow:**
1. User completes all questions and clicks submit
2. Frontend calls `POST /api/practice-exam/submit/:examId`
3. Sends `{userAnswers: ["A", "B", "C", ...]}` to backend

#### Backend: AI Grading and Feedback
**Location**: `backend/routes/practiceExam.js:65-143`

```javascript
// Submit answers and grade practice exam
router.post('/submit/:examId', auth, async (req, res) => {
  try {
    const { examId } = req.params;
    const { userAnswers } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!userAnswers || !Array.isArray(userAnswers)) {
      return res.status(400).json({
        success: false,
        error: 'User answers are required and must be an array'
      });
    }

    // Find the exam
    const exam = await AIGeneratedPracticeExam.findOne({ _id: examId, userId });
    if (!exam) {
      return res.status(404).json({
        success: false,
        error: 'Practice exam not found'
      });
    }

    // Check if exam is already submitted
    if (exam.submitted) {
      return res.status(400).json({
        success: false,
        error: 'This exam has already been submitted'
      });
    }

    // Save user answers
    exam.userAnswers = userAnswers;

    // Get the original note content for grading reference
    let noteContent = null;
    if (exam.topicOrNote && exam.topicOrNote.startsWith('--- NOTE')) {
      noteContent = exam.topicOrNote;
    } else {
      noteContent = null;
    }

    // Limit noteContent length to prevent AI response issues
    if (noteContent && noteContent.length > 10000) {
      noteContent = noteContent.substring(0, 10000) + '... (content truncated for grading)';
      console.log('Note content truncated for grading to prevent AI response issues');
    }

    // Grade the exam using AI with note content reference
    const gradeResult = await aiService.gradePracticeExam(exam.questions, userAnswers, noteContent);

    // Update exam with results
    exam.score = gradeResult.score;
    exam.feedback = gradeResult.feedback;
    exam.detailed = gradeResult.detailed;
    exam.submitted = true;

    // Save the updated exam
    await exam.save();

    res.json({
      success: true,
      score: gradeResult.score,
      feedback: gradeResult.feedback,
      detailed: gradeResult.detailed
    });

  } catch (error) {
    console.error('Error submitting practice exam:', error);
    res.status(500).json({
      success: false,
      error: 'Error submitting practice exam',
      details: error.message
    });
  }
});
```

#### Frontend: Results Display
**Location**: `frontend/src/components/PracticeExamResults.jsx`

**Results Flow:**
1. Backend returns `{score, feedback, detailed}` object
2. Frontend displays overall score and feedback
3. Shows detailed breakdown for each question
4. Provides recommendations for improvement

---

## 15. DEVELOPMENT WORKFLOW

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