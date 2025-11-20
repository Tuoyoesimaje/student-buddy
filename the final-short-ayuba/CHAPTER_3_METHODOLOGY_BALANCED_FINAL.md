# CHAPTER THREE: RESEARCH METHODOLOGY

## 3.1 Introduction

This chapter describes the research methodology adopted for Student Buddy, an AI-assisted retrieval practice system. Section 3.2 explains the software development approach and justifies the iterative prototyping methodology. Section 3.3 analyzes existing study systems (traditional re-reading and Quizlet), identifying gaps that Student Buddy addresses. Section 3.4 presents the proposed system with its architecture and key features. Section 3.5 describes data collection and processing methods. Section 3.6 provides design specifications including functional requirements, system architecture, and workflows.

---

## 3.2 Software Development Approach

### 3.2.1 Methodology Selection

Student Buddy's development followed an **iterative prototyping methodology** for three key reasons:

**1. Uncertain Requirements**  
The combination of AI-powered question generation with note-grounded retrieval practice is relatively novel. Technical capabilities (what questions the AI could reliably generate, how students would interact with hints) only became clear through implementation and testing cycles.

**2. Pedagogical Validation Through Use**  
Educational technology effectiveness can only be validated through actual use. Questions like "Does two-stage hinting preserve productive struggle?" required iterative testing with varied note content.

**3. AI Quality Refinement**  
Early prototypes revealed AI-generated questions sometimes had ambiguous wording or missed key concepts. These issues required systematic prompt engineering—an inherently iterative process.

### 3.2.2 Development Phases

**Phase 1: Requirements Analysis (Weeks 1-3)**

Activities:
- Literature review on retrieval practice and educational technology
- Informal interviews with undergraduate students about study habits
- Technical feasibility confirmation (Gemini API capabilities, MERN stack suitability)

Key Priorities Identified:
- Upload and manage text-based notes from multiple sources
- Generate multiple-choice and open-ended questions from note content
- Provide staged feedback (hint → full explanation)
- Track progress per note

**Phase 2: Core Implementation (Weeks 4-8)**

Backend Development:
- User authentication (JWT with bcrypt password hashing)
- RESTful API with Express.js
- MongoDB database with Mongoose schemas
- Basic CRUD operations for notes
- Initial Gemini API integration

Frontend Development:
- React application with routing
- Authentication pages
- Notes management interface
- Basic note editor using TipTap

Technology Stack Rationale:
- **MongoDB**: Document-oriented storage for variable-structure notes
- **Express + Node.js**: Mature backend framework with extensive middleware
- **React**: Component-based architecture for complex interactive interfaces
- **Google Gemini API**: Acceptable quality-to-cost ratio for educational content

**Phase 3: Feature Enhancement (Weeks 9-12)**

Major Additions:
- Two-stage hint system
- Practice exam module with AI grading
- OCR support for scanned PDFs (Tesseract.js)
- Assessment tracker showing per-note performance
- Retake functionality for spaced repetition

Iterative Improvements:
- AI prompt engineering (six major iterations to reduce ambiguity)
- Automatic detection of image-based PDFs
- User interface refinement
- Performance optimization with database indexes

**Phase 4: System Refinement and Documentation (Weeks 13-16)**

Final Activities:
- Code refactoring and optimization
- Bug resolution
- Performance tuning
- Comprehensive documentation
- Systematic testing

---

## 3.3 Analysis of Existing Systems

### 3.3.1 Traditional Re-Reading

**How It Operates:**

1. Note Creation: Students create notes during lectures or reading
2. First Review: Days later, students read through notes
3. Repeated Reviews: Same material re-read multiple times
4. Pre-Exam Cramming: Intensified re-reading 2-3 days before exams
5. Assessment: First real test occurs during the exam

**Cognitive Process:**  
Re-reading engages recognition memory rather than recall. Students experience processing fluency (ease from seeing familiar material), creating a false sense of mastery. However, recognition poorly predicts recall ability during exams (Bjork, Dunlosky & Kornell, 2013).

**Merits:**
- Universal accessibility (no technology required)
- Familiarity and comfort
- Flexibility (anywhere, anytime)
- Low initial cognitive load
- Ensures comprehensive coverage

**Demerits:**
- Illusion of competence from processing fluency
- No active retrieval (passive reading)
- Time inefficiency after first pass
- No diagnostic feedback until exam
- Material fragmentation across platforms
- No spacing mechanism (encourages cramming)
- No progress metrics

### 3.3.2 Quizlet

**How It Operates:**

Students create flashcard sets (term-definition pairs) or use AI generation from uploaded documents. The platform offers multiple study modes:
- Flashcard Mode: Traditional card flipping
- Learn Mode: Adaptive practice with multiple-choice and typed answers
- Test Mode: Auto-generated practice tests
- AI Features (Magic Notes): Automatic flashcard generation from documents

**Merits:**
- Active retrieval practice (requires producing answers)
- Low barrier to entry
- Multiple study modes reduce monotony
- Extensive shared content library
- Cross-platform availability
- AI-powered automation
- Basic progress tracking
- Spaced repetition algorithm

**Demerits:**
- Surface-level focus (term-definition pairs over conceptual understanding)
- Generic AI generation (no course-specific alignment)
- Minimal feedback quality (binary right/wrong)
- No scaffolding for productive struggle
- Weak integration with evolving notes
- No per-note progress tracking
- Question quality variability
- Freemium model constraints (advanced features require subscription)

### 3.3.3 Gap Summary

Neither system provides:
1. **Note-Grounded AI Generation**: Questions from students' actual study materials
2. **Scaffolded Feedback**: Two-stage hints preserving productive struggle
3. **Per-Note Progress Tracking**: Performance metrics tied to specific note sections

---

## 3.4 Analysis of Proposed System (Student Buddy)

### 3.4.1 System Overview

Student Buddy is a web-based application that converts students' study notes into active retrieval practice through four interconnected modules:

**1. Note Management Module**
- Upload notes (PDF, DOCX, TXT, MD formats)
- OCR support for scanned PDFs
- Organize by courses and subjects
- Rich-text editing

**2. AI Generation Module**
- Analyze note content using Gemini API
- Generate multiple-choice and open-ended questions
- Create contextualized hints and explanations
- Quality filtering

**3. Practice Module**
- Deliver structured quiz sessions
- Two-stage hint system (minimal hint → full explanation)
- AI-powered grading
- Immediate contextualized feedback

**4. Assessment Tracking Module**
- Per-note performance history
- Improvement metrics
- Weak topic identification
- Progress visualizations

### 3.4.2 Key Features Addressing Gaps

| Existing System Limitation | Student Buddy Feature | How It Addresses Gap |
|---------------------------|----------------------|---------------------|
| Re-reading: Illusion of competence | Active retrieval with immediate testing | Forces answer production, reveals knowledge gaps |
| Re-reading: No diagnostic feedback | Per-question feedback + per-note tracking | Shows known vs. unknown at granular level |
| Re-reading: Material fragmentation | Centralized note storage | Single location for all notes |
| Quizlet: Surface-level questions | AI generates varied cognitive-level questions | Targets understanding, not just recall |
| Quizlet: Weak note integration | Persistent notes → questions → tracking connection | Questions from actual materials |
| Quizlet: Binary feedback | Two-stage hint system | Preserves struggle while providing support |
| Both: No per-note tracking | Assessment Tracker linked to specific notes | Progress on specific note sections |

### 3.4.3 System Advantages

1. **Automated question generation**: Seconds instead of hours
2. **Note-grounding**: Questions test what students actually studied
3. **Two-stage hints**: Maintains productive struggle with support
4. **Integrated workflow**: Single platform reduces cognitive load
5. **Per-note tracking**: Identifies specific sections needing review
6. **AI-powered feedback**: Explains why answers are right/wrong
7. **Progress metrics**: Supports metacognitive awareness
8. **Cross-platform**: Web-based, accessible from any device

### 3.4.4 System Limitations

1. **Text-only support**: Cannot process diagrams, equations, or formulas
2. **Internet dependency**: AI features require stable connection
3. **AI quality variability**: Occasional ambiguous questions
4. **Note quality dependency**: Output quality reflects input quality
5. **No spaced-repetition algorithm**: Doesn't auto-schedule reviews
6. **Single-user focus**: No collaborative features

---

## 3.5 Data Collection and Processing

### 3.5.1 Data Collection Methods

Student Buddy automatically collects data during normal operations:

**User Account Data:**
- Username, email, hashed password
- School name, academic level
- Course enrollments
- Collection: HTML forms → POST to `/api/auth/register` and `/api/auth/login`

**Study Note Data:**
- Title, content (rich text HTML)
- Subject/folder classification
- Course reference, timestamps
- Collection: Manual entry (TipTap editor) or document upload (multer middleware)

**Quiz Practice Data:**
- Questions, answers, scores, time spent
- Hints requested, attempt counts
- Collection: Form submissions during quiz → POST to `/api/quiz-results`

**Practice Exam Data:**
- Open-ended questions, user answers
- AI grades (0-10 scale), detailed feedback
- Collection: Multi-question form → POST to `/api/practice-exam/submit/:examId`

**System Usage Logs:**
- Login timestamps, session durations
- Note access patterns, API calls
- Error logs
- Collection: Automatic logging in Express middleware

### 3.5.2 Data Processing

**Document Text Extraction:**

Process Flow:
1. User uploads file (PDF/DOCX/TXT/MD)
2. Backend determines file type
3. For PDF:
   - Attempt text extraction (pdf-parse)
   - If text < 100 chars → scanned PDF detected
   - Convert pages to PNG (pdf-poppler)
   - Run OCR (tesseract.js, limited to 50 pages)
   - Combine text from all pages
4. For DOCX: Extract with mammoth library
5. For TXT/MD: Read directly
6. Return text to client for review
7. User confirms and saves to MongoDB

**AI Quiz Question Generation:**

Process:
1. Construct prompt with note content and requirements
2. Send to Gemini API (model: gemini-2.5-flash)
3. Parse response into structured question objects
4. Validate (check for correct answer, hint, explanation, 4 unique options)
5. Return validated questions

**Answer Grading:**

Multiple-Choice: Simple string comparison (client-side)

Open-Ended (Practice Exams):
1. Construct grading prompt with note content, questions, and answers
2. Send to Gemini API
3. Receive JSON with scores (0-10), comments, references
4. Calculate overall percentage
5. Return detailed feedback

**Performance Tracking:**

1. Retrieve quiz history for specific note
2. Calculate metrics: attempts, average score, improvement, trend
3. Identify weak topics (notes with <60% average)
4. Return dashboard metrics and weak topics list

---

## 3.6 System Design Specifications

### 3.6.1 Functional Requirements

**User Management:**
- FR1: User registration with email, username, password
- FR2: JWT-based authentication
- FR3: Profile updates

**Note Management:**
- FR4: Note creation (manual or upload)
- FR5: Text extraction from PDF, DOCX, TXT, MD
- FR6: OCR for scanned PDFs
- FR7: Organization by course and subject
- FR8: Rich-text editing

**Quiz Generation:**
- FR9: Generate multiple-choice questions from notes
- FR10: Generate open-ended questions from notes
- FR11: Create hints without answer keywords
- FR12: Generate note-grounded explanations

**Practice Sessions:**
- FR13: Present questions one at a time
- FR14: Immediate feedback after submission
- FR15: Two-stage hint system
- FR16: Calculate and display final score
- FR17: Save results linked to source note

**Practice Exams:**
- FR18: Generate 15-question exams
- FR19: Multi-note exam generation
- FR20: AI grading of open-ended responses
- FR21: Detailed per-question feedback

**Assessment Tracking:**
- FR22: Per-note performance history
- FR23: Improvement metrics
- FR24: Weak topic identification

### 3.6.2 Non-Functional Requirements

**Performance:**
- NFR1: Quiz generation within 15 seconds
- NFR2: Exam grading within 30 seconds
- NFR3: Note upload/extraction within 60 seconds (up to 10MB)

**Usability:**
- NFR4: Responsive interface (desktop, tablet, mobile)
- NFR5: Clear error messages
- NFR6: Minimal cognitive load (one question per screen)

**Reliability:**
- NFR7: Retry failed AI requests (max 3 attempts)
- NFR8: Automatic API key rotation on rate limits

**Security:**
- NFR9: Bcrypt password hashing (10 salt rounds)
- NFR10: JWT tokens expire after 24 hours
- NFR11: User authorization validation on all endpoints

### 3.6.3 System Architecture

**Three-Tier Architecture:**

| Layer | Technologies | Responsibilities |
|-------|-------------|------------------|
| **Presentation** | React 18.2.0, Vite, Tailwind CSS, TipTap | Render UI, capture inputs, display content |
| **Application** | Node.js, Express 4.18.2, JWT, bcryptjs | Handle requests, authenticate, process documents, interface with AI |
| **Data** | MongoDB 8.1.3, Mongoose, Gemini API | Persist data, AI generation/grading |

**Communication:** RESTful API with JSON, JWT authentication

### 3.6.4 Database Schema

**Users Collection:**
```javascript
{
  _id: ObjectId,
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  school: String,
  level: String,
  courses: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

**Notes Collection:**
```javascript
{
  _id: ObjectId,
  title: String (required),
  content: String (rich HTML, required),
  subject: String,
  course: ObjectId,
  user: ObjectId (required),
  createdAt: Date,
  updatedAt: Date
}
```

**QuizResults Collection:**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (required),
  noteId: ObjectId,
  noteTitle: String (required),
  questions: [{
    question: String,
    options: [String],
    correctAnswer: String,
    userAnswer: String,
    isCorrect: Boolean,
    hint: String,
    explanation: String
  }],
  retakeOf: ObjectId,
  score: Number,
  totalQuestions: Number,
  percentage: Number (0-100),
  passed: Boolean,
  timeSpent: Number,
  createdAt: Date
}
```

**AIGeneratedPracticeExams Collection:**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (required),
  topicOrNote: String,
  noteIds: [ObjectId],
  questions: [String],
  userAnswers: [String],
  score: Number (0-100),
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

### 3.6.5 Core System Workflows

**Quiz Generation Flow:**
1. User selects note and clicks "Generate Quiz"
2. Client sends request with note ID
3. Backend retrieves note content
4. Construct Gemini API prompt with requirements
5. Send to Gemini API
6. Receive and validate JSON response
7. Return questions to client
8. Client displays quiz interface

**Two-Stage Hint System Flow:**
1. User submits answer
2. If CORRECT (1st attempt): Show "Correct!" + explanation → next question
3. If INCORRECT (1st attempt): Show hint + "Try again" button
4. If INCORRECT (2nd attempt): Show correct answer + explanation → next question
5. Calculate final score (only 1st attempts count)
6. Display results summary
7. Save to database

**Practice Exam Grading Flow:**
1. User selects notes and generates exam
2. Gemini returns 15 open-ended questions
3. User completes all answers
4. User submits exam
5. Backend constructs grading prompt with note content
6. Send to Gemini API
7. Receive graded results (scores + feedback)
8. Calculate overall percentage
9. Save to database
10. Display results with detailed per-question breakdown

### 3.6.6 API Endpoints

**Authentication:**
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Authenticate and return JWT
- `GET /api/auth/verify` - Verify token

**Notes:**
- `GET /api/notes` - List all user notes
- `GET /api/notes/:id` - Get single note
- `POST /api/notes` - Create note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note
- `POST /api/notes/upload/extract-text` - Upload and extract text

**AI:**
- `POST /api/ai/generate-quiz` - Generate quiz
- `POST /api/ai/explain` - Get AI explanation
- `POST /api/ai/summarize` - Summarize note

**Practice Exams:**
- `POST /api/practice-exam/start` - Generate exam
- `POST /api/practice-exam/submit/:examId` - Submit for grading
- `GET /api/practice-exam/:examId` - Get results
- `GET /api/practice-exam/history` - Get assessment history

### 3.6.7 Security Specifications

**Authentication:**
- JWT tokens (24-hour expiration)
- Stored in localStorage (client)
- Bearer token authentication

**Password Security:**
- Bcrypt hashing (10 salt rounds)
- Never stored in plain text
- Hashing via Mongoose pre-save hook

**Authorization:**
- JWT verification on all protected routes
- User can only access own data
- No cross-user data leakage

**CORS Configuration:**
- Restricted to localhost:5173 (development)
- Credentials enabled for trusted origin only

---

## 3.7 Summary

This chapter presented the research methodology for Student Buddy:

**Section 3.2** described the iterative prototyping approach with four development phases over 16 weeks, justified by uncertain requirements and the need for pedagogical validation.

**Section 3.3** analyzed existing systems (re-reading and Quizlet), revealing gaps in note-grounding, feedback scaffolding, and progress tracking.

**Section 3.4** presented Student Buddy's architecture with four interconnected modules addressing identified gaps through automated note-grounded question generation, two-stage hints, and per-note progress tracking.

**Section 3.5** detailed data collection methods (user accounts, notes, quizzes, exams, logs) and processing procedures (document extraction, AI generation, grading, performance tracking).

**Section 3.6** provided complete design specifications including functional/non-functional requirements, three-tier architecture, database schemas, core workflows, API endpoints, and security measures.

The methodology establishes a rigorous foundation for the system implementation described in Chapter 4, ensuring design decisions are grounded in research evidence and address real student needs.

---

**[End of Chapter 3]**
