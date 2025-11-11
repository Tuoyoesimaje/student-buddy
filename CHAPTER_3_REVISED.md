# CHAPTER THREE: RESEARCH METHODOLOGY AND SYSTEM DESIGN

## 3.1 Introduction

This chapter describes the methodology and technical design underpinning Student Buddy. Section 3.2 explains the software development approach adopted for the project. Section 3.3 analyzes traditional re-reading and Quizlet—the two most common study approaches students currently use—establishing what works, what doesn't, and why an integrated AI-assisted retrieval system addresses gaps neither approach fills adequately. Sections 3.4-3.6 present the proposed system architecture, design specifications, and core algorithms. Section 3.7 describes the evaluation methodology.

---

## 3.2 Software Development Approach

Student Buddy's development followed an **iterative, user-centered prototyping methodology**. This approach combines rapid development cycles with continuous feedback from actual student use, which is essential when designing educational technology where pedagogical effectiveness can only be validated through real interaction.

### 3.2.1 Why This Approach?

Three factors made iterative prototyping the appropriate choice:

**1. Uncertain Requirements**  
The project combines AI-powered question generation with note-grounded retrieval practice—a relatively novel combination. Initial requirements could not be fully specified in advance because technical capabilities (what questions the AI could reliably generate, how students would interact with hints) only became clear through implementation and testing.

**2. Pedagogical Validation Needs**  
Unlike purely technical systems, learning tools must be validated with real students. Questions like "Does two-stage hinting preserve productive struggle?" or "Do students find AI-graded feedback useful?" can only be answered through cycles of build → test → refine.

**3. AI Quality Issues**  
Early prototypes revealed that AI-generated questions sometimes had ambiguous wording, implausible distractors, or missed key concepts from notes. These issues required multiple iterations of prompt engineering that could only be discovered through actual generation attempts with diverse note content.

### 3.2.2 Development Phases

**Phase 1: Requirements Analysis (Weeks 1-3)**  
Requirements emerged from the literature review (Chapter 2) and informal interviews with undergraduate students about study habits. Key priorities identified:
- Upload and manage text-based notes
- Generate multiple-choice and open-ended questions from note content
- Provide staged feedback (hint → full explanation)
- Track progress per note

Technical feasibility was confirmed: Google's Gemini API could generate structured questions from unstructured text, and libraries existed for PDF text extraction with OCR support.

**Phase 2: Core Implementation (Weeks 4-8)**  
Focus: Build foundational architecture.
- User authentication (JWT-based)
- Note CRUD operations
- Basic quiz generation and delivery
- Initial AI prompt engineering

**Technology Stack Selected:**  
MERN (MongoDB, Express, React, Node.js) was chosen for:
- **MongoDB**: Flexible document storage for variable-structure notes
- **Express + Node.js**: Mature backend framework with extensive libraries
- **React**: Component-based UI for responsive study interfaces
- **Google Gemini API**: AI content generation with acceptable quality-to-cost ratio

**Phase 3: Feature Enhancement (Weeks 9-12)**  
Based on pilot testing with five undergraduate students:

*Additions:*
- Open-ended practice exam questions with AI grading
- Two-stage hint system (minimal hint → full explanation)
- OCR support for scanned PDFs using Tesseract.js
- Assessment tracker showing per-note performance trends

*Improvements:*
- AI prompt engineering underwent six major iterations to reduce question ambiguity
- Added automatic detection of image-based PDFs to trigger OCR processing

**Phase 4: Evaluation and Documentation (Weeks 13-16)**  
- Structured evaluation with student participants
- Performance data analysis
- System documentation

---

## 3.3 Analysis of Existing Systems

Before describing Student Buddy's architecture, we must examine what students currently do. Two approaches dominate: **re-reading** (what most students do manually) and **Quizlet** (the most popular digital study tool).

### 3.3.1 Traditional Re-Reading (Manual Baseline)

**Overview**  
Re-reading is the default study strategy for most undergraduates. After lectures and readings, students prepare for exams by repeatedly reading through their notes, textbooks, and slides.

**Typical Workflow**
1. **Note Creation**: During lectures or while reading, students create notes—handwritten in notebooks, typed in Word/Google Docs, or highlighted in PDFs
2. **First Review**: Days or weeks later, students read through notes to refresh memory
3. **Repeated Reviews**: The same material gets re-read multiple times
4. **Pre-Exam Cramming**: In the final 2-3 days before exams, re-reading intensifies
5. **Assessment**: The first real test of retention occurs during the exam

**What Happens Cognitively**  
Re-reading primarily engages **recognition memory**. When students encounter familiar material, they experience **processing fluency**—the subjective ease that comes from seeing something before. This fluency creates a sense of mastery that students interpret as learning.

The problem, as established in Chapter 2 (Bjork, Dunlosky & Kornell, 2013), is that recognition poorly predicts recall. Students feel confident after re-reading but struggle to produce answers independently during exams.

**Advantages**
1. Universal accessibility—requires no technology or training
2. Familiarity and comfort—students have used this since primary school
3. Flexibility—can be done anywhere, anytime
4. Low initial cognitive load—less mentally taxing than retrieval practice
5. Ensures students encounter all material at least once

**Limitations**
1. **Illusion of Competence**: Fluency creates false confidence (Bjork et al., 2013)
2. **No Active Retrieval**: Reading is passive, providing minimal benefit for recall-based exams (Roediger & Butler, 2011)
3. **Time Inefficiency**: After the first pass, additional re-readings add little value (Karpicke & Blunt, 2011)
4. **No Diagnostic Feedback**: Students don't know what they know versus don't know until the exam
5. **Material Fragmentation**: Notes scattered across notebooks, apps, and devices create organizational overhead
6. **No Spacing Mechanism**: Students typically mass their re-reading (cramming), which is less effective than spaced retrieval
7. **No Progress Metrics**: Absence of objective measures

### 3.3.2 Quizlet

**Overview**  
Quizlet is a web and mobile application that enables students to create, share, and study flashcard sets. It supports multiple study modes and recently added AI features for automatic content generation from uploaded documents.

**Core Functionality**  
Students create "study sets" of term-definition pairs. The platform offers several interaction modes:
- **Flashcard Mode**: Traditional card flipping
- **Learn Mode**: Adaptive practice mixing multiple-choice and typed answers
- **Test Mode**: Auto-generated practice tests
- **AI Features** (Magic Notes): Upload documents; Quizlet generates flashcard sets automatically

**Advantages**
1. **Active Retrieval Practice**: Requires producing answers, engaging recall rather than recognition
2. **Low Barrier to Entry**: Creating flashcards is simple
3. **Multiple Study Modes**: Variety reduces monotony
4. **Extensive Shared Content**: Millions of user-created study sets publicly available
5. **Cross-Platform Availability**: Seamless experience across web, iOS, and Android
6. **AI-Powered Automation**: Recent features reduce manual work
7. **Basic Progress Tracking**: Analytics show which terms need review

**Limitations**
1. **Surface-Level Question Focus**: Flashcard-based study emphasizes term-definition pairs, privileging simple recall over conceptual understanding
2. **Generic AI Content Generation**: AI operates without knowledge of course-specific learning objectives or instructor emphasis
3. **Minimal Feedback Quality**: Most modes provide binary right/wrong feedback without explanations
4. **No Scaffolding for Productive Struggle**: No graduated hints—students either recall or see the answer immediately
5. **Weak Integration with Evolving Notes**: No persistent connection between flashcards and source materials
6. **No Per-Note Progress Tracking**: Tracking operates at flashcard-set level, not note-content level
7. **Question Quality Variability**: AI-generated flashcards sometimes have ambiguous wording or incorrect definitions

### 3.3.3 Summary of Gaps

Neither system combines the three features Student Buddy provides:

1. **Note-Grounded AI Generation**: Questions derived from students' actual study materials
2. **Scaffolded Feedback**: Two-stage hints that preserve productive struggle
3. **Per-Note Progress Tracking**: Performance metrics tied to specific sections of notes

---

## 3.4 Analysis of the Proposed System (Student Buddy)

Based on the gaps identified in Section 3.3, Student Buddy is designed to provide an integrated AI-assisted retrieval practice system.

### 3.4.1 System Overview

Student Buddy is a web-based application that takes students' own study notes and converts them into active retrieval practice. The system operates through four interconnected modules:

**1. Note Management Module**
- Upload and store notes from multiple sources (PDF, DOCX, TXT, MD formats)
- OCR support for scanned/image-based PDFs
- Organize notes by courses and subjects
- Rich-text editing for note refinement

**2. AI Generation Module**
- Analyze note content using Google Gemini API
- Generate multiple question types (multiple-choice, open-ended)
- Create contextualized hints and explanations grounded in note content
- Quality filtering to reduce ambiguous questions

**3. Practice Module**
- Deliver questions in structured quiz sessions
- Implement two-stage hint system (minimal hint → full explanation)
- Grade responses with AI-powered analysis
- Provide immediate, contextualized feedback

**4. Assessment Tracking Module**
- Record per-note performance history
- Calculate improvement metrics
- Identify weak topics requiring review
- Generate progress visualizations

**[FIGURE 3.1: System Overview Diagram showing four modules and their interconnections]**



### 3.4.2 Key Features Addressing Existing System Limitations

| Limitation in Existing Systems | Student Buddy Feature | How It Addresses the Gap |
|-------------------------------|----------------------|--------------------------|
| Re-reading: Illusion of competence | Active retrieval practice with immediate testing | Forces production of answers, reveals actual knowledge gaps |
| Re-reading: No diagnostic feedback | Per-question feedback + per-note tracking | Shows what's known vs. unknown at granular level |
| Re-reading: Material fragmentation | Centralized note storage | Single location for all notes |
| Quizlet: Surface-level questions | AI generates varied cognitive-level questions | Targets understanding, not just term-definition recall |
| Quizlet: Weak note integration | Persistent connection: notes → questions → tracking | Questions derived from student's actual materials |
| Quizlet: Binary feedback | Two-stage hint system | Preserves struggle while preventing frustration |
| Both: No per-note progress tracking | Assessment Tracker linked to specific notes | Students see progress on specific notes |

### 3.4.3 Advantages of the Proposed System

1. **Automated question generation reduces setup friction**: Students spend seconds instead of hours creating practice materials
2. **Note-grounding ensures course alignment**: Questions test what students actually studied
3. **Two-stage hints preserve learning benefits**: Graduated hints maintain productive struggle while providing support
4. **Integrated workflow reduces cognitive load**: Single platform eliminates context-switching overhead
5. **Per-note tracking enables targeted study**: Students identify which specific sections need more review
6. **AI-powered feedback provides explanations**: System explains why answers are right/wrong
7. **Progress metrics support metacognition**: Visual tracking provides diagnostic information
8. **Cross-platform accessibility**: Web-based design allows studying from any device

### 3.4.4 Limitations of the Proposed System

1. **Text-only support**: Cannot process diagrams, mathematical equations, or chemical formulas
2. **Internet dependency**: AI features require stable internet connection
3. **AI quality variability**: Generated questions sometimes have ambiguous wording or implausible distractors
4. **Note quality dependency**: System output quality reflects input quality ("garbage in, garbage out")
5. **No spaced-repetition algorithm**: System doesn't automatically schedule review based on forgetting curves
6. **Single-user focus**: No collaborative features for peer learning

---

## 3.5 System Architecture

Student Buddy is built on the MERN stack (MongoDB, Express, React, Node.js) with Google Gemini API for AI capabilities. The architecture follows a client-server model with clear separation between frontend, backend, and data layer.

### 3.5.1 High-Level Architecture

**[FIGURE 3.2: System Architecture Diagram showing three layers: Client (React), Server (Express/Node.js), and Data (MongoDB + Gemini API)]**

**Component Breakdown:**

**Client Layer (Frontend)**
- **Technology**: React 18.2.0 with Vite build tool
- **UI Framework**: Tailwind CSS for styling, Radix UI for components
- **Rich Text Editor**: TipTap 2.12.0 for note editing
- **Responsibilities**: Render user interfaces, capture user inputs, display AI-generated content, visualize progress metrics

**Server Layer (Backend)**
- **Technology**: Node.js with Express 4.18.2
- **Authentication**: JWT (JSON Web Tokens) with bcryptjs for password hashing
- **Document Processing**: pdf-parse for text extraction, tesseract.js for OCR, mammoth for DOCX
- **Responsibilities**: Handle API requests, authenticate users, process uploaded documents, interface with Gemini API, manage business logic

**Data Layer**
- **Database**: MongoDB 8.1.3 with Mongoose ORM
- **AI Service**: Google Generative AI (Gemini 2.5 Flash) with automatic key rotation
- **Responsibilities**: Persist user accounts, notes, courses, quiz records, practice exam results

### 3.5.2 Database Schema Design

**[FIGURE 3.3: Entity-Relationship Diagram showing relationships between User, Note, Course, QuizResult, and AIGeneratedPracticeExam entities]**

**Key Data Models:**

**User Model**
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

**Note Model**
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

---

## 3.6 System Design Specifications

### 3.6.1 Functional Requirements

**User Management:**
- FR1: System shall allow users to register with email, username, and password
- FR2: System shall authenticate users via JWT tokens
- FR3: System shall allow users to update profile information

**Note Management:**
- FR4: System shall support note creation via manual typing or document upload
- FR5: System shall extract text from PDF, DOCX, TXT, and MD files
- FR6: System shall perform OCR on scanned/image-based PDFs
- FR7: System shall allow users to organize notes by course and subject
- FR8: System shall provide rich-text editing capabilities

**Quiz Generation:**
- FR9: System shall generate multiple-choice questions from note content
- FR10: System shall generate open-ended questions from note content
- FR11: System shall create hints that don't contain keywords from correct answers
- FR12: System shall generate explanations grounded in note content

**Practice Sessions:**
- FR13: System shall present questions one at a time during quizzes
- FR14: System shall provide immediate feedback after each answer submission
- FR15: System shall implement two-stage hint system
- FR16: System shall calculate and display final score at quiz completion
- FR17: System shall save quiz results linked to source note

**Practice Exams:**
- FR18: System shall generate full-length practice exams (15 questions)
- FR19: System shall allow selection of multiple notes for exam generation
- FR20: System shall grade open-ended responses using AI
- FR21: System shall provide detailed per-question feedback

**Assessment Tracking:**
- FR22: System shall display per-note performance history
- FR23: System shall calculate improvement metrics
- FR24: System shall identify topics needing review based on performance

### 3.6.2 Non-Functional Requirements

**Performance:**
- NFR1: Quiz generation shall complete within 15 seconds for 10 questions
- NFR2: Practice exam grading shall complete within 30 seconds for 15 questions
- NFR3: Note upload and text extraction shall complete within 60 seconds for documents up to 10MB

**Usability:**
- NFR4: Interface shall be responsive (desktop, tablet, mobile)
- NFR5: System shall provide clear error messages for failed operations
- NFR6: Quiz interface shall minimize cognitive load (one question per screen)

**Reliability:**
- NFR7: Failed AI requests shall retry with exponential backoff (max 3 attempts)
- NFR8: System shall implement automatic API key rotation when rate limits hit

**Security:**
- NFR9: Passwords shall be hashed using bcryptjs (salt rounds ≥ 10)
- NFR10: JWT tokens shall expire after 24 hours
- NFR11: API endpoints shall validate user authorization before data access

---

## 3.7 Core System Workflows

### 3.7.1 Note Upload and Processing Flow

**[FIGURE 3.4: Document Processing Flowchart]**

**Process:**
1. User uploads document (PDF/DOCX/TXT/MD)
2. Backend receives file via multer middleware
3. System determines file type
4. **For PDF**: 
   - Attempt text extraction with pdf-parse
   - If text < 100 chars → likely scanned PDF
   - Convert PDF pages to PNG images (pdf-poppler)
   - Run OCR on each image (tesseract.js)
   - Combine OCR text from all pages
5. **For DOCX**: Extract with mammoth library
6. **For TXT/MD**: Read file directly
7. Return extracted text to client
8. User reviews text, adds title, selects course/folder
9. Backend creates Note document in MongoDB
10. Return saved note to client

### 3.7.2 Quiz Generation Flow

**[FIGURE 3.5: Quiz Generation Process Flowchart]**

**Process:**
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

### 3.7.3 Two-Stage Hint System Flow

**[FIGURE 3.6: Two-Stage Hint System Flowchart]**

**Process:**
1. User reads question and submits answer
2. System checks if answer is correct
3. **If CORRECT (first attempt)**:
   - Display "Correct!" message
   - Show explanation
   - Move to next question
4. **If INCORRECT (first attempt)**:
   - Display "Incorrect" message
   - Show minimal hint
   - Allow second attempt
5. **If INCORRECT (second attempt)**:
   - Display "Still incorrect" message
   - Show correct answer + full explanation
   - Move to next question
6. Repeat for all questions
7. Calculate final score (only first attempts count)
8. Display results summary
9. Save quiz results to database

### 3.7.4 AI-Graded Practice Exam Flow

**[FIGURE 3.7: Practice Exam Grading Flowchart]**

**Process:**
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

---

## 3.8 Method of Data Collection

The evaluation of Student Buddy employs a mixed-methods approach combining quantitative performance data with qualitative user feedback.

### 3.8.1 Participant Recruitment

**Target Population**: Undergraduate students (ND1, ND2, HND1, HND2) enrolled at Petroleum Training Institute, Effurun, focusing on text-heavy courses.

**Sample Size**: Target n=30 participants divided into two groups:
- **Experimental Group** (n=15): Use Student Buddy for 4 weeks
- **Control Group** (n=15): Continue traditional study methods

**Recruitment Method**:
- Announcements in classes and departmental notice boards
- Invitation emails via course instructors
- Voluntary participation with informed consent

### 3.8.2 Data Collection Instruments

**1. Pre-Study Questionnaire (Baseline)**
Collects:
- Demographics (age, gender, department, level)
- Current study habits and methods
- Technology use and comfort level
- Content knowledge baseline (10-question pre-test)

**2. System Usage Logs (Automatic Collection)**
For experimental group, system automatically logs:
- Login timestamps and session duration
- Number of notes uploaded
- Total quizzes attempted
- Questions per quiz
- Score per quiz
- Number of times hints were requested
- Practice exam activity and scores

**3. Learning Outcome Assessments**
- **Immediate Retention Test (Week 4)**: 20-question test on study topic
- **Delayed Retention Test (Week 8)**: Same test 4 weeks after intervention ends

**4. Post-Study Questionnaire**
For experimental group:
- Usability ratings (1-5 scale)
- Perceived usefulness (1-5 scale)
- Behavior change observations
- Qualitative feedback (open-ended)

For control group:
- Study methods used during 4 weeks
- Perceived effectiveness
- Challenges faced

**5. Semi-Structured Interviews**
Conducted with 6 participants from experimental group (2 high performers, 2 average, 2 low performers).

### 3.8.3 Data Collection Timeline

| Week | Activity | Data Collected |
|------|----------|----------------|
| Week 0 | Recruitment and Consent | Participant information |
| Week 1 | Pre-Study Questionnaire + Pre-Test | Demographics, baseline knowledge |
| Weeks 1-4 | Intervention Period | System usage logs, quiz results |
| Week 4 | Immediate Retention Test | Post-test scores |
| Week 4 | Post-Study Questionnaire | Usability, perceived usefulness |
| Week 5 | Semi-Structured Interviews | Qualitative feedback |
| Week 8 | Delayed Retention Test | Long-term retention scores |

---

## 3.9 Data Processing and Analysis

### 3.9.1 Quantitative Data Processing

**Data Cleaning:**
1. Export system usage logs from MongoDB to CSV
2. Remove incomplete sessions (duration < 30 seconds)
3. Aggregate per-user metrics: total sessions, total quizzes, average score
4. Convert all test scores to percentage (0-100%)
5. Calculate learning gain: (Post-test score - Pre-test score)

**Statistical Analysis Methods:**

**Primary Analysis: Comparing Learning Outcomes**

*Research Question*: Does automated retrieval practice improve test performance compared to traditional study methods?

*Hypothesis*:
- H₀ (Null): Mean post-test score for experimental group = Mean post-test score for control group
- H₁ (Alternative): Mean post-test score for experimental group > Mean post-test score for control group

*Statistical Test*: Independent samples t-test

*Procedure*:
1. Calculate mean post-test scores for both groups
2. Check assumptions (normality via Shapiro-Wilk test, homogeneity of variance via Levene's test)
3. If assumptions met: Use standard t-test; if violated: Use Mann-Whitney U test
4. Report: t-statistic, degrees of freedom, p-value, effect size (Cohen's d)
5. Significance level: α = 0.05

**Secondary Analysis: Long-Term Retention**

*Statistical Test*: Repeated measures ANOVA

*Factors*:
- Within-subjects factor: Time (Pre-test, Post-test, Delayed test)
- Between-subjects factor: Group (Experimental, Control)

**Correlation Analysis: Usage Patterns and Performance**

*Variables*:
- Independent: Total sessions, total quizzes, average time per session
- Dependent: Post-test score, learning gain

*Statistical Test*: Pearson correlation

### 3.9.2 Qualitative Data Processing

**Analysis Method**: Thematic Analysis (Braun & Clarke, 2006)

**Procedure**:
1. **Familiarization**: Read all responses/transcripts multiple times
2. **Initial Coding**: Systematically code interesting features (e.g., "time savings", "hint usefulness", "question relevance")
3. **Theme Development**: Group codes into potential themes (e.g., "Reduced Friction", "Feedback Value", "Alignment Concerns")
4. **Theme Review**: Check themes against coded data
5. **Theme Definition**: Write detailed descriptions with representative quotes
6. **Reporting**: Present themes with supporting evidence

---

## 3.10 Summary

This chapter presented the complete research methodology and system design for Student Buddy. Key components include:

**Methodology (3.2)**: Iterative prototyping approach with four development phases, justified by the need to validate pedagogical effectiveness through real student interaction.

**Existing System Analysis (3.3)**: Detailed examination of traditional re-reading and Quizlet, identifying specific gaps in note-grounding, feedback scaffolding, and progress tracking.

**Proposed System Design (3.4-3.5)**: Architecture description showing how MERN stack with Gemini API integration provides note management, AI generation, practice sessions, and assessment tracking.

**Design Specifications (3.6)**: Functional and non-functional requirements defining system capabilities and performance expectations.

**Core Workflows (3.7)**: Process flows for document processing, quiz generation, two-stage hint system, and AI grading.

**Evaluation Methodology (3.8-3.9)**: Mixed-methods approach combining quantitative measures (pre/post/delayed tests, system usage logs) with qualitative data (questionnaires, interviews) from 30 undergraduate participants over 8 weeks.

Together, these components establish a rigorous foundation for implementing and evaluating Student Buddy's effectiveness in making retrieval practice more accessible and pedagogically sound through AI automation grounded in students' actual study materials.

---

**[End of Chapter 3]**

---

**Note on Figures/Diagrams:**

The following figures should be inserted at indicated locations:
- **Figure 3.1**: System Overview Diagram (4 modules with interconnections)
- **Figure 3.2**: System Architecture Diagram (3-layer architecture: Client, Server, Data)
- **Figure 3.3**: Entity-Relationship Diagram (User, Note, Course, QuizResult, AIGeneratedPracticeExam relationships)
- **Figure 3.4**: Document Processing Flowchart (upload → file type detection → extraction/OCR → save)
- **Figure 3.5**: Quiz Generation Process Flowchart (note selection → API call → validation → display)
- **Figure 3.6**: Two-Stage Hint System Flowchart (answer submission → correctness check → hint/explanation logic)
- **Figure 3.7**: Practice Exam Grading Flowchart (exam generation → user completion → AI grading → results display)

