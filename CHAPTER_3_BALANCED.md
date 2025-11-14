# CHAPTER THREE: RESEARCH METHODOLOGY

## 3.1 Introduction

This chapter presents the research methodology adopted for designing and implementing Student Buddy, an AI-assisted retrieval practice system. The methodology encompasses the research approach, data gathering techniques, problem identification, feasibility analysis, and comparative system analysis.

Section 3.2 explains the adopted research method and justifies the iterative prototyping approach. Section 3.3 describes data gathering from literature review, existing systems, and technical research. Section 3.4 identifies the core problems motivating this research. Section 3.5 presents feasibility studies examining technical, financial, time, knowledge, and contextual constraints. Section 3.6 analyzes present systems including traditional re-reading and Quizlet, documenting their operations, merits, demerits, and data flows. Section 3.7 analyzes the proposed Student Buddy system with detailed examination of operations, architecture, advantages, limitations, and justification.

---

## 3.2 Adopted Method for this Research

### 3.2.1 Research Methodology

This project adopted an **iterative prototyping methodology** combined with design-based research principles. This approach was selected because educational technology development requires continuous refinement based on actual implementation and testing rather than upfront specification alone.

**Justification for Iterative Prototyping:**

Three factors made this approach appropriate:

**1. Uncertain Requirements**
The combination of AI-powered question generation with note-grounded retrieval practice is relatively novel. Initial requirements could not be fully specified because technical capabilities (what questions AI could generate, how students would interact with hints) only became clear through implementation cycles. For example, the optimal hint structure emerged after testing multiple prompt variations with diverse note content.

**2. Pedagogical Validation Needs**
Educational tools must be validated through actual use, not just technical functionality. Questions like "Does two-stage hinting preserve productive struggle?" or "Is AI-graded feedback actionable?" can only be answered through implementation and developer testing with varied scenarios.

**3. AI Quality Variability**
Early prototypes revealed that AI-generated questions sometimes had ambiguous wording or missed key concepts. These issues required systematic prompt engineering refinement that could only be discovered through actual generation attempts with diverse note types.

### 3.2.2 Development Phases

The 16-week development timeline was structured into four phases:

**Phase 1: Requirements Analysis (Weeks 1-3)**

Activities:
- Comprehensive literature review on retrieval practice and existing study tools
- Informal interviews with undergraduate students about study habits and pain points
- Feature prioritization based on cognitive science research
- Technical feasibility confirmation (Gemini API capabilities, MERN stack suitability)

Key Priorities Identified:
- Upload and manage text-based notes from multiple sources
- Generate MCQ and open-ended questions from note content
- Provide staged feedback (hint → full explanation)
- Track progress per note for metacognitive awareness

Deliverables: Requirements document, system architecture proposal, technology stack selection

**Phase 2: Core Implementation (Weeks 4-8)**

Focus: Build foundational system architecture

Backend Development:
- User authentication with JWT tokens and bcrypt password hashing
- RESTful API structure with Express.js
- MongoDB database with Mongoose schemas
- Basic CRUD operations for note management
- File upload handling with multer middleware

Frontend Development:
- React application structure with routing
- Authentication pages (login, register)
- Notes management interface with grid view
- Basic note editor using TipTap rich text component

AI Integration:
- Initial Gemini API integration for question generation
- Basic prompt engineering for MCQ questions
- Simple question display interface

Technology Stack Rationale:
- **MongoDB**: Document-oriented storage accommodates variable-structure notes
- **Express + Node.js**: Mature framework with extensive middleware ecosystem
- **React**: Component-based architecture for complex interactive interfaces
- **Gemini API**: Acceptable quality-to-cost ratio, 400K character context window

Deliverables: Functional prototype with authentication, basic note management, simple quiz generation

**Phase 3: Feature Enhancement (Weeks 9-12)**

Based on developer testing with diverse note types:

Major Additions:
- Two-stage hint system with complex state management
- Practice exam module with open-ended questions and AI grading
- OCR support for scanned PDFs using Tesseract.js
- Assessment tracker showing per-note performance history

Iterative Improvements:
- AI prompt engineering underwent six major iterations:
  - Iterations 1-2: Basic prompts produced generic questions
  - Iteration 3: Added "use ONLY note content" → reduced hallucinations
  - Iteration 4: Specified distractor quality → improved difficulty
  - Iteration 5: Enhanced hint constraints → more helpful hints
  - Iteration 6: Refined explanations → better pedagogical feedback

- User interface refinement for better visual hierarchy
- Performance optimization with API key rotation and retry logic

Deliverables: Feature-complete system with sophisticated pedagogical mechanisms

**Phase 4: System Refinement and Documentation (Weeks 13-16)**

Activities:
- Code refactoring for maintainability
- Systematic bug resolution
- Performance tuning and optimization
- Comprehensive documentation
- Cross-browser and responsive design testing

Deliverables: Production-ready system with complete documentation

---

## 3.3 Data Gathering

### 3.3.1 Literature Review

Comprehensive review across multiple domains:

**Cognitive Science Research:**
- Testing effect studies (Roediger & Butler, 2011; Karpicke & Blunt, 2011)
- Spacing and interleaving effects (Cepeda et al., 2006)
- Metacognition research (Bjork, Dunlosky & Kornell, 2013)

**Theoretical Frameworks:**
- Constructivism and Zone of Proximal Development (Vygotsky, 1978)
- Cognitive Load Theory (Sweller, 1988)
- TPACK Framework (Mishra & Koehler, 2006)

**Student Behavior:**
- Study strategy preferences (Hartwig & Dunlosky, 2012)
- Metacognitive errors (Kornell & Bjork, 2008)
- Material organization challenges (Pechenkina et al., 2017)

**Educational Technology:**
- Analysis of Quizlet, Anki, and flashcard systems
- Review of intelligent tutoring systems
- AI in education systematic reviews (Bond et al., 2024)

### 3.3.2 Existing System Analysis

Detailed examination of current study tools:

**Quizlet Analysis:**
- Feature documentation (study modes, AI features, spaced repetition)
- Pedagogical assessment (question types, feedback mechanisms)
- Limitation identification (surface-level questions, generic AI generation)

**ChatGPT Analysis:**
- Capability testing with various prompts
- Quality and relevance assessment
- Limitation documentation (content misalignment, hallucination risks)

**Traditional Methods:**
- Re-reading workflow documentation
- Cognitive process analysis (recognition vs. recall)
- Organizational overhead quantification

### 3.3.3 Technical Research

**AI Capabilities:**
- Gemini API evaluation (response quality, speed, context limits, cost)
- Prompt engineering experimentation
- Quality control mechanism investigation

**Document Processing:**
- PDF text extraction testing (pdf-parse library)
- OCR technology assessment (Tesseract.js accuracy)
- DOCX processing evaluation (mammoth library)

**Architecture Patterns:**
- MERN stack best practices research
- Authentication security standards
- Scalability considerations

---

## 3.4 Problem Identification

### 3.4.1 Core Problem Statement

Students avoid effective retrieval practice despite strong evidence for its benefits, preferring passive rereading which creates an illusion of mastery without genuine learning.

### 3.4.2 Specific Problems Identified

**Problem 1: Time and Effort Barrier**
- Creating practice questions manually is time-consuming (hours of work)
- Students spend more time preparing materials than actually studying
- This barrier discourages adoption of retrieval practice

**Problem 2: Discomfort and Difficulty**
- Self-testing feels harder and less pleasant than rereading
- Students mistake familiarity from rereading for actual understanding
- Metacognitive errors lead to poor strategy selection

**Problem 3: Material Disorganization**
- Notes scattered across notebooks, phones, laptops, and cloud services
- Significant time wasted locating and organizing materials before studying
- Organizational overhead increases perceived difficulty of self-testing

**Problem 4: Generic AI Tools**
- Existing AI tools (ChatGPT) generate questions from general knowledge
- Questions don't align with student's actual study materials
- Content misalignment with instructor emphasis and course objectives

**Problem 5: Inadequate Feedback**
- Flashcard apps provide binary right/wrong feedback only
- No scaffolding to support productive struggle
- Students either know answer or see it immediately (no middle ground)

**Problem 6: No Progress Tracking**
- Students can't identify weak topics objectively
- No evidence of improvement over time
- Lack of metacognitive awareness about actual knowledge

---

## 3.5 Feasibility Studies

### 3.5.1 Technical Feasibility

**AI Capabilities Assessment:**
- Google Gemini API confirmed capable of generating structured questions from unstructured text
- API supports up to 400,000 characters context (sufficient for large textbooks)
- Response time acceptable: 10-15 seconds for 15 questions
- Free tier provides 60 requests/minute, adequate for development and moderate use

**Document Processing Verification:**
- pdf-parse library successfully extracts text from text-based PDFs
- Tesseract.js provides OCR for scanned documents with acceptable accuracy
- mammoth library handles DOCX files effectively
- File processing completes within acceptable timeframes (<60 seconds for typical documents)

**MERN Stack Suitability:**
- MongoDB suitable for flexible document storage
- Express.js provides robust API framework
- React enables responsive, component-based UI
- Node.js handles concurrent requests efficiently

**Conclusion:** Technically feasible with available technologies and APIs.

### 3.5.2 Financial Feasibility

**Development Costs:**
Free tier services used throughout development:
- MongoDB Atlas: 512MB free tier (sufficient for development)
- Google Gemini API: 60 requests/minute free (adequate for testing)
- Vercel hosting: Free for personal projects
- Total development cost: ₦0

**Operational Costs (if deployed at scale):**
- MongoDB Atlas: $0-$57/month depending on usage
- Gemini API: $0.00015 per 1K characters (very affordable)
- Hosting: $0-$20/month for basic deployment

**Conclusion:** Financially feasible for both development and deployment. No capital investment required.

### 3.5.3 Time Constraint Feasibility

**Project Timeline:** 16 weeks (one semester)

| Phase | Duration | Deliverables | Status |
|-------|----------|--------------|--------|
| Requirements & Design | 3 weeks | Requirements doc, architecture | ✓ Completed |
| Core Implementation | 5 weeks | Functional prototype | ✓ Completed |
| Feature Enhancement | 4 weeks | Feature-complete system | ✓ Completed |
| Testing & Documentation | 4 weeks | Production-ready system | ✓ Completed |

**Conclusion:** Timeline was realistic and successfully met all milestones.

### 3.5.4 Technical Know-How Feasibility

**Required Skills:**
- JavaScript (frontend and backend)
- React framework and component architecture
- MongoDB database and Mongoose ODM
- RESTful API design principles
- AI prompt engineering basics

**Developer Background:**
- ND2 Computer Science student
- Prior experience with JavaScript and web development
- Learning resources utilized: official documentation, online tutorials, Stack Overflow community

**Skill Acquisition:**
- React learned through official documentation and practice projects
- MongoDB learned through tutorials and hands-on implementation
- AI prompt engineering learned through experimentation and iteration

**Conclusion:** Required skills were within reach with dedicated learning effort.

### 3.5.5 Study Area Feasibility

**Target Users:** Undergraduate students in text-heavy disciplines

**Suitable Disciplines:**
- Psychology, Biology, History, Literature
- Social Sciences, Business Studies
- Any course relying primarily on textual content

**Limitations Accepted:**
- Not suitable for diagram-heavy subjects (Engineering, Architecture)
- Not suitable for mathematics (requires LaTeX support)
- Not suitable for programming courses (requires code syntax highlighting)
- Not suitable for chemistry (requires chemical formula rendering)

**Conclusion:** Feasible for defined target audience in text-heavy disciplines.

---


## 3.6 Analysis of Present System

### 3.6.1 Traditional Re-Reading (Manual Baseline)

**How It Operates:**

Traditional re-reading follows a predictable pattern:

1. **Note Creation**: Students create not