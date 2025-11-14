# CHAPTER THREE: RESEARCH METHODOLOGY

## 3.1 Introduction

This chapter describes the research methodology adopted for designing and implementing Student Buddy, an AI-assisted retrieval practice system. The chapter covers the research approach (3.2), data gathering methods (3.3), problem identification (3.4), feasibility studies (3.5), analysis of the present system (3.6), and analysis of the proposed system (3.7).

---

## 3.2 Adopted Method for this Research

### 3.2.1 Research Approach

This project adopted an **iterative prototyping methodology** combined with design-based research principles. This approach was selected because:

1. **Uncertain Requirements**: The combination of AI-powered question generation with note-grounded retrieval practice is relatively novel, requiring iterative refinement through testing
2. **Pedagogical Validation**: Educational technology effectiveness can only be validated through actual implementation and developer testing
3. **AI Quality Issues**: Early prototypes revealed that AI-generated questions required multiple iterations of prompt engineering

### 3.2.2 Development Phases

**Phase 1: Requirements Analysis (Weeks 1-3)**
- Literature review on retrieval practice and existing study tools
- Identification of key features from cognitive science research
- Technical feasibility confirmation (Gemini API capabilities, MERN stack suitability)

**Phase 2: Core Implementation (Weeks 4-8)**
- User authentication system (JWT-based)
- Note CRUD operations with file upload
- Basic quiz generation and delivery
- Initial AI prompt engineering

**Phase 3: Feature Enhancement (Weeks 9-12)**
- Two-stage hint system implementation
- Practice exam with AI grading
- OCR support for scanned PDFs
- Assessment tracker for progress monitoring

**Phase 4: System Refinement (Weeks 13-16)**
- Code optimization and bug fixes
- User interface improvements
- System documentation
- Developer testing with various note types

---

## 3.3 Data Gathering

### 3.3.1 Literature Review

Extensive review of academic literature on:
- Cognitive mechanisms of retrieval practice (Roediger & Butler, 2011; Karpicke & Blunt, 2011)
- Student study habits and barriers (Hartwig & Dunlosky, 2012)
- Existing educational technology tools (Bond et al., 2024)
- Theoretical frameworks (Constructivism, Cognitive Load Theory, TPACK)

### 3.3.2 Existing System Analysis

Analysis of current study tools:
- **Quizlet**: Flashcard-based retrieval practice
- **Anki**: Spaced repetition system
- **ChatGPT**: General-purpose AI for question generation
- **NotebookLM**: Note-to-quiz conversion tool

Data gathered on their features, limitations, and user adoption patterns.

### 3.3.3 Technical Research

Investigation of:
- AI capabilities (Google Gemini API for text generation)
- Document processing libraries (pdf-parse, Tesseract.js for OCR, mammoth for DOCX)
- MERN stack architecture patterns
- Authentication and security best practices

### 3.3.4 System Usage Data Collection

The implemented system automatically collects:
- User account data (username, email, school, level)
- Study note data (title, content, subject, course)
- Quiz practice data (questions, answers, scores, time spent)
- Practice exam data (open-ended questions, AI grades, feedback)
- Performance tracking data (per-note history, improvement metrics)

**[Note: No formal user evaluation with participants was conducted due to project scope limitations. System testing was performed by the developer using various note types and usage scenarios.]**

---

## 3.4 Problem Identification

### 3.4.1 Core Problem

Students avoid effective retrieval practice despite strong evidence for its benefits, preferring passive rereading which creates an illusion of mastery without genuine learning.

### 3.4.2 Specific Problems Identified

**Problem 1: Time and Effort Barrier**
- Creating practice questions manually is time-consuming
- Students spend more time preparing study materials than actually studying

**Problem 2: Discomfort and Difficulty**
- Self-testing feels harder than rereading
- Students mistake familiarity from rereading for actual understanding

**Problem 3: Material Disorganization**
- Notes scattered across notebooks, phones, laptops
- Significant time wasted locating and organizing materials

**Problem 4: Generic AI Tools**
- Existing AI tools (ChatGPT) generate questions from general knowledge
- Questions don't align with student's actual study materials or instructor emphasis

**Problem 5: Inadequate Feedback**
- Flashcard apps provide binary right/wrong feedback
- No scaffolding to support productive struggle

**Problem 6: No Progress Tracking**
- Students can't identify weak topics
- No objective evidence of improvement over time

---

## 3.5 Feasibility Studies

### 3.5.1 Technical Feasibility

**AI Capabilities**
- Google Gemini API confirmed capable of generating structured questions from text
- API supports up to 400,000 characters context (sufficient for large textbooks)
- Response time acceptable (10-15 seconds for 15 questions)

**Document Processing**
- pdf-parse library successfully extracts text from text-based PDFs
- Tesseract.js provides OCR for scanned documents
- mammoth library handles DOCX files effectively

**MERN Stack**
- MongoDB suitable for flexible document storage
- Express.js provides robust API framework
- React enables responsive, component-based UI
- Node.js handles concurrent requests efficiently

### 3.5.2 Financial Feasibility

**Development Costs**
- Free tier services used for development:
  - MongoDB Atlas (512MB free tier)
  - Google Gemini API (60 requests/minute free)
  - Vercel hosting (free for personal projects)
- Total development cost: ₦0 (using free resources)

**Operational Costs** (if deployed at scale)
- MongoDB Atlas: $0-$57/month depending on usage
- Gemini API: $0.00015 per 1K characters (very affordable)
- Hosting: $0-$20/month

**Conclusion**: Financially feasible for both development and deployment.

### 3.5.3 Time Constraint Feasibility

**Project Timeline**: 16 weeks (one semester)

| Phase | Duration | Status |
|-------|----------|--------|
| Requirements & Design | 3 weeks | ✓ Completed |
| Core Implementation | 5 weeks | ✓ Completed |
| Feature Enhancement | 4 weeks | ✓ Completed |
| Testing & Documentation | 4 weeks | ✓ Completed |

**Conclusion**: Timeline was realistic and successfully met.

### 3.5.4 Technical Know-How Feasibility

**Required Skills**:
- JavaScript (frontend and backend)
- React framework
- MongoDB database
- RESTful API design
- AI prompt engineering

**Developer Background**:
- ND2 Computer Science student
- Prior experience with JavaScript and web development
- Learning resources: online documentation, tutorials, Stack Overflow

**Conclusion**: Required skills were within reach with dedicated learning.

### 3.5.5 Study Area Feasibility

**Target Users**: Undergraduate students in text-heavy disciplines
- Psychology, Biology, History, Literature, Social Sciences

**Limitations Accepted**:
- Not suitable for diagram-heavy subjects (Engineering, Architecture)
- Not suitable for mathematics (requires LaTeX support)
- Not suitable for programming courses (requires code syntax highlighting)

**Conclusion**: Feasible for defined target audience.

---


## 3.6 Analysis of Present System

### 3.6.1 Traditional Re-Reading (Manual Baseline)

**How It Operates**:
1. Students create notes during lectures (handwritten or typed)
2. Before exams, students repeatedly read through notes
3. Familiarity from rereading creates false sense of mastery
4. First real test of knowledge occurs during exam

**[PLACEHOLDER: Add flowchart showing traditional re-reading workflow]**

**Merits**:
- Universal accessibility (no technology required)
- Familiar and comfortable for students
- Can be done anywhere, anytime
- Low initial cognitive load

**Demerits**:
- Creates illusion of competence without genuine learning
- No active retrieval (passive recognition only)
- Time inefficient (diminishing returns after first reading)
- No diagnostic feedback on knowledge gaps
- Notes scattered across multiple platforms
- No progress metrics

**Data Flow**: Notes → Rereading → Familiarity (not retention) → Poor exam performance

### 3.6.2 Quizlet (Digital Flashcard System)

**How It Operates**:
1. Students create flashcard sets (term-definition pairs)
2. System presents cards in various study modes
3. Students self-report if they knew the answer
4. Spaced repetition algorithm schedules reviews
5. Recent AI feature auto-generates flashcards from documents

**[PLACEHOLDER: Add flowchart showing Quizlet workflow]**

**Merits**:
- Active retrieval practice (better than rereading)
- Multiple study modes (flashcards, learn, test)
- Spaced repetition algorithm
- Large library of shared study sets
- Cross-platform (web, iOS, Android)
- AI automation reduces manual work

**Demerits**:
- Surface-level questions (term-definition only)
- Generic AI generation (not course-specific)
- Binary feedback (right/wrong, no explanation)
- No scaffolding for productive struggle
- Weak integration with evolving notes
- Freemium model limits free tier features
- No per-note progress tracking

**Data Flow**: 
```
Document Upload → AI Extraction → Flashcard Set → Study Session → 
Self-Reported Confidence → Spaced Repetition Schedule
```

### 3.6.3 ChatGPT (General AI Tool)

**How It Operates**:
1. Student requests practice questions on a topic
2. AI generates questions from general training data
3. Student answers questions
4. AI provides explanations if requested

**Merits**:
- Instant question generation
- Flexible question types
- Conversational interface
- On-demand explanations

**Demerits**:
- Questions from general knowledge (not student's notes)
- Content misalignment with course material
- Hallucination risk (confidently wrong information)
- No progress tracking
- No integration with study materials
- Requires manual copy-paste workflow

**Data Flow**: Topic Request → AI Generation (from general knowledge) → Questions → Manual tracking

### 3.6.4 Summary Comparison Table

| Feature | Re-Reading | Quizlet | ChatGPT | Student Buddy |
|---------|-----------|---------|---------|---------------|
| Active Retrieval | ✗ | ✓ | ✓ | ✓ |
| Note-Grounded | ✓ | ✗ | ✗ | ✓ |
| Scaffolded Feedback | ✗ | ✗ | Partial | ✓ |
| Progress Tracking | ✗ | Basic | ✗ | ✓ |
| Automation | ✗ | Partial | ✓ | ✓ |
| Integration | ✗ | ✗ | ✗ | ✓ |

---

## 3.7 Analysis of Proposed System (Student Buddy)

### 3.7.1 How It Operates

**Complete Workflow**:

1. **Note Management**
   - Student uploads PDF/DOCX or types notes manually
   - System extracts text (OCR if scanned)
   - Notes stored in MongoDB with course/subject organization

2. **Quiz Generation**
   - Student selects note(s) and clicks "Generate Quiz"
   - System sends note content to Gemini API
   - AI generates 15 MCQ questions with hints and explanations
   - Questions displayed one at a time

3. **Quiz Interaction (Two-Attempt System)**
   - Student answers question
   - If correct → immediate feedback + explanation
   - If wrong (1st attempt) → hint shown, second chance given
   - If wrong (2nd attempt) → correct answer + full explanation shown
   - Only first attempts count toward score

4. **Practice Exam**
   - Student generates 15 open-ended questions
   - Student answers all questions (essay-style)
   - AI grades each answer (0-10 scale)
   - Detailed feedback provided per question

5. **Progress Tracking**
   - System records all quiz/exam attempts
   - Assessment tracker shows per-note performance
   - Improvement metrics calculated
   - Weak topics identified

**[PLACEHOLDER: Add comprehensive system flowchart showing all components]**

### 3.7.2 System Architecture

**Three-Tier Architecture**:

**Presentation Layer (Frontend)**
- React 18.2.0 with Vite
- TailwindCSS for styling
- TipTap rich text editor
- Responsive design (desktop, tablet, mobile)

**Application Layer (Backend)**
- Node.js with Express 4.18.2
- JWT authentication
- RESTful API endpoints
- AI service integration (Gemini API)
- Document processing (pdf-parse, Tesseract.js, mammoth)

**Data Layer**
- MongoDB 8.1.3 with Mongoose ODM
- Collections: Users, Notes, Courses, QuizResults, AIGeneratedPracticeExams

**[PLACEHOLDER: Add system architecture diagram showing three layers]**

### 3.7.3 Data Flow Diagram

**Level 0 (Context Diagram)**:
```
Student → [Student Buddy System] → Study Materials, Quizzes, Progress Reports
                ↕
         Gemini AI API
```

**Level 1 (Major Processes)**:
```
1.0 Note Management
   Input: PDF/DOCX files, manual text
   Output: Stored notes
   
2.0 Quiz Generation
   Input: Note content
   Process: AI generation via Gemini API
   Output: 15 MCQ questions with hints/explanations
   
3.0 Quiz Interaction
   Input: Student answers
   Process: Two-stage feedback logic
   Output: Scores, feedback
   
4.0 Practice Exam
   Input: Note content, student answers
   Process: AI grading
   Output: Scores (0-10 per question), detailed feedback
   
5.0 Progress Tracking
   Input: Quiz/exam results
   Process: Aggregation and analysis
   Output: Performance metrics, improvement trends
```

**[PLACEHOLDER: Add detailed DFD diagrams for each process]**

### 3.7.4 Merits of Proposed System

1. **Note-Grounded Generation**: Questions derived exclusively from student's actual notes
2. **Automated Question Creation**: 15 questions generated in 10-15 seconds
3. **Scaffolded Feedback**: Two-stage hints preserve productive struggle
4. **Integrated Workflow**: All functions in one platform
5. **Progress Tracking**: Per-note performance history
6. **Multiple Question Types**: MCQ and open-ended
7. **AI Grading**: Detailed feedback on essay responses
8. **OCR Support**: Handles scanned PDFs
9. **Cross-Platform**: Web-based, works on any device
10. **Free to Use**: No subscription fees

### 3.7.5 Demerits of Proposed System

1. **Text-Only**: Cannot process diagrams, equations, chemical formulas
2. **Internet Dependency**: Requires stable connection for AI features
3. **AI Quality Variability**: Occasional ambiguous or irrelevant questions
4. **Note Quality Dependency**: Output quality reflects input quality
5. **No Spaced Repetition**: Doesn't automatically schedule reviews
6. **Single-User Focus**: No collaborative features
7. **Limited Evaluation**: No formal user testing with participants

### 3.7.6 Justification of the New System

**Why Student Buddy is Needed**:

1. **Addresses Evidence-Practice Gap**: Makes retrieval practice accessible by removing time barriers

2. **Solves Content Alignment Problem**: Unlike ChatGPT/Quizlet, questions test what student actually studied

3. **Provides Appropriate Scaffolding**: Two-stage hints maintain challenge while preventing frustration (implements Vygotsky's ZPD)

4. **Reduces Cognitive Load**: Integrated system eliminates tool-switching overhead (Cognitive Load Theory)

5. **Builds Metacognition**: Progress tracking reveals actual knowledge vs. perceived knowledge

6. **Leverages AI Appropriately**: Uses AI for automation (question generation) while maintaining pedagogical integrity (note-grounding, scaffolded feedback)

7. **Research-Informed Design**: Every feature justified by cognitive science literature

**Comparison with Alternatives**:

| Need | Traditional Method | Existing Tools | Student Buddy |
|------|-------------------|----------------|---------------|
| Time efficiency | Manual question creation (hours) | Partial automation | Full automation (seconds) |
| Content alignment | ✓ (own notes) | ✗ (general knowledge) | ✓ (own notes) |
| Feedback quality | None | Binary | Scaffolded |
| Integration | Scattered | Separate tools | Single platform |
| Progress tracking | Manual | Basic | Comprehensive |

---

## 3.8 Summary

This chapter presented the research methodology for Student Buddy:

**Section 3.2** described the iterative prototyping approach with four development phases over 16 weeks.

**Section 3.3** outlined data gathering through literature review, existing system analysis, technical research, and automated system usage data collection.

**Section 3.4** identified six core problems: time barriers, discomfort, disorganization, generic AI tools, inadequate feedback, and lack of progress tracking.

**Section 3.5** confirmed feasibility across technical, financial, time, knowledge, and study area dimensions.

**Section 3.6** analyzed present systems (re-reading, Quizlet, ChatGPT), documenting their operations, merits, demerits, and data flows.

**Section 3.7** analyzed the proposed Student Buddy system, explaining its operation, architecture, data flows, merits, demerits, and justification for why it addresses gaps in existing approaches.

The methodology establishes a rigorous foundation for the system implementation described in Chapter 4.

---

**[End of Chapter 3]**

---

**PLACEHOLDERS TO ADD**:
- [ ] Flowchart: Traditional re-reading workflow
- [ ] Flowchart: Quizlet workflow  
- [ ] Diagram: Student Buddy system architecture (3-tier)
- [ ] Flowchart: Complete Student Buddy workflow
- [ ] DFD Level 0: Context diagram
- [ ] DFD Level 1: Major processes
- [ ] DFD Level 2: Detailed process flows (optional)
