CHAPTER THREE: RESEARCH METHODOLOGY AND SYSTEM DESIGN

3.1 Introduction

This chapter describes the methodology and technical design underpinning Student Buddy. Section 3.2 explains the software development approach adopted for the project. Section 3.3 analyzes traditional re-reading and Quizlet: the two most common study approaches students currently use, establishing what works, what doesn't, and why an integrated AI-assisted retrieval system addresses gaps neither approach fills adequately. Sections 3.4-3.6 present the proposed system architecture, design specifications, and core algorithms. Section 3.7 describes the evaluation methodology.



3.2 Software Development Approach

Student Buddy's development followed an iterative, user-centered prototyping methodology. This approach combines rapid development cycles with continuous feedback from actual student use, which is essential when designing educational technology where pedagogical effectiveness can only be validated through real interaction.

3.2.1 Why This Approach?

Three factors made iterative prototyping the appropriate choice:

1. Uncertain Requirements  
The project combines AI-powered question generation with note-grounded retrieval practice, a relatively novel combination. Initial requirements could not be fully specified in advance because technical capabilities (what questions the AI could reliably generate, how students would interact with hints) only became clear through implementation and testing.

2. Feature Refinement Through Testing
Educational tools require iterative refinement to ensure features work as intended. Developer testing with varied note content helped answer questions like "Does two-stage hinting provide appropriate support?" and "Is AI-graded feedback clear and actionable?"

3. AI Quality Issues  
Early prototypes revealed that AI-generated questions sometimes had ambiguous wording, implausible distractors, or missed key concepts from notes. These issues required multiple iterations of prompt engineering that could only be discovered through actual generation attempts with diverse note content.

3.2.2 Development Phases

Phase 1: Requirements Analysis (Weeks 1-3) 
Requirements emerged from the literature review (Chapter 2) and informal interviews with undergraduate students about study habits. Key priorities identified:
- Upload and manage text-based notes
- Generate multiple-choice and open-ended questions from note content
- Provide staged feedback (hint → full explanation)
- Track progress per note

Technical feasibility was confirmed: Google's Gemini API could generate structured questions from unstructured text, and libraries existed for PDF text extraction with OCR support.

Phase 2: Core Implementation (Weeks 4-8)  
Focus: Build foundational architecture.
- User authentication (JWT-based)
- Note CRUD operations
- Basic quiz generation and delivery
- Initial AI prompt engineering

Technology Stack Selected:  
MERN (MongoDB, Express, React, Node.js) was chosen for:
- MongoDB: Flexible document storage for variable-structure notes
- Express + Node.js: Mature backend framework with extensive libraries
- React: Component-based UI for responsive study interfaces
- Google Gemini API: AI content generation with acceptable quality-to-cost ratio

Phase 3: Feature Enhancement (Weeks 9-12)
Based on developer testing with diverse note types and usage scenarios:

Additions:
- Open-ended practice exam questions with AI grading
- Two-stage hint system (minimal hint → full explanation)
- OCR support for scanned PDFs using Tesseract.js
- Assessment tracker showing per-note performance trends

Improvements:
- AI prompt engineering underwent six major iterations to reduce question ambiguity
- Added automatic detection of image-based PDFs to trigger OCR processing

Phase 4: Evaluation and Documentation (Weeks 13-16)  
- Structured evaluation with student participants
- Performance data analysis
- System documentation



3.3 Analysis of Existing Systems

Before describing Student Buddy's architecture, we must examine what students currently do. Two approaches dominate: re-reading (what most students do manually) and Quizlet (the most popular digital study tool).

3.3.1 Traditional Re-Reading (Manual Baseline)

Overview  
Re-reading is the default study strategy for most undergraduates. After lectures and readings, students prepare for exams by repeatedly reading through their notes, textbooks, and slides.

Typical Workflow
1. Note Creation: During lectures or while reading, students create notes, handwritten in notebooks, typed in Word/Google Docs, or highlighted in PDFs
2. First Review: Days or weeks later, students read through notes to refresh memory
3. Repeated Reviews: The same material gets re-read multiple times
4. Pre-Exam Cramming: In the final 2-3 days before exams, re-reading intensifies
5. Assessment: The first real test of retention occurs during the exam

What Happens Cognitively  
Re-reading primarily engages recognition memory. When students encounter familiar material, they experience processing fluency; the subjective ease that comes from seeing something before. This fluency creates a sense of mastery that students interpret as learning.

The problem, as established in Chapter 2 (Bjork, Dunlosky & Kornell, 2013), is that recognition poorly predicts recall. Students feel confident after re-reading but struggle to produce answers independently during exams.

Advantages
1. Universal accessibility: requires no technology or training
2. Familiarity and comfort: students have used this since primary school
3. Flexibility: can be done anywhere, anytime
4. Low initial cognitive load: less mentally taxing than retrieval practice
5. Ensures students encounter all material at least once

Limitations
1. Illusion of Competence: Fluency creates false confidence (Bjork et al., 2013)
2. No Active Retrieval: Reading is passive, providing minimal benefit for recall-based exams (Roediger & Butler, 2011)
3. Time Inefficiency: After the first pass, additional re-readings add little value (Karpicke & Blunt, 2011)
4. No Diagnostic Feedback: Students don't know what they know versus don't know until the exam
5. Material Fragmentation: Notes scattered across notebooks, apps, and devices create organizational overhead
6. No Spacing Mechanism: Students typically mass their re-reading (cramming), which is less effective than spaced retrieval
7. No Progress Metrics: Absence of objective measures

3.3.2 Quizlet

Overview  
Quizlet is a web and mobile application that enables students to create, share, and study flashcard sets. It supports multiple study modes and recently added AI features for automatic content generation from uploaded documents.

Core Functionality  
Students create "study sets" of term-definition pairs. The platform offers several interaction modes:
- Flashcard Mode: Traditional card flipping
- Learn Mode: Adaptive practice mixing multiple-choice and typed answers
- Test Mode: Auto-generated practice tests
- AI Features (Magic Notes): Upload documents; Quizlet generates flashcard sets automatically

Advantages
1. Active Retrieval Practice: Requires producing answers, engaging recall rather than recognition
2. Low Barrier to Entry: Creating flashcards is simple
3. Multiple Study Modes: Variety reduces monotony
4. Extensive Shared Content: Millions of user-created study sets publicly available
5. Cross-Platform Availability: Seamless experience across web, iOS, and Android
6. AI-Powered Automation: Recent features reduce manual work
7. Basic Progress Tracking: Analytics show which terms need review

Limitations
1. Surface-Level Question Focus: Flashcard-based study emphasizes term-definition pairs, privileging simple recall over conceptual understanding
2. Generic AI Content Generation: AI operates without knowledge of course-specific learning objectives or instructor emphasis
3. Minimal Feedback Quality: Most modes provide binary right/wrong feedback without explanations
4. No Scaffolding for Productive Struggle: No graduated hints; students either recall or see the answer immediately
5. Weak Integration with Evolving Notes: No persistent connection between flashcards and source materials
6. No Per-Note Progress Tracking: Tracking operates at flashcard-set level, not note-content level
7. Question Quality Variability: AI-generated flashcards sometimes have ambiguous wording or incorrect definitions
8 .Freemium Model Constraints: 
Free tier limits access to basic flashcard mode only
 Advanced features (Learn Mode, Test Mode, image uploads) require Quizlet Plus subscription
 Payment barrier may exclude students with limited financial resources
 Contrasts with fully-featured free alternatives in educational technology space


3.3.3 Summary of Gaps

Neither system combines the three features Student Buddy provides:

1. Note-Grounded AI Generation: Questions derived from students' actual study materials
2. Scaffolded Feedback: Two-stage hints that preserve productive struggle
3. Per-Note Progress Tracking: Performance metrics tied to specific sections of notes


3.4 Analysis of the Proposed System (Student Buddy)

Based on the gaps identified in Section 3.3, Student Buddy is designed to provide an integrated AI-assisted retrieval practice system.

3.4.1 System Overview

Student Buddy is a web-based application that takes students' own study notes and converts them into active retrieval practice. The system operates through four interconnected modules:

1. Note Management Module
- Upload and store notes from multiple sources (PDF, DOCX, TXT, MD formats)
- OCR support for scanned/image-based PDFs
- Organize notes by courses and subjects
- Rich-text editing for note refinement

2. AI Generation Module
- Analyze note content using Google Gemini API
- Generate multiple question types (multiple-choice, open-ended)
- Create contextualized hints and explanations grounded in note content
- Quality filtering to reduce ambiguous questions

3. Practice Module
- Deliver questions in structured quiz sessions
- Implement two-stage hint system (minimal hint → full explanation)
- Grade responses with AI-powered analysis
- Provide immediate, contextualized feedback

4. Assessment Tracking Module
- Record per-note performance history
- Calculate improvement metrics
- Identify weak topics requiring review
- Generate progress visualizations

**[FIGURE 3.1: System Overview Diagram showing four modules and their interconnections]**



3.4.2 Key Features Addressing Existing System Limitations

| Limitation in Existing Systems | Student Buddy Feature | How It Addresses the Gap |
|-------------------------------|----------------------|--------------------------|
| Re-reading: Illusion of competence | Active retrieval practice with immediate testing | Forces production of answers, reveals actual knowledge gaps |
| Re-reading: No diagnostic feedback | Per-question feedback + per-note tracking | Shows what's known vs. unknown at granular level |
| Re-reading: Material fragmentation | Centralized note storage | Single location for all notes |
| Quizlet: Surface-level questions | AI generates varied cognitive-level questions | Targets understanding, not just term-definition recall |
| Quizlet: Weak note integration | Persistent connection: notes → questions → tracking | Questions derived from student's actual materials |
| Quizlet: Binary feedback | Two-stage hint system | Preserves struggle while preventing frustration |
| Both: No per-note progress tracking | Assessment Tracker linked to specific notes | Students see progress on specific notes |

3.4.3 Advantages of the Proposed System

1. Automated question generation reduces setup friction: Students spend seconds instead of hours creating practice materials
2. Note-grounding ensures course alignment: Questions test what students actually studied
3. Two-stage hints preserve learning benefits: Graduated hints maintain productive struggle while providing support
4. Integrated workflow reduces cognitive load: Single platform eliminates context-switching overhead
5. Per-note tracking enables targeted study: Students identify which specific sections need more review
6. AI-powered feedback provides explanations: System explains why answers are right/wrong
7. Progress metrics support metacognition: Visual tracking provides diagnostic information
8. Cross-platform accessibility: Web-based design allows studying from any device


3.4.4 Limitations of the Proposed System

1. Text-only support: Cannot process diagrams, mathematical equations, or chemical formulas
2. Internet dependency: AI features require stable internet connection
3. AI quality variability: Generated questions sometimes have ambiguous wording or implausible distractors
4. Note quality dependency: System output quality reflects input quality ("garbage in, garbage out")
5. No spaced-repetition algorithm: System doesn't automatically schedule review based on forgetting curves
6. Single-user focus: No collaborative features for peer learning



 3.5 System Architecture

Student Buddy is built on the MERN stack (MongoDB, Express, React, Node.js) with Google Gemini API for AI capabilities. The architecture follows a client-server model with clear separation between frontend, backend, and data layer.

3.5.1 High-Level Architecture

**[FIGURE 3.2: System Architecture Diagram showing three layers: Client (React), Server (Express/Node.js), and Data (MongoDB + Gemini API)]**

Component Breakdown:

Client Layer (Frontend)*
- Technology: React 18.2.0 with Vite build tool
- UI Framework: Tailwind CSS for styling, Radix UI for components
- Rich Text Editor: TipTap 2.12.0 for note editing
- Responsibilities: Render user interfaces, capture user inputs, display AI-generated content, visualize progress metrics

Server Layer (Backend)
- Technology: Node.js with Express 4.18.2
- Authentication: JWT (JSON Web Tokens) with bcryptjs for password hashing
- Document Processing: pdf-parse for text extraction, tesseract.js for OCR, mammoth for DOCX
- Responsibilities: Handle API requests, authenticate users, process uploaded documents, interface with Gemini API, manage business logic

Data Layer
- Database: MongoDB 8.1.3 with Mongoose ORM
- AI Service: Google Generative AI (Gemini 2.5 Flash) with automatic key rotation
- Responsibilities: Persist user accounts, notes, courses, quiz records, practice exam results

3.5.2 Database Schema Design

**[FIGURE 3.3: Entity-Relationship Diagram showing relationships between User, Note, Course, QuizResult, and AIGeneratedPracticeExam entities]**

Key Data Models:

User Model
```
- _id: ObjectId (primary key)
- username: String (unique, required)
- email: String (unique, required)
- password: String (hashed, required)
- school: String
- level: String
- courses: Array of ObjectId (references to Course)
- createdAt: Date
- updatedAt: Date
```

Note Model
```
- _id: ObjectId (primary key)
- title: String (required)
- content: String (rich text, required)
- subject: String (folder/category)
- course: ObjectId (reference to Course)
- user: ObjectId (reference to User, required)
- createdAt: Date
- updatedAt: Date
```

**QuizResult Model**
```
- _id: ObjectId (primary key)
- userId: ObjectId (reference to User)
- noteId: ObjectId (reference to Note)
- noteTitle: String
- questions: Array of question objects with hints/explanations
- score: Number (correct answers)
- totalQuestions: Number
- percentage: Number
- passed: Boolean
- timeSpent: Number (seconds)
- retakeOf: ObjectId (reference to previous QuizResult)
- createdAt: Date
```

**AIGeneratedPracticeExam Model**
```
- _id: ObjectId (primary key)
- userId: ObjectId (reference to User)
- topicOrNote: String (full note content for grading reference)
- noteIds: Array of ObjectId (references to Notes)
- questions: Array of Strings (15 open-ended questions)
- userAnswers: Array of Strings
- score: Number (percentage, 0-100)
- feedback: String (overall AI feedback)
- detailed: Array of { question, studentAnswer, mark (0-10), comment, reference }
- submitted: Boolean
- createdAt: Date
```



 3.6 System Design Specifications

 3.6.1 Functional Requirements

User Management:
- FR1: System shall allow users to register with email, username, and password
- FR2: System shall authenticate users via JWT tokens
- FR3: System shall allow users to update profile information

Note Management:
- FR4: System shall support note creation via manual typing or document upload
- FR5: System shall extract text from PDF, DOCX, TXT, and MD files
- FR6: System shall perform OCR on scanned/image-based PDFs
- FR7: System shall allow users to organize notes by course and subject
- FR8: System shall provide rich-text editing capabilities

Quiz Generation:
- FR9: System shall generate multiple-choice questions from note content
- FR10: System shall generate open-ended questions from note content
- FR11: System shall create hints that don't contain keywords from correct answers
- FR12: System shall generate explanations grounded in note content

Practice Sessions:
- FR13: System shall present questions one at a time during quizzes
- FR14: System shall provide immediate feedback after each answer submission
- FR15: System shall implement two-stage hint system
- FR16: System shall calculate and display final score at quiz completion
- FR17: System shall save quiz results linked to source note

Practice Exams:
- FR18: System shall generate full-length practice exams (15 questions)
- FR19: System shall allow selection of multiple notes for exam generation
- FR20: System shall grade open-ended responses using AI
- FR21: System shall provide detailed per-question feedback

Assessment Tracking:
- FR22: System shall display per-note performance history
- FR23: System shall calculate improvement metrics
- FR24: System shall identify topics needing review based on performance

3.6.2 Non-Functional Requirements

Performance:
- NFR1: Quiz generation shall complete within 15 seconds for 10 questions
- NFR2: Practice exam grading shall complete within 30 seconds for 15 questions
- NFR3: Note upload and text extraction shall complete within 60 seconds for documents up to 10MB

Usability:
- NFR4: Interface shall be responsive (desktop, tablet, mobile)
- NFR5: System shall provide clear error messages for failed operations
- NFR6: Quiz interface shall minimize cognitive load (one question per screen)

Reliability:
- NFR7: Failed AI requests shall retry with exponential backoff (max 3 attempts)
- NFR8: System shall implement automatic API key rotation when rate limits hit

Security:
- NFR9: Passwords shall be hashed using bcryptjs (salt rounds ≥ 10)
- NFR10: JWT tokens shall expire after 24 hours
- NFR11: API endpoints shall validate user authorization before data access



3.7 Core System Workflows

3.7.1 Note Upload and Processing Flow

**[FIGURE 3.4: Document Processing Flowchart]**

Process:
1. User uploads document (PDF/DOCX/TXT/MD)
2. Backend receives file via multer middleware
3. System determines file type
4. For PDF: 
   - Attempt text extraction with pdf-parse
   - If text < 100 chars → likely scanned PDF
   - Convert PDF pages to PNG images (pdf-poppler)
   - Run OCR on each image (tesseract.js)
   - Combine OCR text from all pages
5. For DOCX: Extract with mammoth library
6. For TXT/MD: Read file directly
7. Return extracted text to client
8. User reviews text, adds title, selects course/folder
9. Backend creates Note document in MongoDB
10. Return saved note to client


3.7.2 Quiz Generation Flow

**[FIGURE 3.5: Quiz Generation Process Flowchart]**

Process:
1. User selects note and clicks "Generate Quiz"
2. Client sends request to backend with note ID
3. Backend retrieves note content from MongoDB
4. Construct Gemini API prompt:
   ```
   "Generate 15 multiple-choice questions from the following note content.
   Requirements:
   - Questions must test understanding, not just recall
   - Use ONLY information present in the notes
   - Provide 4 options (A, B, C, D) with 1 correct answer
   - For each question provide: a minimal hint and a complete explanation
   
   Note content: {student's actual note text}
   
   Response format: JSON array of question objects"
   ```
5. Send prompt to Gemini API
6. Receive JSON response with questions
7. Validate response structure
8. Return questions to client
9. Client displays quiz interface

3.7.3 Two-Stage Hint System Flow

**[FIGURE 3.6: Two-Stage Hint System Flowchart]**

Process:
1. User reads question and submits answer
2. System checks if answer is correct
3. If CORRECT (first attempt):
   - Display "Correct!" message
   - Show explanation
   - Move to next question
4. If INCORRECT (first attempt):
   - Display "Incorrect" message
   - Show minimal hint
   - Allow second attempt
5. If INCORRECT (second attempt):
   - Display "Still incorrect" message
   - Show correct answer + full explanation
   - Move to next question
6. Repeat for all questions
7. Calculate final score (only first attempts count)
8. Display results summary
9. Save quiz results to database

3.7.4 AI-Graded Practice Exam Flow

**[FIGURE 3.7: Practice Exam Grading Flowchart]**

Process:
1. User selects one or more notes
2. User clicks "Generate Practice Exam"
3. Backend constructs Gemini prompt for exam generation
4. Gemini returns 15 open-ended questions
5. Client displays exam interface (all questions at once)
6. User completes all answers
7. User clicks "Submit Exam"
8. Backend constructs grading prompt:
   ```
   "You are grading a student's exam. Here are the questions and student answers.
   Reference content from notes: {noteContent}
   
   For each answer, provide:
   - Score (0-10)
   - Specific feedback on what's correct/incorrect
   - Suggestions for improvement
   
   Award partial credit for partial understanding."
   ```
9. Send grading prompt to Gemini API
10. Receive graded results with scores and feedback
11. Calculate overall score
12. Save results to database
13. Display:
    - Overall score
    - Per-question breakdown
    - Detailed feedback for each answer
    - Improvement suggestions



3.8 Method of Data Collection

Student Buddy collects data automatically during normal system operations. Data collection occurs across four categories:

3.8.1 User Account Data

Collection Point: User registration and authentication

Data Items:
- Username (unique identifier)
- Email address
- Password (hashed with bcryptjs before storage)
- School name
- Academic level (ND1, ND2, HND1, HND2)
- Course enrollments

Collection Method: HTML forms → POST requests to `/api/auth/register` and `/api/auth/login`

Storage: MongoDB Users collection with Mongoose schema validation

3.8.2 Study Note Data

Collection Point: Note creation and document upload

Data Items:
- Note title and content (rich text with HTML formatting)
- Subject/folder classification
- Associated course reference
- Creation and modification timestamps
- File metadata (filename, type, size) for uploads

Collection Methods:

1. Manual Text Entry:
   - User types directly in TipTap rich-text editor
   - Content saved via POST to `/api/notes`

2. Document Upload:
   - User uploads PDF, DOCX, TXT, or MD files
   - Files processed through multer middleware (max 10MB)
   - Text extracted via backend (see Section 3.10.1)
   - User reviews extracted text before final save

Storage: MongoDB Notes collection with full-text indexing

3.8.3 Quiz Practice Data

Collection Point: Quiz sessions generated from notes

Data Items:

Per Question:
- Question text and type (multiple-choice)
- Four answer options (A, B, C, D)
- Correct answer
- User's submitted answer
- Correctness indicator (true/false)
- Hints requested
- Time spent (seconds)

Per Session:
- Total questions attempted
- Score (number correct on first attempt only)
- Percentage score (0-100%)
- Pass/fail status (≥60% threshold)
- Session duration
- Source note reference

Collection Method:
- Answers captured via form submissions during quiz
- Client-side JavaScript tracks timing
- Results submitted to `/api/quiz-results` on completion

Storage: MongoDB QuizResult collection linked to source Note and User

3.8.4 Practice Exam Data

Collection Point: Open-ended practice exams

Data Items:

Questions:
- 15 open-ended questions generated by AI
- Distributed across cognitive levels (knowledge, understanding, application, analysis)

Responses:
- User's typed answers for each question (Markdown supported)
- AI-generated feedback per answer:
  - Numerical score (0-10 scale)
  - Specific feedback comment
  - Reference to note content
  - Improvement suggestions

Results:
- Overall percentage score
- Overall AI feedback summary
- Submission timestamp

Collection Method:
- Exam answers collected via multi-question form
- Submitted to `/api/practice-exam/submit/:examId`
- Backend sends to Google Gemini API for grading
- Graded results saved to database

Storage: MongoDB AIGeneratedPracticeExam collection

3.8.5 AI-Generated Content

Collection Point: Question generation and answer grading operations

Data Items:
- Generated quiz questions with:
  - Question text
  - Answer options (for MCQ)
  - Correct answer
  - Hint (context clue without answer keywords)
  - Explanation (detailed reasoning)
  
- Grading assessments:
  - Score (0-10 per question)
  - Qualitative feedback
  - Reference to note content

Collection Method:
- Backend constructs prompts from note content
- Sends HTTP POST to Google Gemini API
- Receives JSON-formatted responses
- Validates structure and stores

Storage: Embedded within QuizResult and AIGeneratedPracticeExam documents

3.8.6 System Usage Logs

Automatically Collected:
- Login/logout timestamps
- Session durations
- Note access patterns
- Quiz generation requests (note ID, question count)
- API call logs (requests to Gemini API)
- Error logs (failed operations with error messages)

**Collection Method:** Automatic logging in Express middleware and MongoDB timestamps



3.9 Data Processing

This section describes how raw data is transformed into system outputs.

3.9.1 Document Text Extraction

Objective: Convert uploaded documents into plain text for storage and AI processing.

Process Flow:

```
User uploads file
    ↓
Backend receives via multer
    ↓
Determine file type (.pdf, .docx, .txt, .md)
    ↓
Branch by type:
│
├─ PDF Processing:
│   ├─ Attempt text extraction (pdf-parse library)
│   ├─ If extracted text < 100 chars → Image-based PDF detected
│   │   ├─ Convert pages to PNG images (pdf-poppler)
│   │   ├─ Run OCR on each image (tesseract.js)
│   │   └─ Combine text from all pages
│   └─ Return extracted text
│
├─ DOCX Processing:
│   └─ Extract with mammoth library (preserves formatting)
│
└─ TXT/MD Processing:
    └─ Read file directly (no processing needed)
    ↓
Return clean text to client for review
    ↓
User confirms and saves to MongoDB
```

Key Libraries:
- pdf-parse: Fast text extraction from text-based PDFs
- pdf-poppler: Converts PDF pages to images for OCR
- tesseract.js: Optical character recognition (English model)
- mammoth: DOCX text extraction with formatting

Output: Plain text string saved as note content in MongoDB

3.9.2 AI Quiz Question Generation

Objective: Generate structured quiz questions from note content using Google Gemini API.

Input:
- Note content (text string)
- Configuration: question count (default: 15), question type (MCQ)

Process Flow:

Step 1: Prompt Construction

```javascript
const prompt = `
Generate 15 multiple-choice questions from this note content.

REQUIREMENTS:
- Base questions ONLY on provided content
- Each question must have exactly 4 options (A, B, C, D)
- Include a subtle hint (no answer keywords)
- Provide detailed explanation (2-4 sentences)
- Test understanding, not just memorization

FORMAT:
Q1: [Question text]
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]
Hint: [Contextual clue]
Explanation: [Detailed reasoning]
Answer: [Letter]

CONTENT:
${noteContent}
`;
```

**Step 2: API Request**

```javascript
const response = await geminiAPI.generateContent({
  model: "gemini-2.5-flash",
  prompt: prompt,
  temperature: 0.7  // Balance creativity and consistency
});
```

**Step 3: Response Parsing**

Frontend parses AI response text into structured objects:

```javascript
// Extract each question block (Q1:, Q2:, etc.)
const questionBlocks = response.split(/Q\d+:/).filter(Boolean);

// Parse each block
const questions = questionBlocks.map(block => {
  // Extract answer letter
  const answerMatch = block.match(/Answer:\s*([A-D])/i);
  const correctAnswer = answerMatch ? answerMatch[1].toUpperCase() : null;
  
  // Extract hint
  const hintMatch = block.match(/Hint:\s*(.*?)(?=Explanation:|Answer:|$)/is);
  const hint = hintMatch ? hintMatch[1].trim() : '';
  
  // Extract explanation
  const explanationMatch = block.match(/Explanation:\s*(.*?)(?=Answer:|$)/is);
  const explanation = explanationMatch ? explanationMatch[1].trim() : '';
  
  // Extract options A), B), C), D)
  const parts = block.split(/[A-D]\)/);
  const questionText = parts[0].trim();
  const options = parts.slice(1, 5).map(opt => opt.trim());
  
  return {
    question: questionText,
    options: options,
    correctAnswer: correctAnswer,
    hint: hint,
    explanation: explanation
  };
}).filter(q => q.correctAnswer && q.options.length === 4);
```

**Step 4: Validation**

```javascript
// Ensure quality standards
const validQuestions = questions.filter(q => {
  return (
    q.question.length > 10 &&          // Not trivially short
    q.correctAnswer !== null &&         // Has correct answer
    q.hint.length > 0 &&                // Has hint
    q.explanation.length > 0 &&         // Has explanation
    q.options.length === 4 &&           // Has 4 options
    new Set(q.options).size === 4       // Options are unique
  );
});
```

Output: Array of validated question objects ready for quiz delivery

3.9.3 Answer Grading

**Multiple-Choice Questions:**

Simple string comparison (client-side):

```javascript
function gradeMCQ(userAnswer, correctAnswer) {
  return userAnswer.trim().toUpperCase() === correctAnswer.trim().toUpperCase();
}
```

Open-Ended Questions (Practice Exams):

Process Flow:

Step 1: Construct Grading Prompt

```javascript
const gradingPrompt = `
You are an experienced lecturer grading student answers.

REFERENCE MATERIAL (grade based on this):
${noteContent}

SCORING SCALE (0-10):
9-10: Complete understanding with examples
7-8: Strong understanding, minor gaps
5-6: Good grasp, missing details
3-4: Basic understanding with significant gaps
1-2: Limited understanding
0: No understanding or no answer

FEEDBACK STYLE:
- Sound like a real lecturer
- Be specific and constructive
- Point to what's correct and what's missing

Grade these ${questions.length} answers:

${questions.map((q, i) => `
${i + 1}. ${q}
Student Answer: ${userAnswers[i] || 'No answer provided'}
`).join('\n')}

Return JSON array:
[
  {
    "question": "...",
    "studentAnswer": "...",
    "mark": 0-10,
    "comment": "specific feedback",
    "reference": "relevant note section"
  }
]
`;
```

**Step 2: Send to Gemini API**

```javascript
const response = await geminiAPI.generateContent(gradingPrompt);
const gradeResults = JSON.parse(extractJSON(response.text()));
```

**Step 3: Calculate Overall Score**

```javascript
const totalMarks = gradeResults.reduce((sum, r) => sum + r.mark, 0);
const maxMarks = questions.length * 10;
const percentage = Math.round((totalMarks / maxMarks) * 100);
```

Output:
- Per-question: score (0-10), comment, reference
- Overall: percentage score (0-100%), general feedback

3.9.4 Performance Tracking

Objective: Aggregate quiz/exam history to calculate progress metrics.

Process Flow:

Step 1: Retrieve Historical Data

```javascript
// Get all quiz results for a specific note
const quizHistory = await QuizResult.find({
  userId: userId,
  noteId: noteId
}).sort({ createdAt: 1 });  // Oldest first
```

**Step 2: Calculate Metrics**

```javascript
const scores = quizHistory.map(quiz => quiz.percentage);

const metrics = {
  attempts: quizHistory.length,
  averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
  latestScore: scores[scores.length - 1],
  firstScore: scores[0],
  improvement: scores[scores.length - 1] - scores[0],
  passRate: (scores.filter(s => s >= 60).length / scores.length) * 100,
  trend: calculateTrend(scores)  // "improving", "declining", "stable"
};

function calculateTrend(scores) {
  if (scores.length < 3) return "insufficient_data";
  
  const recent = scores.slice(-3).reduce((a,b) => a+b) / 3;
  const earlier = scores.slice(0, -3).reduce((a,b) => a+b) / (scores.length - 3);
  
  if (recent > earlier + 10) return "improving";
  if (recent < earlier - 10) return "declining";
  return "stable";
}
```

Step 3: Identify Weak Topics

```javascript
// Get all quiz results across all notes for this user
const allResults = await QuizResult.find({ userId: userId });

// Group by note
const performanceByNote = {};
allResults.forEach(result => {
  if (!performanceByNote[result.noteId]) {
    performanceByNote[result.noteId] = {
      noteTitle: result.noteTitle,
      scores: []
    };
  }
  performanceByNote[result.noteId].scores.push(result.percentage);
});

// Calculate average per note and filter weak ones
const weakTopics = Object.entries(performanceByNote)
  .map(([noteId, data]) => ({
    noteId,
    noteTitle: data.noteTitle,
    averageScore: data.scores.reduce((a,b) => a+b) / data.scores.length
  }))
  .filter(note => note.averageScore < 60)  // Below passing threshold
  .sort((a, b) => a.averageScore - b.averageScore);  // Lowest first
```

Output:
- Dashboard metrics: attempts, average, improvement, trend
- Weak topics list: notes requiring more review



3.10 Design Specifications

3.10.1 System Architecture

Architecture Pattern: Three-tier client-server model

Technology Stack:

| Layer | Technologies |
|-------|-------------|
| **Presentation** | React 18.2.0, Vite 7.1.7, Tailwind CSS 3.3.3 |
| **Application** | Node.js, Express.js 4.18.2, JWT authentication |
| **Data** | MongoDB 8.1.3 with Mongoose ODM |
| **External Services** | Google Gemini API 2.5-flash, Cloudinary |

**Communication:** RESTful API with JSON data exchange, JWT tokens for authentication

3.10.2 Database Schema

Users Collection:
```javascript
{
  _id: ObjectId,
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  school: String,
  level: String,
  courses: [ObjectId],  // References to Course documents
  createdAt: Date,
  updatedAt: Date
}
```

Notes Collection:
```javascript
{
  _id: ObjectId,
  title: String (required),
  content: String (rich HTML, required),
  subject: String,  // Acts as folder/category
  course: ObjectId,  // Reference to Course
  user: ObjectId (required),  // Reference to User
  createdAt: Date,
  updatedAt: Date
}
```

Courses Collection:
```javascript
{
  _id: ObjectId,
  user: ObjectId (required),
  name: String (required),
  code: String,
  school: String (required),
  level: String (required),
  semester: String,
  topics: [{
    name: String,
    description: String,
    keyConcepts: [String]
  }],
  createdAt: Date,
  updatedAt: Date
}
```

QuizResults Collection:
```javascript
{
  _id: ObjectId,
  userId: ObjectId (required),
  noteId: ObjectId,
  noteTitle: String (required),
  questions: [{
    question: String,
    options: [String],  // 4 options for MCQ
    correctAnswer: String,
    userAnswer: String,
    isCorrect: Boolean,
    hint: String,
    explanation: String
  }],
  retakeOf: ObjectId,  // Reference to original quiz if retake
  score: Number,  // Count of correct answers
  totalQuestions: Number,
  percentage: Number (0-100),
  passed: Boolean,  // true if percentage >= 60
  timeSpent: Number,  // seconds
  createdAt: Date,
  updatedAt: Date
}
```

AIGeneratedPracticeExams Collection:
```javascript
{
  _id: ObjectId,
  userId: ObjectId (required),
  topicOrNote: String,  // Full note content for grading reference
  noteIds: [ObjectId],  // References to source notes
  noteTitles: [String],
  questions: [String],  // 15 open-ended questions
  userAnswers: [String],
  score: Number (0-100),  // Percentage
  feedback: String,  // Overall AI feedback
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

Indexes:
```javascript
// For efficient querying
QuizResults: { userId: 1, noteId: 1, createdAt: -1 }
Notes: { user: 1, createdAt: -1 }
AIGeneratedPracticeExams: { userId: 1, createdAt: -1 }
```

3.10.3 API Endpoints

Authentication:
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate user and return JWT
- `GET /api/auth/verify` - Verify JWT token validity

Notes Management:
- `POST /api/notes` - Create new note
- `GET /api/notes` - Get all user's notes (with optional filters)
- `GET /api/notes/:id` - Get specific note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note
- `POST /api/notes/upload/extract-text` - Upload document and extract text

Quiz Operations:
- `POST /api/ai/generate-quiz` - Generate quiz from note content
- `POST /api/quiz-results` - Save completed quiz results
- `GET /api/quiz-results/:quizId` - Get specific quiz results
- `POST /api/quiz-results/:quizId/retake` - Create retake quiz

Practice Exams:
- `POST /api/practice-exam/start` - Generate practice exam
- `GET /api/practice-exam/:examId` - Get exam details
- `POST /api/practice-exam/submit/:examId` - Submit answers for grading
- `POST /api/practice-exam/:examId/retake` - Create retake exam

Assessment Tracking:
- `GET /api/practice-exam/history` - Get assessment history
- `GET /api/practice-exam/history?noteId=:id` - Filter by note

Courses:
- `POST /api/courses` - Create course
- `GET /api/courses` - Get all user's courses
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

3.10.4 Security Specifications

Authentication:
- JWT tokens with 24-hour expiration
- Tokens stored in localStorage (client)
- Bearer token authentication for protected routes

Password Security:
- bcryptjs hashing with 10 salt rounds
- Passwords never stored in plain text
- Password hashing via Mongoose pre-save hook

Authorization:
- Middleware verifies JWT on every protected route
- User can only access own data (enforced by userId checks)
- No cross-user data leakage

CORS Configuration:
```javascript
const allowedOrigins = [
  'http://localhost:5173',           // Development
  'https://your-production-domain.com'  // Production
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation'), false);
    }
  },
  credentials: true
}));
```


3.11 Input/Output Specifications

3.11.1 User Registration

Input:
```json
POST /api/auth/register
Content-Type: application/json

{
  "username": "tuoyo_precious",
  "email": "tuoyo@student.pti.edu.ng",
  "password": "SecurePass123!",
  "school": "Petroleum Training Institute",
  "level": "ND2"
}
```

Output (Success):
```json
HTTP 201 Created

{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "507f1f77bcf86cd799439011"
}
```

Output (Error):
```json
HTTP 400 Bad Request

{
  "success": false,
  "message": "Email already registered"
}
```

3.11.2 Note Upload and Text Extraction

Input:
```
POST /api/notes/upload/extract-text
Content-Type: multipart/form-data
Authorization: Bearer {token}

file: [Binary data of PDF/DOCX file]
```

Output (Success):
```json
HTTP 200 OK

{
  "success": true,
  "text": "Chapter 1: Introduction...",
  "filename": "psychology-notes.pdf",
  "extractedLength": 15420
}
```

Output (Error - File too large):
```json
HTTP 413 Payload Too Large

{
  "success": false,
  "error": "File size exceeds 10MB limit"
}
```

3.11.3 Note Creation

Input:
```json
POST /api/notes
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "Cognitive Psychology - Week 1",
  "content": "<p>Memory systems can be divided...</p>",
  "subject": "Psychology",
  "course": "507f1f77bcf86cd799439012"
}
```

Output:
```json
HTTP 201 Created

{
  "success": true,
  "note": {
    "_id": "507f1f77bcf86cd799439013",
    "title": "Cognitive Psychology - Week 1",
    "content": "<p>Memory systems can be divided...</p>",
    "subject": "Psychology",
    "course": "507f1f77bcf86cd799439012",
    "user": "507f1f77bcf86cd799439011",
    "createdAt": "2025-04-10T11:00:00Z",
    "updatedAt": "2025-04-10T11:00:00Z"
  }
}
```

3.11.4 Quiz Generation

Input:
```json
POST /api/ai/generate-quiz
Content-Type: application/json
Authorization: Bearer {token}

{
  "noteContent": "Memory systems consist of three types...",
  "questionCount": 15
}
```

Output:
```json
HTTP 200 OK

{
  "success": true,
  "questions": [
    {
      "question": "What are the three main types of memory systems?",
      "options": [
        "Sensory, short-term, long-term",
        "Implicit, explicit, procedural",
        "Episodic, semantic, working",
        "Encoding, storage, retrieval"
      ],
      "correctAnswer": "A",
      "hint": "Think about how information flows from perception to storage",
      "explanation": "Memory consists of sensory (brief), short-term (temporary), and long-term (permanent) storage systems."
    }
    // ... 14 more questions
  ]
}
```

3.11.5 Quiz Submission

Input:
```json
POST /api/quiz-results
Content-Type: application/json
Authorization: Bearer {token}

{
  "noteId": "507f1f77bcf86cd799439013",
  "noteTitle": "Cognitive Psychology - Week 1",
  "questions": [
    {
      "question": "What are the three main types...",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "userAnswer": "A",
      "isCorrect": true,
      "hint": "...",
      "explanation": "..."
    }
    // ... more questions
  ],
  "score": 12,
  "totalQuestions": 15,
  "percentage": 80,
  "passed": true,
  "timeSpent": 420
}
```

Output:
```json
HTTP 201 Created

{
  "success": true,
  "result": {
    "_id": "507f1f77bcf86cd799439014",
    "percentage": 80,
    "passed": true,
    "improvement": "+15%",
    "createdAt": "2025-04-10T15:00:00Z"
  }
}
```

3.11.6 Practice Exam Generation

Input:
```json
POST /api/practice-exam/start
Content-Type: application/json
Authorization: Bearer {token}

{
  "topicOrNote": "--- NOTE 1 ---\nCognitive Psychology content...",
  "noteIds": ["507f1f77bcf86cd799439013"]
}
```

Output:
```json
HTTP 200 OK

{
  "success": true,
  "exam": {
    "_id": "507f1f77bcf86cd799439020",
    "questions": [
      "Define retrieval practice and explain its key components.",
      "Explain why retrieval practice is more effective than rereading.",
      "How would you apply retrieval practice to study for an exam?",
      // ... 12 more questions
    ],
    "createdAt": "2025-04-10T16:00:00Z"
  }
}
```

3.11.7 Practice Exam Submission and Grading

Input:
```json
POST /api/practice-exam/submit/507f1f77bcf86cd799439020
Content-Type: application/json
Authorization: Bearer {token}

{
  "userAnswers": [
    "Retrieval practice involves actively recalling information from memory...",
    "It forces deeper processing and strengthens memory traces...",
    "I would create practice questions from my notes and test myself regularly...",
    // ... 12 more answers
  ]
}
```

Output:
```json
HTTP 200 OK

{
  "success": true,
  "score": 75,
  "feedback": "Good understanding shown. Focus on providing more specific examples.",
  "detailed": [
    {
      "question": "Define retrieval practice...",
      "studentAnswer": "Retrieval practice involves...",
      "mark": 8,
      "comment": "Strong definition. You captured the key elements clearly.",
      "reference": "See notes section 2.2 on retrieval practice fundamentals."
    },
    {
      "question": "Explain why retrieval practice...",
      "studentAnswer": "It forces deeper processing...",
      "mark": 7,
      "comment": "Good explanation but missing comparison with other methods.",
      "reference": "Review section 2.3 comparing study strategies."
    }
    // ... 13 more detailed feedback items
  ]
}
```

3.11.8 Assessment History Retrieval

Input:
```
GET /api/practice-exam/history?noteId=507f1f77bcf86cd799439013
Authorization: Bearer {token}
```

Output:
```json
HTTP 200 OK

{
  "success": true,
  "assessments": [
    {
      "id": "507f1f77bcf86cd799439014",
      "type": "quiz",
      "title": "Cognitive Psychology - Week 1",
      "date": "2025-04-10T15:00:00Z",
      "score": 12,
      "totalQuestions": 15,
      "percentage": 80,
      "status": "completed",
      "passed": true
    },
    {
      "id": "507f1f77bcf86cd799439020",
      "type": "practice-exam",
      "title": "Psychology Practice Exam",
      "date": "2025-04-10T16:30:00Z",
      "score": 75,
      "status": "completed"
    }
  ],
  "summary": {
    "totalAssessments": 2,
    "completedAssessments": 2,
    "averageScore": 77.5
  }
}
```



3.12 Chapter Summary

This chapter presented the complete methodology and system design for Student Buddy:

Section 3.2 described the iterative prototyping approach with four development phases, justified by uncertain requirements and the need for pedagogical validation through real student interaction.

Section 3.3 analyzed existing systems (traditional re-reading and Quizlet), identifying critical gaps in note-grounding, feedback scaffolding, and progress tracking that Student Buddy addresses.

Sections 3.4-3.7 presented the proposed system architecture, showing how the MERN stack with Google Gemini API integration provides note management, AI question generation, practice sessions, and assessment tracking through four interconnected modules.

Section 3.8 detailed data collection methods across six categories: user accounts, study notes, quiz practice data, practice exams, AI-generated content, and system usage logs—all collected automatically during normal operations.

Section 3.9 explained data processing procedures: document text extraction (including OCR for scanned PDFs), AI question generation through structured prompts, answer grading (simple comparison for MCQ, AI analysis for open-ended), and performance tracking aggregation for progress metrics.

Section 3.10 provided design specifications including the three-tier architecture, complete database schema with five primary collections (Users, Notes, Courses, QuizResults, AIGeneratedPracticeExams), comprehensive API endpoint listing, and security measures (JWT authentication, password hashing, CORS configuration).

Section 3.11 specified input/output formats for all major operations, demonstrating request/response structures for user registration, note upload, quiz generation and submission, practice exam workflows, and assessment history retrieval.

Together, these components establish a complete technical foundation for Student Buddy's implementation as an AI-assisted retrieval practice system that automates question generation from students' own notes while maintaining pedagogical effectiveness through scaffolded feedback and progress tracking.


