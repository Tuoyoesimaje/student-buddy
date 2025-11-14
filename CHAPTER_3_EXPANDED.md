# CHAPTER THREE: RESEARCH METHODOLOGY

## 3.1 Introduction

This chapter presents the research methodology adopted for designing and implementing Student Buddy, an AI-assisted retrieval practice system. The methodology encompasses the entire research process from initial problem identification through system design and implementation.

Section 3.2 explains the research approach and justifies the selection of iterative prototyping methodology. Section 3.3 describes the data gathering techniques employed, including literature review, existing system analysis, and technical research. Section 3.4 identifies the specific problems that motivated this research. Section 3.5 presents comprehensive feasibility studies examining technical, financial, temporal, knowledge, and contextual constraints. Section 3.6 provides detailed analysis of present systems including traditional re-reading methods and digital tools like Quizlet and ChatGPT, documenting their operations, strengths, weaknesses, and data flow patterns. Section 3.7 analyzes the proposed Student Buddy system, explaining its operational model, architectural design, data flows, advantages, limitations, and justification for addressing identified gaps.

---

## 3.2 Adopted Method for this Research

### 3.2.1 Research Approach and Justification

This project adopted an **iterative prototyping methodology** combined with design-based research principles. This approach was deliberately selected over traditional waterfall or agile methodologies for several compelling reasons specific to educational technology development.

**Why Iterative Prototyping?**

The nature of this project demanded an approach that could accommodate uncertainty while maintaining focus on pedagogical effectiveness. Three primary factors justified this methodological choice:

**1. Uncertain Requirements in Novel Domain**

The combination of AI-powered question generation with note-grounded retrieval practice represents a relatively novel application domain. Unlike established software categories with well-documented requirements, this project entered territory where initial requirements could not be fully specified in advance. 

For instance, the optimal structure for AI-generated hints only became clear after testing multiple prompt variations with diverse note content. Similarly, the two-stage feedback system emerged from iterative refinement rather than upfront specification. The technical capabilities of what questions the AI could reliably generate, how students would interact with graduated hints, and what constituted "good enough" question quality could only be determined through implementation and testing cycles.

**2. Pedagogical Validation Through Real Implementation**

Educational technology differs fundamentally from general-purpose software because effectiveness must be validated through actual learning outcomes, not just technical functionality. Questions central to this project such as "Does two-stage hinting preserve productive struggle while preventing frustration?" or "Do students find AI-graded feedback useful and actionable?" cannot be answered through specification documents or theoretical analysis alone.

The iterative approach enabled continuous refinement based on developer testing with varied note types and usage scenarios. Each iteration provided insights that informed subsequent design decisions, ensuring the final system reflected practical realities rather than theoretical assumptions.

**3. AI Quality Issues Requiring Iterative Refinement**

Early prototypes revealed that AI-generated content quality varied significantly based on prompt structure, note content characteristics, and question type. Initial attempts produced questions that were sometimes ambiguous, contained implausible distractors, or missed key concepts from notes.

These issues required systematic experimentation with prompt engineering an inherently iterative process. The project underwent six major prompt refinement cycles, each informed by analysis of generated questions across diverse note content. This iterative refinement could not have been accomplished within a rigid waterfall framework.

### 3.2.2 Development Phases

The 16-week development timeline was structured into four distinct phases, each with specific objectives and deliverables:

**Phase 1: Requirements Analysis and Design (Weeks 1-3)**

This foundational phase established the project's theoretical and technical groundwork. Activities included:

- **Literature Review**: Comprehensive examination of cognitive science research on retrieval practice, spacing effects, and metacognition. Analysis of existing educational technology tools and their limitations. Review of AI capabilities in educational contexts.

- **Informal Student Interviews**: Conversations with undergraduate students about current study habits, pain points with existing tools, and desired features. These discussions revealed that students acknowledged retrieval practice benefits but avoided it due to time costs and material disorganization.

- **Feature Prioritization**: Based on literature and student input, key priorities were identified:
  - Upload and manage text-based notes from multiple sources
  - Generate multiple-choice and open-ended questions directly from note content
  - Provide staged feedback (hint → full explanation) to maintain productive struggle
  - Track progress per note to build metacognitive awareness

- **Technical Feasibility Confirmation**: Verification that Google's Gemini API could generate structured questions from unstructured text, and that libraries existed for PDF text extraction with OCR support.

**Deliverables**: Requirements document, system architecture proposal, technology stack selection

**Phase 2: Core Implementation (Weeks 4-8)**

This phase focused on building the foundational system architecture and core functionality:

- **Backend Infrastructure**:
  - User authentication system using JWT tokens with bcrypt password hashing
  - RESTful API structure with Express.js
  - MongoDB database with Mongoose schemas for Users, Notes, Courses
  - Basic CRUD operations for note management

- **Frontend Foundation**:
  - React application structure with routing
  - Authentication pages (login, register)
  - Notes management interface with grid view
  - Basic note editor using TipTap rich text component

- **AI Integration Prototype**:
  - Initial Gemini API integration for question generation
  - Basic prompt engineering for MCQ questions
  - Simple question display interface

- **File Processing**:
  - PDF text extraction using pdf-parse library
  - Basic DOCX processing with mammoth
  - File upload handling with multer middleware

**Technology Stack Rationale**:

The MERN stack (MongoDB, Express, React, Node.js) was selected for specific technical and practical reasons:

- **MongoDB**: Document-oriented storage naturally accommodates variable-structure notes and flexible quiz formats. Schema-less design allows easy iteration during development.

- **Express + Node.js**: Mature backend framework with extensive middleware ecosystem. JavaScript consistency across frontend and backend reduces context switching and enables code reuse.

- **React**: Component-based architecture facilitates building complex interactive interfaces like the quiz system. Large ecosystem provides solutions for rich text editing, routing, and state management.

- **Google Gemini API**: Offers acceptable quality-to-cost ratio for educational content generation. Free tier provides sufficient quota for development and moderate production use. API supports large context windows (400K characters) suitable for lengthy textbook chapters.

**Deliverables**: Functional prototype with authentication, basic note management, and simple quiz generation

**Phase 3: Feature Enhancement and Refinement (Weeks 9-12)**

This phase transformed the basic prototype into a pedagogically sophisticated system through iterative refinement based on developer testing:

**Major Additions**:

- **Two-Stage Hint System**: Implemented graduated feedback mechanism where first incorrect attempt triggers minimal hint display, second incorrect attempt reveals full explanation. This required complex state management tracking attempt counts, hint visibility, and answer history per question.

- **Practice Exam Module**: Developed open-ended question generation and AI-powered grading system. Created interface for answering 15 essay-style questions with Markdown support. Implemented detailed feedback structure with 0-10 scoring scale and lecturer-style comments.

- **OCR Support**: Integrated Tesseract.js for optical character recognition on scanned PDFs. Implemented automatic detection of image-based PDFs (text extraction yields <100 characters) to trigger OCR processing. Added page-to-image conversion using pdf-poppler.

- **Assessment Tracker**: Built comprehensive progress monitoring showing per-note quiz history, improvement metrics, and weak topic identification. Implemented retake functionality enabling spaced repetition analysis.

**Iterative Improvements**:

- **AI Prompt Engineering**: Underwent six major iterations to improve question quality:
  - Iteration 1-2: Basic prompts produced generic questions lacking note-specificity
  - Iteration 3: Added explicit constraint "use ONLY information from notes" → reduced hallucinations
  - Iteration 4: Specified distractor quality requirements for MCQs → improved difficulty calibration
  - Iteration 5: Enhanced hint generation constraints → hints became more helpful without revealing answers
  - Iteration 6: Refined explanation requirements → better pedagogical feedback

- **User Interface Refinement**: Improved visual hierarchy, added loading states, enhanced error messaging, optimized mobile responsiveness.

- **Performance Optimization**: Implemented API key rotation for rate limit handling, added request retry logic, optimized database queries with indexes.

**Deliverables**: Feature-complete system with sophisticated pedagogical mechanisms

**Phase 4: System Refinement and Documentation (Weeks 13-16)**

Final phase focused on polish, optimization, and comprehensive documentation:

- **Code Refactoring**: Eliminated redundancy, improved naming conventions, enhanced code organization, added inline documentation.

- **Bug Resolution**: Systematic testing identified and resolved issues including duplicate question generation, token persistence problems, OCR timeout errors, and assessment tracker query bugs.

- **Performance Tuning**: Optimized bundle size through code splitting, improved API response times, enhanced database query efficiency.

- **Comprehensive Documentation**: Created developer guide, API documentation, user manual, and deployment instructions.

- **Testing**: Conducted systematic testing across authentication, note management, quiz generation, quiz interaction, practice exams, and progress tracking. Verified cross-browser compatibility and responsive design.

**Deliverables**: Production-ready system with complete documentation

---

## 3.3 Data Gathering

### 3.3.1 Literature Review

A comprehensive literature review formed the theoretical foundation for system design. This review spanned multiple domains relevant to educational technology development:

**Cognitive Science Research**

Extensive examination of retrieval practice literature established the pedagogical rationale for the system:

- **Testing Effect Studies**: Analysis of seminal research by Roediger and Butler (2011) demonstrating that retrieval practice produces superior long-term retention compared to repeated studying. Review of Karpicke and Blunt's (2011) comparative study showing retrieval practice outperforms elaborative studying and concept mapping.

- **Spacing and Interleaving**: Investigation of Cepeda et al.'s (2006) meta-analysis on distributed practice effects. Examination of Kornell and Bjork's (2008) work on optimal spacing intervals.

- **Metacognition Research**: Study of Bjork, Dunlosky, and Kornell's (2013) work on metacognitive illusions and the disconnect between perceived and actual learning.

**Educational Psychology**

Theoretical frameworks guiding system design:

- **Constructivism**: Vygotsky's (1978) Zone of Proximal Development concept informed the two-stage hint system design. Piaget's (1954) work on active knowledge construction justified emphasis on production-based retrieval tasks.

- **Cognitive Load Theory**: Sweller's (1988) framework on working memory limitations guided decisions to minimize extraneous cognitive load through automation while preserving germane load through retrieval difficulty.

- **TPACK Framework**: Mishra and Koehler's (2006) model for integrating technology, pedagogy, and content knowledge informed the balance between AI capabilities and pedagogical requirements.

**Student Behavior Research**

Understanding adoption barriers:

- **Study Strategy Preferences**: Hartwig and Dunlosky's (2012) survey research revealing that students acknowledge retrieval practice benefits but rarely use it due to time costs and discomfort.

- **Metacognitive Errors**: Kornell and Bjork's (2008) studies showing students systematically underestimate retrieval practice effectiveness while overestimating rereading benefits.

- **Material Organization**: Pechenkina et al.'s (2017) research documenting how scattered study materials create organizational overhead that discourages effective study strategies.

**Educational Technology Analysis**

Critical examination of existing tools:

- **Flashcard Systems**: Analysis of Quizlet and Anki, documenting their spaced repetition algorithms, user adoption patterns, and pedagogical limitations.

- **Intelligent Tutoring Systems**: Review of Carnegie Learning and similar platforms, understanding their sophisticated pedagogical models but limited generalizability.

- **AI in Education**: Bond et al.'s (2024) systematic review of AI applications in higher education, identifying persistent challenges with content alignment and hallucination.

### 3.3.2 Existing System Analysis

Detailed analysis of current study tools provided comparative context and identified specific gaps:

**Quizlet Analysis**

Systematic examination of Quizlet's features, user interface, and pedagogical approach:

- **Feature Documentation**: Cataloged study modes (flashcards, learn, test, match), AI features (Magic Notes), spaced repetition algorithm, and social features (shared study sets).

- **Pedagogical Assessment**: Evaluated question types (primarily term-definition pairs), feedback mechanisms (binary correct/incorrect), and learning progression models.

- **Limitation Identification**: Documented surface-level question focus, generic AI generation not grounded in specific course materials, minimal explanatory feedback, and weak integration between flashcards and source documents.

**ChatGPT Analysis**

Evaluated general-purpose AI for educational use:

- **Capability Testing**: Experimented with various prompts for generating practice questions, assessing quality, relevance, and accuracy.

- **Limitation Documentation**: Identified content misalignment (questions from general knowledge rather than specific course materials), hallucination risks, lack of progress tracking, and absence of integration with study materials.

**Traditional Methods Analysis**

Examined baseline study approaches:

- **Re-reading Workflow**: Documented typical student behavior of repeatedly reading notes before exams, analyzing cognitive processes involved (recognition vs. recall) and metacognitive illusions created.

- **Note-taking Practices**: Observed common patterns of scattered notes across notebooks, digital documents, and mobile devices, quantifying organizational overhead.

### 3.3.3 Technical Research

Investigation of technical capabilities and constraints:

**AI Capabilities Assessment**

- **Gemini API Evaluation**: Tested Google's Gemini 2.5 Flash model for educational content generation, assessing response quality, speed, context window limits, and cost structure.

- **Prompt Engineering Research**: Experimented with various prompt structures, analyzing impact on question quality, relevance, and pedagogical appropriateness.

- **Quality Control Mechanisms**: Investigated techniques for detecting and filtering low-quality AI outputs, including structural validation, semantic similarity checks, and user feedback integration.

**Document Processing Research**

- **PDF Text Extraction**: Evaluated pdf-parse library capabilities and limitations, testing with various PDF types (text-based, scanned, mixed).

- **OCR Technology**: Assessed Tesseract.js accuracy across different document qualities, fonts, and layouts. Determined optimal preprocessing steps and performance characteristics.

- **DOCX Processing**: Tested mammoth library for Word document text extraction, evaluating formatting preservation and edge case handling.

**Architecture Patterns**

- **MERN Stack Best Practices**: Researched optimal patterns for MongoDB schema design, Express API structure, React component organization, and Node.js performance optimization.

- **Authentication Security**: Investigated JWT token management, password hashing standards, and session handling approaches.

- **Scalability Considerations**: Examined database indexing strategies, API rate limiting, caching mechanisms, and load balancing options.

### 3.3.4 System Usage Data Collection

The implemented system automatically collects comprehensive usage data to support future analysis and system improvement:

**User Account Data**

Collection occurs during registration and profile updates:
- Username (unique identifier for system access)
- Email address (authentication and communication)
- Password (hashed with bcrypt before storage, never stored in plain text)
- School name (institutional context)
- Academic level (ND1, ND2, HND1, HND2)
- Course enrollments (references to Course documents)
- Account creation and modification timestamps

**Study Note Data**

Captured during note creation and document upload:
- Note title and content (rich text with HTML formatting)
- Subject/folder classification (organizational structure)
- Associated course reference (links to Course documents)
- Creation and modification timestamps
- File metadata for uploads (filename, type, size, extraction method)

**Quiz Practice Data**

Recorded during quiz sessions:

*Per Question*:
- Question text and type (multiple-choice)
- Four answer options (A, B, C, D)
- Correct answer designation
- User's submitted answer
- Correctness indicator (boolean)
- Hints requested and displayed
- Time spent per question (seconds)
- Attempt count (first or second attempt)

*Per Session*:
- Total questions attempted (typically 15)
- Score (number correct on first attempt only)
- Percentage score (0-100%)
- Pass/fail status (≥60% threshold)
- Total session duration (seconds)
- Source note reference (links to originating Note document)
- Retake indicator (references previous quiz if applicable)

**Practice Exam Data**

Collected during exam generation and submission:

*Questions*:
- 15 open-ended questions generated by AI
- Distribution across cognitive levels (knowledge, understanding, application, analysis)
- Source note references

*Responses*:
- User's typed answers for each question (Markdown supported)
- Submission timestamp

*AI Grading Results*:
- Numerical score per question (0-10 scale)
- Specific feedback comment per question
- Reference to relevant note content
- Overall percentage score
- General performance feedback

**AI-Generated Content**

Metadata about AI operations:
- Generated quiz questions with hints and explanations
- Grading assessments with scores and feedback
- API call logs (request timestamps, response times, errors)
- Quality metrics (user ratings, reported issues)

**System Usage Logs**

Automatically captured operational data:
- Login/logout timestamps
- Session durations
- Note access patterns (views, edits, deletions)
- Quiz generation requests (note ID, question count, generation time)
- API call statistics (success rate, error types, rate limit hits)
- Error logs (failed operations with error messages and stack traces)

**Important Note on Evaluation**

Due to time and resource constraints typical of an ND final year project, formal evaluation involving student participants, control groups, or comparative studies with traditional study methods was not conducted. The system was tested by the developer using various note types, question formats, and usage scenarios to verify technical functionality and feature correctness.

Comprehensive user testing with multiple students, statistical analysis of learning outcomes, and longitudinal studies measuring retention over extended periods represent valuable future work but fall outside the scope of this implementation project. This limitation does not diminish the project's contribution, as the primary objectives designing and building a functional AI-assisted retrieval practice system were fully achieved and demonstrated.

---

