# CHAPTER THREE: RESEARCH METHODOLOGY

## 3.1 Introduction

This chapter presents the research methodology adopted for designing and implementing Student Buddy, an AI-assisted retrieval practice system. The methodology encompasses the complete research process from problem identification through system design.

Section 3.2 explains the adopted research method and justifies the iterative prototyping approach. Section 3.3 describes data gathering techniques including literature review and system analysis. Section 3.4 identifies the specific problems motivating this research. Section 3.5 presents feasibility studies examining technical, financial, time, knowledge, and contextual factors. Section 3.6 analyzes present systems (traditional re-reading and Quizlet) including their operations, merits, demerits, and data flow diagrams. Section 3.7 analyzes the proposed Student Buddy system with similar depth, providing justification for the new system.

---

## 3.2 Adopted Method for this Research

### 3.2.1 Research Methodology

This project adopted an **iterative prototyping methodology** for three key reasons:

**1. Uncertain Requirements**  
The combination of AI-powered question generation with note-grounded retrieval practice is relatively novel. Initial requirements could not be fully specified because technical capabilities (what questions AI could generate, how students would interact with hints) only became clear through implementation and testing.

**2. Pedagogical Validation Needs**  
Educational technology effectiveness can only be validated through actual use. Questions like "Does two-stage hinting preserve productive struggle?" required iterative testing with varied note content to answer.

**3. AI Quality Issues**  
Early prototypes revealed AI-generated questions sometimes had ambiguous wording or missed key concepts. This required multiple prompt engineering iterations that could only be discovered through actual generation attempts.

### 3.2.2 Development Phases

The 16-week development timeline was structured into four phases:

**Phase 1: Requirements Analysis (Weeks 1-3)**

Activities:
- Literature review on retrieval practice and cognitive science
- Informal interviews with undergraduate students about study habits
- Analysis of existing tools (Quizlet, Anki, ChatGPT)
- Technical feasibility confirmation (Gemini API capabilities, MERN stack suitability)

Key Priorities Identified:
- Upload and manage text-based notes from multiple sources
- Generate multiple-choice and open-ended questions from note content
- Provide staged feedback (hint → full explanation)
- Track progress per note to build metacognitive awareness

**Phase 2: Core Implementation (Weeks 4-8)**

Focus: Build foundational architecture

Backend Development:
- User authentication system (JWT-based with bcrypt password hashing)
- Note CRUD operations with MongoDB
- Basic quiz generation and delivery
- Initial AI prompt engineering

Frontend Development:
- React application structure with routing
- Authentication pages (login, register)
- Notes management interface
- Basic note editor using TipTap

Technology Stack Rationale:
- **MongoDB**: Flexible document storage for variable-structure notes
- **Express + Node.js**: Mature backend framework with extensive libraries
- **React**: Component-based UI for responsive interfaces
- **Google Gemini API**: AI generation with acceptable quality-to-cost ratio

**Phase 3: Feature Enhancement (Weeks 9-12)**

Based on developer testing with diverse note types:

Major Additions:
- Two-stage hint system (minimal hint → full explanation)
- Practice exam module with AI grading
- OCR support for scanned PDFs using Tesseract.js
- Assessment tracker showing per-note performance trends

Iterative Improvements:
- AI prompt engineering underwent six major iterations to reduce question ambiguity
- Added automatic detection of image-based PDFs to trigger OCR
- Improved user interface based on usability testing
- Optimized database queries with indexes

**Phase 4: System Refinement (Weeks 13-16)**

Final activities:
- Code refactoring and optimization
- Bug resolution (duplicate questions, token persistence, OCR timeouts)
- Performance tuning (bundle size reduction, query optimization)
- Comprehensive documentation
- Systematic testing across all features

---

## 3.3 Data Gathering

### 3.3.1 Literature Review

Comprehensive review of academic literature across multiple domains:

**Cognitive Science Research**:
- Testing effect studies (Roediger & Butler, 2011; Karpicke & Blunt, 2011)
- Spacing and interleaving effects (Cepeda et al., 2006)
- Metacognition research (Bjork, Dunlosky & Kornell, 2013)

**Educational Psychology**:
- Constructivism and Zone of Proximal Development (Vygotsky, 1978)
- Cognitive Load Theory (Sweller, 1988)
- TPACK framework (Mishra & Koehler, 2006)

**Student Behavior Research**:
- Study strategy preferences (Hartwig & Dunlosky, 2012)
- Metacognitive errors in learning (Kornell & Bjork, 2008)
- Material organization challenges (Pechenkina et al., 2017)

**Educational Technology Analysis**:
- Flashcard systems (Quizlet, Anki)
- Intelligent tutoring systems
- AI in education (Bond et al., 2024)

### 3.3.2 Existing System Analysis

Detailed examination of current study tools:

**Quizlet Analysis**:
- Feature documentation (study modes, AI features, spaced repetition)
- Pedagogical assessment (question types, feedback mechanisms)
- Limitation identification (surface-level questions, generic AI generation)

**ChatGPT Analysis**:
- Capability testing for educational question generation
- Limitation documentation (content misalignment, hallucination risks)

**Traditional Methods Analysis**:
- Re-reading workflow documentation
- Note-taking practice observation
- Cognitive process analysis

### 3.3.3 Technical Research

Investigation of technical capabilities:

**AI Capabilities**:
- Gemini API evaluation (response quality, speed, context limits)
- Prompt engineering experimentation
- Quality control mechanism research

**Document Processing**:
- PDF text extraction testing (pdf-parse library)
- OCR technology assessment (Tesseract.js accuracy)
- DOCX processing evaluation (mammoth library)

**Architecture Patterns**:
- MERN stack best practices
- Authentication security standards
- Scalability considerations

### 3.3.4 System Usage Data Collection

The implemented system automatically collects data during normal operations:

**User Account Data**: Username, email, hashed password, school, level, course enrollments

**Study Note Data**: Title, content (rich text), subject classification, course reference, timestamps

**Quiz Practice Data**: Questions, answers, scores, time spent, hints requested, attempt counts

**Practice Exam Data**: Open-ended questions, user answers, AI grades (0-10 scale), detailed feedback

**System Usage Logs**: Login timestamps, session durations, note access patterns, API call logs

**Important Note**: Due to project scope limitations, formal evaluation with student participants was not conducted. System testing was performed by the developer using various note types and usage scenarios to verify functionality.

---

## 3.4 Problem Identification

### 3.4.1 Core Problem

Students avoid effective retrieval practice despite strong evidence for its benefits, preferring passive rereading which creates an illusion of mastery without genuine learning.

### 3.4.2 Specific Problems Identified

**Problem 1: Time and Effort Barrier**
- Creating practice questions manually is time-consuming (hours of work)
- Students spend more time preparing materials than actually studying
- This barrier discourages adoption of retrieval practice

**Problem 2: Discomfort and Difficulty**
- Self-testing feels harder than rereading
- Students mistake familiarity from rereading for actual understanding
- Metacognitive errors lead to poor study strategy choices

**Problem 3: Material Disorganization**
- Notes scattered across notebooks, phones, laptops, cloud storage
- Significant time wasted locating and organizing materials
- Organizational overhead discourages effective study

**Problem 4: Generic AI Tools**
- Existing AI tools (ChatGPT) generate questions from general knowledge
- Questions don't align with student's actual study materials
- Misalignment with instructor emphasis and course content

**Problem 5: Inadequate Feedback**
- Flashcard apps provide binary right/wrong feedback
- No scaffolding to support productive struggle
- Students either know answer or see it immediately (no middle ground)

**Problem 6: No Progress Tracking**
- Students can't identify weak topics objectively
- No evidence of improvement over time
- Lack of metacognitive awareness about actual knowledge

---

## 3.5 Feasibility Studies

### 3.5.1 Technical Feasibility

**AI Capabilities Assessment**:
- Google Gemini API confirmed capable of generating structured questions from unstructured text
- API supports up to 400,000 characters context (sufficient for large textbooks)
- Response time acceptable (10-15 seconds for 15 questions)
- Free tier provides 60 requests/minute, adequate for development

**Document Processing Verification**:
- pdf-parse library successfully extracts text from text-based PDFs
- Tesseract.js provides OCR for scanned documents with acceptable accuracy
- mammoth library handles DOCX files effectively
- Processing time acceptable for typical use cases

**MERN Stack Suitability**:
- MongoDB suitable for flexible document storage
- Express.js provides robust API framework
- React enables responsive, component-based UI
- Node.js handles concurrent requests efficiently

**Conclusion**: Technically feasible with available technologies.

### 3.5.2 Financial Feasibility

**Development Costs**:
- Free tier services used for development:
  - MongoDB Atlas (512MB free tier)
  - Google Gemini API (60 requests/minute free)
  - Vercel hosting (free for personal projects)
- Total development cost: ₦0 (using free resources)

**Operational Costs** (if deployed at scale):
- MongoDB Atlas: $0-$57/month depending on usage
- Gemini API: $0.00015 per 1K characters (very affordable)
- Hosting: $0-$20/month

**Conclusion**: Financially feasible for both development and deployment.

### 3.5.3 Time Constraint Feasibility

**Project Timeline**: 16 weeks (one semester)

| Phase | Duration | Activities | Status |
|-------|----------|------------|--------|
| Requirements & Design | 3 weeks | Literature review, system design | ✓ Completed |
| Core Implementation | 5 weeks | Backend, frontend, basic features | ✓ Completed |
| Feature Enhancement | 4 weeks | Advanced features, AI refinement | ✓ Completed |
| Testing & Documentation | 4 weeks | Bug fixes, testing, documentation | ✓ Completed |

**Conclusion**: Timeline was realistic and successfully met all milestones.

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
- Learning resources: online documentation, tutorials, developer communities

**Conclusion**: Required skills were within reach with dedicated learning effort.

### 3.5.5 Study Area Feasibility

**Target Users**: Undergraduate students in text-heavy disciplines
- Psychology, Biology, History, Literature, Social Sciences

**Limitations Accepted**:
- Not suitable for diagram-heavy subjects (Engineering, Architecture)
- Not suitable for mathematics (requires LaTeX support)
- Not suitable for programming courses (requires code syntax highlighting)

**Conclusion**: Feasible for defined target audience with clear scope boundaries.

---


## 3.6 Analysis of Present System

### 3.6.1 Traditional Re-Reading (Manual Baseline)

**How It Operates**:

Typical workflow students follow:
1. **Note Creation**: During lectures, students create notes (handwritten in notebooks, typed in Word/Google Docs, or highlighted in PDFs)
2. **First Review**: Days or weeks later, students read through notes to refresh memory
3. **Repeated Reviews**: The same material gets re-read multiple times before exams
4. **Pre-Exam Cramming**: In the final 2-3 days, re-reading intensifies
5. **Assessment**: First real test of retention occurs during the exam

**Cognitive Process**:  
Re-reading primarily engages recognition memory. Students experience processing fluency (subjective ease from seeing familiar material), which creates a false sense of mastery. However, recognition poorly predicts recall ability (Bjork et al., 2013).

**Data Flow Diagram**:

```
[Student] → [Create Notes] → [Store Notes] → [Re-read Notes] → 
[Experience Familiarity] → [False Confidence] → [Exam] → [Poor Recall]
```

**[PLACEHOLDER: Add detailed DFD for traditional re-reading workflow]**

**Merits**:
1. Universal accessibility - requires no technology or training
2. Familiarity and comfort - students have used this since primary school
3. Flexibility - can be done anywhere, anytime
4. Low initial cognitive load - less mentally taxing than retrieval practice
5. Ensures students encounter all material at least once

**Demerits**:
1. **Illusion of Competence**: Fluency creates false confidence without genuine learning
2. **No Active Retrieval**: Reading is passive, providing minimal benefit for recall-based exams
3. **Time Inefficiency**: After first pass, additional re-readings add little value
4. **No Diagnostic Feedback**: Students don't discover knowledge gaps until exam day
5. **Material Fragmentation**: Notes scattered across multiple platforms create organizational overhead
6. **No Spacing Mechanism**: Students typically cram (mass practice) rather than space reviews
7. **No Progress Metrics**: Absence of objective performance measures

### 3.6.2 Quizlet (Digital Flashcard System)

**How It Operates**:

System workflow:
1. **Study Set Creation**: Students create flashcard sets (term-definition pairs) manually or via AI
2. **Study Mode Selection**: Choose from flashcards, learn mode, test mode, or match game
3. **Practice Session**: System presents cards, student attempts recall
4. **Self-Reporting**: Student indicates if they knew the answer
5. **Spaced Repetition**: Algorithm schedules reviews based on self-reported confidence
6. **AI Generation** (recent feature): Upload documents, AI extracts flashcards automatically

**Data Flow Diagram**:

```
[Student] → [Create/Upload Content] → [AI Extraction] → [Flashcard Set] → 
[Study Session] → [Self-Report Confidence] → [Spaced Repetition Algorithm] → 
[Schedule Next Review]
```

**[PLACEHOLDER: Add detailed DFD for Quizlet workflow]**

**Merits**:
1. **Active Retrieval Practice**: Requires producing answers, engaging recall rather than recognition
2. **Low Barrier to Entry**: Creating flashcards is simple and intuitive
3. **Multiple Study Modes**: Variety reduces monotony and maintains engagement
4. **Extensive Shared Content**: Millions of user-created study sets publicly available
5. **Cross-Platform Availability**: Seamless experience across web, iOS, and Android
6. **AI-Powered Automation**: Recent features reduce manual flashcard creation work
7. **Basic Progress Tracking**: Analytics show which terms need more review

**Demerits**:
1. **Surface-Level Question Focus**: Emphasizes term-definition pairs, privileging simple recall over conceptual understanding
2. **Generic AI Content Generation**: AI operates without knowledge of course-specific learning objectives or instructor emphasis
3. **Minimal Feedback Quality**: Most modes provide binary right/wrong feedback without explanations
4. **No Scaffolding for Productive Struggle**: No graduated hints - students either recall or see answer immediately
5. **Weak Integration with Evolving Notes**: No persistent connection between flashcards and source materials
6. **No Per-Note Progress Tracking**: Tracking operates at flashcard-set level, not note-content level
7. **Question Quality Variability**: AI-generated flashcards sometimes have ambiguous wording
8. **Freemium Model Constraints**: Free tier limits access to basic features; advanced features require paid subscription

### 3.6.3 Summary Comparison

| Feature | Re-Reading | Quizlet | Student Buddy |
|---------|-----------|---------|---------------|
| Active Retrieval | ✗ | ✓ | ✓ |
| Note-Grounded | ✓ | ✗ | ✓ |
| Scaffolded Feedback | ✗ | ✗ | ✓ |
| Progress Tracking | ✗ | Basic | Comprehensive |
| Automation | ✗ | Partial | Full |
| Integration | ✗ | ✗ | ✓ |
| Cost | Free | Freemium | Free |

---

## 3.7 Analysis of Proposed System (Student Buddy)

### 3.7.1 How It Operates

**Complete System Workflow**:

**1. Note Management Phase**:
- Student uploads PDF/DOCX or types notes manually
- System extracts text (OCR if scanned document)
- Notes stored in MongoDB with course/subject organization
- Rich-text editor available for manual note creation

**2. Quiz Generation Phase**:
- Student selects note(s) and clicks "Generate Quiz"
- System sends note content to Gemini API with structured prompt
- AI generates 15 MCQ questions with hints and explanations
- Questions validated and displayed one at a time

**3. Quiz Interaction Phase** (Two-Attempt System):
- Student reads question and submits answer
- **If correct (1st attempt)**: Immediate feedback + explanation → next question
- **If wrong (1st attempt)**: Hint shown, second chance given
- **If wrong (2nd attempt)**: Correct answer + full explanation shown → next question
- Only first attempts count toward final score

**4. Practice Exam Phase**:
- Student generates 15 open-ended questions from note(s)
- Student answers all questions (essay-style with Markdown support)
- System sends answers to AI for grading
- AI grades each answer (0-10 scale) with detailed feedback
- Results displayed with overall score and per-question breakdown

**5. Progress Tracking Phase**:
- System records all quiz/exam attempts
- Assessment tracker shows per-note performance history
- Improvement metrics calculated automatically
- Weak topics identified (notes with <60% average)

**Data Flow Diagram**:

```
[Student] → [Upload/Create Note] → [MongoDB Storage] → 
[Select Note] → [Generate Quiz] → [Gemini API] → 
[Receive Questions] → [Answer Questions] → [Two-Stage Feedback] → 
[Save Results] → [Assessment Tracker] → [View Progress]
```

**[PLACEHOLDER: Add comprehensive DFD showing all system components and data flows]**

### 3.7.2 System Architecture

**Three-Tier Architecture**:

**Tier 1: Presentation Layer (Frontend)**
- Technology: React 18.2.0 with Vite
- Styling: TailwindCSS, Radix UI components
- Editor: TipTap for rich text
- Routing: React Router for navigation

**Tier 2: Application Layer (Backend)**
- Runtime: Node.js with Express 4.18.2
- Authentication: JWT with bcrypt
- File Processing: pdf-parse, Tesseract.js, mammoth
- AI Integration: Google Gemini API

**Tier 3: Data Layer**
- Database: MongoDB 8.1.3 with Mongoose
- External API: Google Gemini 2.5 Flash
- Storage: User accounts, notes, quiz results, practice exams

**[PLACEHOLDER: Add 3-tier architecture diagram]**

### 3.7.3 Merits of Proposed System

1. **Note-Grounded Generation**: Questions derived exclusively from student's actual notes, ensuring content alignment with what they studied

2. **Automated Question Creation**: 15 questions generated in 10-15 seconds, eliminating time barrier

3. **Scaffolded Feedback**: Two-stage hints preserve productive struggle while preventing frustration (implements Vygotsky's ZPD)

4. **Integrated Workflow**: All functions in one platform - no tool-switching overhead (reduces cognitive load per Sweller's theory)

5. **Comprehensive Progress Tracking**: Per-note performance history enables targeted review

6. **Multiple Question Types**: Both MCQ (quick practice) and open-ended (deeper assessment)

7. **AI Grading with Detailed Feedback**: Constructive, lecturer-style feedback on essay responses

8. **OCR Support**: Handles scanned PDFs, accommodating various note formats

9. **Cross-Platform**: Web-based, works on any device with browser

10. **Free to Use**: No subscription fees, fully-featured free tier

### 3.7.4 Demerits of Proposed System

1. **Text-Only Support**: Cannot process diagrams, mathematical equations, or chemical formulas

2. **Internet Dependency**: Requires stable connection for AI features

3. **AI Quality Variability**: Occasional ambiguous or irrelevant questions despite mitigation efforts

4. **Note Quality Dependency**: Output quality reflects input quality ("garbage in, garbage out")

5. **No Spaced Repetition Algorithm**: Doesn't automatically schedule reviews based on forgetting curves

6. **Single-User Focus**: No collaborative features for peer learning

7. **Limited Evaluation**: No formal user testing with participants (developer testing only)

### 3.7.5 Justification of the New System

**Why Student Buddy is Needed**:

**1. Addresses Evidence-Practice Gap**  
Makes retrieval practice accessible by removing time barriers through automation, directly addressing the primary reason students avoid effective strategies.

**2. Solves Content Alignment Problem**  
Unlike ChatGPT/Quizlet, questions test what student actually studied, not general knowledge. This ensures relevance for exam preparation.

**3. Provides Appropriate Scaffolding**  
Two-stage hints maintain challenge while preventing frustration, implementing Vygotsky's ZPD concept that existing tools ignore.

**4. Reduces Cognitive Load**  
Integrated system eliminates tool-switching overhead, freeing cognitive resources for actual learning (per Cognitive Load Theory).

**5. Builds Metacognition**  
Progress tracking reveals actual knowledge vs. perceived knowledge, helping students identify weak topics objectively.

**6. Leverages AI Appropriately**  
Uses AI for automation (question generation) while maintaining pedagogical integrity (note-grounding, scaffolded feedback).

**7. Research-Informed Design**  
Every feature justified by cognitive science literature, not arbitrary feature addition.

**Comparison with Alternatives**:

| Need | Traditional Method | Existing Tools | Student Buddy |
|------|-------------------|----------------|---------------|
| Time efficiency | Manual (hours) | Partial automation | Full automation (seconds) |
| Content alignment | ✓ (own notes) | ✗ (general knowledge) | ✓ (own notes) |
| Feedback quality | None | Binary | Scaffolded |
| Integration | Scattered | Separate tools | Single platform |
| Progress tracking | Manual | Basic | Comprehensive |
| Cost | Free | Freemium | Free |

---

## 3.8 Summary

This chapter presented the complete research methodology for Student Buddy:

**Section 3.2** described the iterative prototyping approach with four development phases over 16 weeks, justified by uncertain requirements and the need for pedagogical validation.

**Section 3.3** outlined data gathering through comprehensive literature review, existing system analysis, technical research, and automated system usage data collection.

**Section 3.4** identified six core problems: time barriers, discomfort, disorganization, generic AI tools, inadequate feedback, and lack of progress tracking.

**Section 3.5** confirmed feasibility across technical, financial, time, knowledge, and study area dimensions, demonstrating project viability.

**Section 3.6** analyzed present systems (re-reading and Quizlet), documenting their operations, merits, demerits, and data flows, revealing critical gaps.

**Section 3.7** analyzed the proposed Student Buddy system with equivalent depth, explaining operations, architecture, merits, demerits, and providing strong justification for why it addresses identified gaps.

The methodology establishes a rigorous foundation for the system implementation described in Chapter 4.

---

**[End of Chapter 3]**

---

**PLACEHOLDERS TO ADD**:
- [ ] DFD: Traditional re-reading workflow
- [ ] DFD: Quizlet workflow  
- [ ] DFD: Student Buddy complete workflow
- [ ] Diagram: 3-tier system architecture
- [ ] Diagram: Database entity relationships
