# LIST OF FIGURES AND TABLES

---

## LIST OF FIGURES

**Figure 2.1**: The Testing Effect - Comparison of Retention Rates ...................... 15  
*Graph showing retention rates over time comparing retrieval practice vs. rereading*

**Figure 2.2**: TPACK Framework Diagram ............................................. 26  
*Venn diagram illustrating the intersection of Technological, Pedagogical, and Content Knowledge*

**Figure 3.1**: Student Buddy System Overview ........................................ 43  
*High-level diagram showing the main components and user interactions of Student Buddy*

**Figure 3.2**: System Architecture Diagram .......................................... 46  
*Technical architecture showing frontend, backend, database, and AI service layers*

**Figure 3.3**: Entity-Relationship Diagram .......................................... 47  
*Database schema showing relationships between User, Note, QuizResult, and PracticeExam entities*

**Figure 3.4**: Document Processing Flowchart ........................................ 52  
*Process flow showing file upload, text extraction, OCR fallback, and storage workflow*

**Figure 3.5**: Quiz Generation Process Flowchart .................................... 52  
*Detailed workflow of AI-powered quiz question generation from note content*

**Figure 3.6**: Two-Stage Hint System Flowchart ...................................... 53  
*Decision tree showing hint progression: attempt → minimal hint → full explanation*

**Figure 3.7**: Practice Exam Grading Flowchart ...................................... 53  
*AI grading workflow showing answer submission, evaluation, and feedback generation*

**Figure 4.1**: Database Relationship Diagram ........................................ 62  
*Detailed MongoDB schema showing collections, fields, and relationships*

**Figure 4.2**: Document Processing Implementation Flow ............................... 65  
*Technical implementation of file upload, validation, and text extraction pipeline*

**Figure 4.3**: Notes Management Page Screenshot ..................................... 68  
*User interface showing note list, search functionality, and action buttons*

**Figure 4.4**: Quiz Interface Screenshot ............................................ 69  
*Active quiz session showing question, options, hint buttons, and progress indicator*

**Figure 4.5**: Practice Exam Setup Screenshot ....................................... 70  
*Interface for selecting notes and configuring practice exam parameters*

**Figure 4.6**: Exam Interface Screenshot ............................................ 70  
*Practice exam interface showing open-ended questions and text input areas*

**Figure 4.7**: Results and Feedback Page Screenshot ................................. 71  
*Detailed results display with scores, AI feedback, and improvement recommendations*

**Figure 4.8**: Authentication Flow Diagram .......................................... 78  
*JWT-based authentication workflow showing login, token generation, and validation*

**Figure 4.9**: AI Service Architecture .............................................. 73  
*Diagram showing multi-key rotation, retry logic, and error handling in AI integration*

**Figure 4.10**: Responsive Design Breakpoints ....................................... 72  
*Visual representation of mobile, tablet, and desktop layout adaptations*

---

## LIST OF TABLES

**Table 2.1**: Comparison of Learning Strategies ..................................... 17  
*Effectiveness ratings of retrieval practice, elaboration, rereading, and highlighting*

**Table 2.2**: Existing Tools Feature Comparison ..................................... 22  
*Feature matrix comparing Quizlet, Anki, ChatGPT, and other tools*

**Table 3.1**: Comparison of Existing Systems vs. Student Buddy ...................... 44  
*Detailed feature comparison showing gaps addressed by Student Buddy*

**Table 3.2**: Functional Requirements Specification ................................. 49  
*Complete list of system functional requirements with priority levels*

**Table 3.3**: Non-Functional Requirements Specification ............................. 50  
*Performance, security, usability, and reliability requirements*

**Table 4.1**: Technology Stack Components ........................................... 58  
*Detailed breakdown of frontend, backend, database, and AI technologies used*

**Table 4.2**: Database Collections and Relationships ................................ 63  
*MongoDB collections with field descriptions and data types*

**Table 4.3**: API Endpoints Summary ................................................. 64  
*Complete list of REST API endpoints with methods, routes, and descriptions*

**Table 4.4**: Middleware Functions .................................................. 64  
*Authentication, validation, and error handling middleware descriptions*

**Table 4.5**: Document Processing Libraries ......................................... 66  
*Libraries used for PDF, DOCX, TXT, and OCR processing with capabilities*

**Table 4.6**: AI Prompt Templates ................................................... 74  
*Summary of prompt structures for quiz generation, hints, and grading*

**Table 4.7**: Security Measures Implemented ......................................... 77  
*Security features including authentication, validation, and data protection*

**Table 4.8**: Testing Scenarios and Results ......................................... 80  
*Test cases covering functionality, performance, and edge cases with outcomes*

**Table 4.9**: Performance Metrics ................................................... 81  
*System performance measurements including response times and resource usage*

**Table 5.1**: Objectives Achievement Summary ........................................ 86  
*Checklist showing completion status of all project objectives*

**Table 5.2**: Technical Challenges and Solutions .................................... 90  
*Summary of major challenges encountered and resolution strategies*

**Table 5.3**: Future Enhancement Priorities ......................................... 92  
*Recommended improvements ranked by priority and implementation complexity*

---

## LIST OF CODE SNIPPETS

**Code Snippet 4.1**: Server Initialization (server.js) .............................. 60  
*Express server setup with middleware configuration and database connection*

**Code Snippet 4.2**: User Schema Definition (models/User.js) ........................ 61  
*Mongoose schema for user authentication and profile data*

**Code Snippet 4.3**: Note Schema Definition (models/Note.js) ........................ 61  
*Mongoose schema for note storage with content and metadata*

**Code Snippet 4.4**: QuizResult Schema Definition (models/QuizResult.js) ............ 62  
*Schema for storing quiz attempts, scores, and performance data*

**Code Snippet 4.5**: AIGeneratedPracticeExam Schema (models/PracticeExam.js) ........ 62  
*Schema for practice exam questions and AI-generated feedback*

**Code Snippet 4.6**: Authentication Middleware (middleware/auth.js) ................. 64  
*JWT token verification and user authentication logic*

**Code Snippet 4.7**: OCR Text Extraction (services/documentProcessor.js) ............ 66  
*Tesseract.js implementation for extracting text from scanned PDFs*

**Code Snippet 4.8**: AI Service Class (services/aiService.js) ....................... 67  
*Google Gemini API integration with multi-key rotation and retry logic*

**Code Snippet 4.9**: React Router Configuration (App.jsx) ........................... 68  
*Client-side routing setup with protected routes and authentication*

**Code Snippet 4.10**: Quiz Generation Prompt (services/aiService.js) ................ 74  
*Detailed prompt template for generating multiple-choice questions*

**Code Snippet 4.11**: Grading Prompt Structure (services/aiService.js) .............. 75  
*AI prompt for evaluating open-ended answers and providing feedback*

**Code Snippet 4.12**: Two-Stage Hint Logic (components/QuizSession.jsx) ............. 76  
*React component logic for managing hint progression during quizzes*

---

## FIGURE AND TABLE PLACEMENT GUIDELINES

### **Placement Rules:**
1. **Figures and tables should appear as close as possible to their first mention in the text**
2. **Each figure/table must be referenced in the text before it appears**
3. **Captions should be placed below figures and above tables**
4. **Numbering should be sequential within each chapter (e.g., Figure 3.1, Figure 3.2)**

### **Caption Format:**
- **Figures**: "Figure X.X: [Descriptive Title]"
- **Tables**: "Table X.X: [Descriptive Title]"
- **Code Snippets**: "Code Snippet X.X: [Descriptive Title]"

### **Referencing in Text:**
- "As shown in Figure 3.1..."
- "Table 4.2 presents..."
- "The implementation (Code Snippet 4.8) demonstrates..."

---

## VISUAL CONTENT SUMMARY

### **Total Visual Elements:**
- **Figures**: 19 diagrams, flowcharts, and screenshots
- **Tables**: 15 comparison and specification tables
- **Code Snippets**: 12 implementation examples

### **Distribution by Chapter:**
- **Chapter 2**: 2 figures, 2 tables (Literature Review)
- **Chapter 3**: 7 figures, 3 tables (Methodology & Design)
- **Chapter 4**: 10 figures, 9 tables, 12 code snippets (Implementation)
- **Chapter 5**: 0 figures, 3 tables (Conclusion)

### **Content Types:**
- **System Diagrams**: 5 (architecture, ER diagrams, flows)
- **Flowcharts**: 5 (processes and workflows)
- **Screenshots**: 6 (user interface examples)
- **Comparison Tables**: 4 (feature comparisons)
- **Specification Tables**: 6 (requirements, APIs, security)
- **Code Examples**: 12 (implementation snippets)

---

## NOTES FOR DOCUMENT PREPARATION

### **Creating Figures:**
1. **Diagrams**: Use tools like Draw.io, Lucidchart, or Microsoft Visio
2. **Flowcharts**: Use standard flowchart symbols (ISO 5807)
3. **Screenshots**: Capture at high resolution (1920×1080 minimum)
4. **Format**: Save as PNG or JPEG (300 DPI for printing)

### **Creating Tables:**
1. **Format**: Use consistent column widths and row heights
2. **Headers**: Bold text with background shading
3. **Borders**: Use simple grid lines for clarity
4. **Alignment**: Left-align text, right-align numbers

### **Code Snippets:**
1. **Syntax Highlighting**: Use appropriate color scheme
2. **Line Numbers**: Include for reference
3. **Comments**: Add explanatory comments where needed
4. **Length**: Keep snippets focused (10-30 lines ideal)

---

**Note**: All figures, tables, and code snippets listed here should be created and inserted into the appropriate chapters at the locations indicated by the page numbers. Ensure consistent formatting and high-quality visuals throughout the document.

