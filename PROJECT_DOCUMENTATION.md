# Student Buddy - Project Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Architecture Overview](#architecture-overview)
5. [Frontend Implementation](#frontend-implementation)
6. [Backend Implementation](#backend-implementation)
7. [Database Schema](#database-schema)
8. [API Documentation](#api-documentation)
9. [AI Integration](#ai-integration)
10. [Authentication & Security](#authentication--security)
11. [Deployment Guide](#deployment-guide)
12. [Development Setup](#development-setup)

---

## 🎯 Project Overview

**Student Buddy** is a streamlined web application focused on helping students manage their academic workflow through intelligent note-taking and study tools. The application emphasizes AI-powered assistance for content generation and explanation, combined with a clean, modern interface.

### Current Features
- **Note Management**: Rich text editing, search, sorting, filtering, multi-select operations, AI-powered explanations and summaries
- **Active Learning Tools**: AI-generated quizzes with gamification (points, streaks, achievements), practice exams with AI grading
- **AI Integration**: Note generation, concept explanations, quiz creation, practice exam generation, AI summaries, AI chat, note processing
- **Course Management**: Organize notes and study materials by courses and folders
- **Modern UI/UX**: Dark mode, responsive design, clean interface with gamification elements
- **Study Tools**: Pomodoro timer, retrieval practice, note-based quiz generation

---

## 🛠 Technology Stack

### Frontend Stack
```json
{
  "framework": "React 18",
  "routing": "React Router DOM",
  "styling": "Tailwind CSS",
  "state_management": "React Context + Hooks",
  "build_tool": "Vite",
  "ui_components": "Custom Components + Tailwind",
  "icons": "Heroicons",
  "rich_text": "Rich text editing capabilities",
  "notifications": "React Hot Toast",
  "deployment": "Vercel"
}
```

## 🛠 Developer Notes (recent changes)

- Fixed: Backend did not expose `/api/users` routes in one server entrypoint which caused the frontend `Settings` page to receive 404 errors when calling `/api/users/me` and upload endpoints. The `users` routes are now mounted in `backend/server.js` with `app.use('/api/users', userRoutes);` so endpoints like `PUT /api/users/me` and `POST /api/users/me/profile-picture` are available.

If you run into similar 404s from frontend pages, check `backend/server.js` to ensure the corresponding router is mounted and that middleware ordering (body parser, auth) is correct.

### Backend Stack
```json
{
  "runtime": "Node.js",
  "framework": "Express.js",
  "database": "MongoDB with Mongoose",
  "authentication": "JWT + bcryptjs",
  "ai_integration": "Google Generative AI",
  "file_upload": "Multer",
  "security": "CORS + Helmet",
  "validation": "Express validation"
}
```

### Development Tools
```json
{
  "package_manager": "npm",
  "dev_server": "Vite Dev Server",
  "hot_reload": "Nodemon",
  "css_processing": "PostCSS + Autoprefixer",
  "code_quality": "ESLint",
  "deployment": "Vercel (Frontend) + Backend hosting"
}
```

---

## 📁 Project Structure

```
student-buddy/
├── 📁 frontend/                    # React frontend application
│   ├── 📁 public/                  # Static assets and PWA files
│   ├── 📁 src/
│   │   ├── 📁 components/          # Reusable UI components
│   │   │   ├── 📁 layout/          # Layout components (MainLayout)
│   │   │   ├── 📁 ui/              # Base UI components (button, card, input, etc.)
│   │   │   ├── AINoteProcessor.jsx  # AI-powered note processing
│   │   │   ├── NoteCard.jsx        # Note display component
│   │   │   ├── NoteModal.jsx       # Note editing modal
│   │   │   ├── PracticeExam.jsx    # Practice exam components
│   │   │   ├── RichTextEditor.jsx  # Rich text editing
│   │   │   └── ThemeToggle.jsx     # Dark/light mode toggle
│   │   ├── 📁 pages/               # Main page components
│   │   │   ├── Login.jsx           # Authentication pages
│   │   │   ├── Register.jsx
│   │   │   ├── Notes.jsx           # Note management
│   │   │   ├── Study.jsx           # Study tools and quizzes
│   │   │   ├── Settings.jsx        # User settings
│   │   │   └── Practice Exam pages # Exam management
│   │   ├── 📁 context/             # React contexts
│   │   │   ├── AuthContext.jsx     # Authentication state
│   │   │   └── ThemeContext.jsx    # Theme management
│   │   ├── 📁 hooks/               # Custom hooks
│   │   ├── 📁 services/            # API services
│   │   └── 📁 utils/               # Utility functions
│   ├── package.json                # Frontend dependencies
│   ├── vite.config.js              # Vite configuration
│   ├── tailwind.config.js          # Tailwind CSS config
│   └── postcss.config.js           # PostCSS config
├── 📁 backend/                     # Node.js backend application
│   ├── 📁 controllers/             # Route controllers
│   │   ├── noteController.js       # Note management logic
│   │   └── auth.js                 # Authentication logic
│   ├── 📁 models/                  # Mongoose models
│   │   ├── User.js                 # User data model
│   │   ├── Note.js                 # Note data model
│   │   ├── Course.js               # Course data model
│   │   ├── CourseTopic.js          # Course topic model
│   │   ├── PracticeExam.js         # Practice exam model
│   │   ├── Quiz.js                 # Quiz model
│   │   └── AIGeneratedPracticeExam.js # AI exam model
│   ├── 📁 routes/                  # API routes
│   │   ├── auth.js                 # Authentication endpoints
│   │   ├── notes.js                # Note CRUD operations
│   │   ├── courses.js              # Course management
│   │   ├── practiceExam.js         # Practice exam endpoints
│   │   ├── study.js                # Study tools
│   │   ├── users.js                # User management
│   │   ├── ai.js                   # AI-powered features
│   │   └── noteGeneration.js       # Note generation
│   ├── 📁 middleware/              # Custom middleware
│   │   └── auth.js                 # JWT authentication
│   ├── 📁 services/                # Business logic services
│   │   └── aiService.js            # AI integration service
│   ├── 📁 utils/                   # Utility functions
│   ├── 📁 uploads/                 # File uploads directory
│   ├── server.js                   # Main server file
│   └── package.json                # Backend dependencies
├── 📄 PROJECT_DOCUMENTATION.md     # This documentation file
├── 📄 README.md                    # Project overview and setup
└── 📄 QUICK_REFERENCE.md           # Quick reference guide
```

---

## 🏗 Architecture Overview

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Database     │
│   (React SPA)   │◄──►│  (Express API)  │◄──►│   (MongoDB)     │
│                 │    │                 │    │                 │
│ • React Router  │    │ • REST APIs     │    │ • Collections   │
│ • Context API   │    │ • Controllers   │    │ • Mongoose     │
│ • UI Components │    │ • Services      │    │ • Schemas      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
          │
          │
          ▼
┌─────────────────┐
│  External APIs  │
│ • Google AI     │
└─────────────────┘
```

### Data Flow
1. **User Interaction** → Frontend React Components
2. **State Management** → React Context/Hooks
3. **API Calls** → Axios HTTP Client
4. **Backend Processing** → Express Route Handlers
5. **Database Operations** → Mongoose ODM
6. **External Services** → Google AI API for content generation

---

## 🎨 Frontend Implementation

### Application Structure
```
App.jsx (Root)
├── AuthContext (Authentication)
├── ThemeContext (Dark/Light Mode)
└── MainLayout
    ├── Sidebar Navigation (Collapsible)
    └── Page Content
        ├── Notes (with AI Explain)
        ├── Active Learning (Quiz Generation)
        ├── Practice Exams
        └── Settings
```

### Key Frontend Components

#### 1. **Layout Components**
- `MainLayout.jsx` - Main application layout with responsive sidebar
- Sidebar with collapsible navigation (Notes, Study, Practice Exam, Settings)

#### 2. **Page Components**
- `Login.jsx` & `Register.jsx` - Authentication pages
- `Notes.jsx` - Note management with CRUD operations and AI explain feature
- `Study.jsx` - Active Learning page with AI-powered quiz generation and study tools
- `PracticeExamListPage.jsx` - Practice exam management interface
- `PracticeExamPage.jsx` - Individual practice exam view
- `PracticeExamQuestionsPage.jsx` - Exam questions interface
- `PracticeExamResultsPage.jsx` - Exam results and review
- `Settings.jsx` - User settings and preferences

#### 3. **Feature Components**
- `NoteCard.jsx` - Individual note display with edit/delete actions
- `AINoteProcessor.jsx` - AI-powered note processing (summarize/explain)
- `NoteModal.jsx` - Modal for creating/editing notes
- `NoteSearchSelector.jsx` - Advanced note search and selection interface
- `NoteGenerationModal.jsx` - AI-powered note generation interface
- `FolderCard.jsx` - Folder display component for note organization
- `CourseTopicsManager.jsx` - Course topics management interface
- `PracticeExam.jsx` - Practice exam generation interface
- `PracticeExamList.jsx` - List of available practice exams
- `PracticeExamQuestions.jsx` - Interactive exam questions
- `PracticeExamResults.jsx` - Exam results display
- `RichTextEditor.jsx` - Rich text editing capabilities
- `ThemeToggle.jsx` - Dark/light mode toggle component

#### 4. **UI Components**
- `button.jsx`, `card.jsx`, `input.jsx` - Base UI components
- `avatar.jsx` - User avatar display
- `toast.jsx` & `toaster.jsx` - Notification system

### State Management Strategy
```javascript
// Context-based state management
const AuthContext = createContext();    // User authentication state
const ThemeContext = createContext();   // Theme preferences (light/dark)

// Custom hooks for state access
const useAuth = () => useContext(AuthContext);
const useTheme = () => useContext(ThemeContext);
```

### Routing Structure
```javascript
// React Router configuration
<Routes>
  {/* Public routes */}
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />

  {/* Protected routes with MainLayout */}
  <Route path="/app" element={<MainLayout />}>
    <Route index element={<Navigate to="/app/active-learning" />} />
    <Route path="notes" element={<Notes />} />
    <Route path="active-learning" element={<Study />} />
    <Route path="settings" element={<Settings />} />

    {/* Practice Exam Routes */}
    <Route path="practice-exam" element={<PracticeExamPage />} />
    <Route path="practice-exam/list" element={<PracticeExamListPage />} />
    <Route path="practice-exam/questions/:examId" element={<PracticeExamQuestionsPage />} />
    <Route path="practice-exam/results/:examId" element={<PracticeExamResultsPage />} />
  </Route>
</Routes>
```

---

## ⚙️ Backend Implementation

### Server Architecture
```
server.js (Entry Point)
├── Express App Configuration
├── Middleware Setup (CORS, JSON parsing)
├── Route Registration
├── Database Connection (MongoDB)
└── Error Handling
```

### API Structure
```
/api/
├── /auth             # Authentication endpoints
├── /users            # User management
├── /notes            # Note CRUD operations
├── /courses          # Course management
├── /course-topics    # Course topic management
├── /ai               # AI-powered features
├── /note-generation  # Note generation endpoints
├── /practice-exam    # Practice exam system
├── /study            # Study tools and quizzes
└── /groups           # Group management
```

### Key Backend Components

#### 1. **Controllers**
- `noteController.js` - Note management logic (CRUD operations)
- `auth.js` - Authentication controller (login, register, token management)

#### 2. **Models (Mongoose Schemas)**
```javascript
// User.js - User data model (Simplified)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  school: String,
  class: String,
  profilePicture: String,
  level: String,
  semesterStart: String,
  semesterEnd: String,
  semesterGoals: String,
  preferences: {
    theme: { type: String, default: 'system' },
    language: { type: String, default: 'en' }
  },
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Note.js - Note data model (Simplified)
const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  subject: String,
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  attachments: [{
    name: String,
    type: String,
    url: String,
    size: Number
  }],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Course.js - Course management
const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: String,
  description: String,
  instructor: String,
  schedule: {
    days: [String],
    time: String,
    location: String
  },
  topics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CourseTopic' }],
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});
```

#### 3. **Middleware**
```javascript
// auth.js - JWT Authentication middleware
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Access denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
};
```

#### 4. **Services**
```javascript
// aiService.js - AI integration service
const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  async generateNotes(topic, context, courseInfo) {
    const prompt = `
      Generate comprehensive study notes for the topic: "${topic}"
      Context: ${context}
      Course: ${courseInfo?.name || 'General'}

      Please structure the notes with:
      1. Clear headings and subheadings
      2. Key concepts and definitions
      3. Examples where applicable
      4. Summary points

      Format in Markdown for better readability.
    `;

    const result = await this.model.generateContent(prompt);
    return result.response.text();
  }

  async explainConcept(content, level = 'intermediate') {
    const prompt = `
      Explain the following concept at a ${level} level:
      "${content}"

      Provide:
      1. Simple explanation
      2. Key points
      3. Real-world examples
      4. Common misconceptions (if any)
    `;

    const result = await this.model.generateContent(prompt);
    return result.response.text();
  }

  async generateQuiz(topic, difficulty, questionCount) {
    const prompt = `
      Create a ${difficulty} level quiz about "${topic}" with ${questionCount} questions.

      Format each question as:
      {
        "question": "Question text",
        "options": ["A", "B", "C", "D"],
        "correct": 0,
        "explanation": "Why this answer is correct"
      }

      Return as valid JSON array.
    `;

    const result = await this.model.generateContent(prompt);
    return JSON.parse(result.response.text());
  }
}
```

---

## 🗄️ Database Schema

### MongoDB Collections

#### 1. **Users Collection**
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String (hashed),
  school: String,
  class: String,
  profilePicture: String,
  level: String,
  semesterStart: String,
  semesterEnd: String,
  semesterGoals: String,
  preferences: {
    theme: String,
    language: String
  },
  courses: [ObjectId] (ref: Course),
  createdAt: Date,
  updatedAt: Date
}
```

#### 2. **Notes Collection**
```javascript
{
  _id: ObjectId,
  title: String,
  content: String,
  subject: String,
  course: ObjectId (ref: Course),
  attachments: [{
    name: String,
    type: String,
    url: String,
    size: Number
  }],
  user: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

#### 3. **Courses Collection**
```javascript
{
  _id: ObjectId,
  name: String,
  code: String,
  description: String,
  instructor: String,
  schedule: {
    days: [String],
    time: String,
    location: String
  },
  topics: [ObjectId] (ref: CourseTopic),
  students: [ObjectId] (ref: User),
  createdAt: Date
}
```

#### 4. **CourseTopics Collection**
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  course: ObjectId (ref: Course),
  order: Number,
  createdAt: Date
}
```

#### 5. **PracticeExams Collection**
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  duration: Number, // in minutes
  totalMarks: Number,
  passingMarks: Number,
  questions: [{
    question: String,
    options: [String],
    correctAnswer: Number,
    marks: Number
  }],
  category: String,
  difficulty: String, // 'easy' | 'medium' | 'hard'
  createdAt: Date,
  updatedAt: Date
}
```

#### 6. **Quizzes Collection**
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  questions: [{
    question: String,
    options: [String],
    correctAnswer: Number,
    explanation: String
  }],
  timeLimit: Number, // in minutes
  difficulty: String, // 'easy' | 'medium' | 'hard'
  category: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### 7. **AIGeneratedPracticeExams Collection**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  topicOrNote: String,
  questions: [String], // Array of question strings
  userAnswers: [String], // Array of user answer strings
  score: Number, // Final score (0-100)
  feedback: String, // Overall feedback
  detailed: [{ // Detailed results per question
    q: String, // Question
    a: String, // User's answer
    mark: Number // Marks awarded (0-10)
  }],
  submitted: Boolean, // Whether exam is submitted
  createdAt: Date
}
```

### Database Relationships
```
User (1) ──── (N) Notes
User (1) ──── (N) Courses (many-to-many)
User (1) ──── (N) PracticeExams
User (1) ──── (N) Quizzes
Course (1) ──── (N) Notes
Course (1) ──── (N) CourseTopics
Course (1) ──── (N) PracticeExams
```

---

## 🔌 API Documentation

### Authentication Endpoints
```http
POST /api/auth/register
Content-Type: application/json
{
  "username": "string",
  "email": "string",
  "password": "string"
}

POST /api/auth/login
Content-Type: application/json
{
  "email": "string",
  "password": "string"
}

GET /api/auth/me
Authorization: Bearer <token>
```

### Notes API
```http
GET /api/notes
Authorization: Bearer <token>
Query: ?course=<courseId>&subject=<subject>&search=<term>

POST /api/notes
Authorization: Bearer <token>
Content-Type: application/json
{
  "title": "string",
  "content": "string",
  "course": "ObjectId",
  "subject": "string"
}

PUT /api/notes/:id
Authorization: Bearer <token>
Content-Type: application/json
{
  "title": "string",
  "content": "string",
  "subject": "string"
}

DELETE /api/notes/:id
Authorization: Bearer <token>
```

### Courses API
```http
GET /api/courses
Authorization: Bearer <token>

POST /api/courses
Authorization: Bearer <token>
Content-Type: application/json
{
  "name": "string",
  "code": "string",
  "description": "string",
  "instructor": "string"
}

PUT /api/courses/:id
Authorization: Bearer <token>
Content-Type: application/json

DELETE /api/courses/:id
Authorization: Bearer <token>
```

### Course Topics API
```http
GET /api/course-topics
Authorization: Bearer <token>
Query: ?course=<courseId>

POST /api/course-topics
Authorization: Bearer <token>
Content-Type: application/json
{
  "name": "string",
  "description": "string",
  "course": "ObjectId"
}
```

### AI Integration API
```http
POST /api/ai/generate-notes
Authorization: Bearer <token>
Content-Type: application/json
{
  "topic": "string",
  "context": "string",
  "course": "ObjectId"
}

POST /api/ai/explain
Authorization: Bearer <token>
Content-Type: application/json
{
  "content": "string",
  "level": "beginner|intermediate|advanced"
}

POST /api/ai/generate-quiz
Authorization: Bearer <token>
Content-Type: application/json
{
  "topic": "string"
}

POST /api/ai/explain
Authorization: Bearer <token>
Content-Type: application/json
{
  "text": "string",
  "noteContent": "string" // optional
}

POST /api/ai/summarize
Authorization: Bearer <token>
Content-Type: application/json
{
  "text": "string"
}

POST /api/ai/chat
Authorization: Bearer <token>
*Note: The FloatingAIAssistant component was removed from the frontend, but this endpoint is kept for future chat implementation.*
Content-Type: application/json
{
  "prompt": "string",
  "messages": [...], // optional chat history
  "courses": [...] // optional enrolled courses
}

POST /api/ai/process-note
Authorization: Bearer <token>
Content-Type: application/json
{
  "noteId": "ObjectId",
  "action": "summarize|explain"
}
```

### Practice Exam API
```http
POST /api/practice-exam/start
Authorization: Bearer <token>
Content-Type: application/json
{
  "topicOrNote": "string"
}

POST /api/practice-exam/submit/:examId
Authorization: Bearer <token>
Content-Type: application/json
{
  "userAnswers": ["answer1", "answer2", ...]
}

GET /api/practice-exam
Authorization: Bearer <token>

GET /api/practice-exam/:examId
Authorization: Bearer <token>
```

### Study API
```http
GET /api/study/quizzes
Authorization: Bearer <token>

GET /api/study/quizzes/:id
Authorization: Bearer <token>

POST /api/study/quizzes/submit
Authorization: Bearer <token>
Content-Type: application/json
{
  "quizId": "ObjectId",
  "answers": [0, 1, 2, ...] // Array of answer indices
}

GET /api/study/practice-exams
Authorization: Bearer <token>

GET /api/study/practice-exams/:id
Authorization: Bearer <token>

POST /api/study/practice-exams/submit
Authorization: Bearer <token>
Content-Type: application/json
{
  "examId": "ObjectId",
  "answers": ["answer1", "answer2", ...] // Array of answer strings
}
```

### Users API
```http
GET /api/users/profile
Authorization: Bearer <token>

PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json
{
  "school": "string",
  "class": "string",
  "semesterGoals": "string"
}
```

---

## 🤖 AI Integration

### Google Generative AI Implementation
```javascript
// aiService.js - Core AI service
const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  async generateNotes(topic, context, courseInfo) {
    const prompt = `
      Generate comprehensive study notes for the topic: "${topic}"
      Context: ${context}
      Course: ${courseInfo?.name || 'General'}

      Please structure the notes with:
      1. Clear headings and subheadings
      2. Key concepts and definitions
      3. Examples where applicable
      4. Summary points

      Format in Markdown for better readability.
    `;

    const result = await this.model.generateContent(prompt);
    return result.response.text();
  }

  async explainConcept(content, level = 'intermediate') {
    const prompt = `
      Explain the following concept at a ${level} level:
      "${content}"

      Provide:
      1. Simple explanation
      2. Key points
      3. Real-world examples
      4. Common misconceptions (if any)
    `;

    const result = await this.model.generateContent(prompt);
    return result.response.text();
  }

  async generateQuiz(topic, difficulty, questionCount) {
    const prompt = `
      Create a ${difficulty} level quiz about "${topic}" with ${questionCount} questions.

      Format each question as:
      {
        "question": "Question text",
        "options": ["A", "B", "C", "D"],
        "correct": 0,
        "explanation": "Why this answer is correct"
      }

      Return as valid JSON array.
    `;

    const result = await this.model.generateContent(prompt);
    return JSON.parse(result.response.text());
  }
}
```

### AI Features Implementation
1. **Note Generation**: Automatic creation of structured study notes from topics
2. **Concept Explanation**: AI-powered explanations for complex topics within notes (hint + full explanation)
3. **Quiz Generation**: Dynamic quiz creation based on topics or note content
4. **Practice Exam Generation**: AI-generated practice exams with 15 questions from notes or topics
5. **AI Grading**: Intelligent grading of practice exams with detailed feedback
6. **Note Summarization**: AI-powered summarization of note content
7. **Note Processing**: AI summarization and explanation of existing notes
8. **AI Chat**: Conversational AI assistant for study-related queries

---

## 🔐 Authentication & Security

### JWT Implementation
```javascript
// Token generation
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Token verification middleware
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Access denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
};
```

### Security Measures
```javascript
// Password hashing
const bcrypt = require('bcryptjs');
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// CORS configuration
app.use(cors({
  origin: ['https://main-student-buddy.vercel.app', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
```

---

## 🚀 Deployment Guide

### Frontend Deployment (Vercel)
The frontend is configured for deployment on Vercel with the following settings:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Backend Deployment
The backend can be deployed to any Node.js hosting service (Railway, Heroku, DigitalOcean, etc.) with the following environment variables:

```bash
# Server Configuration
PORT=3001
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
FRONTEND_URL=https://your-frontend-domain.vercel.app

# AI Integration
GOOGLE_AI_API_KEY=your_google_ai_api_key
```

### Build Scripts
```json
// Frontend package.json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext js,jsx --report-unused-disable-directives --max-warnings 0"
  }
}

// Backend package.json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

---

## 🛠 Development Setup

### Local Development Setup
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install

# Configure environment variables (see below)
# Start backend server
npm run dev

# Start frontend server (in another terminal)
cd ../frontend && npm run dev
```

### Environment Variables

**Backend (.env)**:
```bash
PORT=3001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
FRONTEND_URL=http://localhost:5173
GOOGLE_AI_API_KEY=your_google_ai_api_key
```

**Frontend (.env)**:
```bash
VITE_BACKEND_URL=http://localhost:3001
```

---

## 📊 Current Features Summary

### ✅ Implemented Features
1. **User Authentication** - JWT-based authentication with secure password hashing
2. **Advanced Note Management** - Full CRUD operations, rich text editing, search, sorting, filtering, multi-select operations, AI-powered explanations and summaries
3. **AI Integration** - Google Generative AI for note generation, concept explanations, quiz creation, practice exam generation, AI grading, summarization, and chat
4. **Gamified Study Tools** - AI-powered quizzes with points/streaks/achievements, practice exams with AI grading, Pomodoro timer, retrieval practice
5. **Course & Folder Management** - Organize study materials by courses and dynamic folders
6. **Modern UI/UX** - Dark mode, responsive design, clean interface with gamification elements
7. **Practice Exam System** - AI-generated practice exams with intelligent grading and detailed feedback

### 🔧 Technical Implementation
- **Frontend**: React 18 with Vite, Tailwind CSS, and modern hooks-based state management
- **Backend**: Node.js with Express.js, MongoDB, and RESTful API design
- **AI Integration**: Google Generative AI for intelligent content generation
- **Security**: JWT authentication with bcrypt password hashing
- **Database**: MongoDB with Mongoose ODM for data modeling
- **Development**: Modern development workflow with hot reloading

---

## 🎯 Documentation Update Summary

This documentation has been comprehensively updated to accurately reflect the current feature-rich implementation of **Student Buddy**. The analysis revealed extensive undocumented features that have been added to provide a complete picture of the application's capabilities.

### Key Changes Made:
- **Updated Features List**: Added comprehensive feature descriptions including gamification, advanced note management, and AI capabilities
- **Database Schemas**: Corrected all MongoDB collection schemas to match actual implementations
- **API Documentation**: Added missing endpoints for quiz management, practice exam grading, AI chat, summarization, and note processing
- **AI Integration**: Expanded to include all AI service methods and features
- **Frontend Components**: Added missing component documentation
- **Feature Scope**: Updated to reflect the full breadth of implemented functionality

### Current Application Scope:
**Student Buddy** is a comprehensive academic productivity platform that features:
- Advanced note management with AI-powered explanations, summaries, and processing
- Gamified study tools including quizzes with points/streaks/achievements and AI-graded practice exams
- Intelligent AI integration across all study workflows
- Course and folder-based organization with advanced search and filtering
- Modern, responsive interface with dark mode and gamification elements
- Study tools like Pomodoro timer and retrieval practice features

**Total API Endpoints**: 20+ RESTful endpoints
**Database Collections**: 7 MongoDB collections
**Core Features**: 7 main feature categories with extensive sub-features

This documentation serves as an accurate reference for understanding, maintaining, and extending the current Student Buddy application. The streamlined architecture makes it more maintainable while retaining the core AI-powered academic assistance features that provide the most value to students. 🎓📚✨
