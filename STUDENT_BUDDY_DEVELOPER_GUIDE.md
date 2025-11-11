# STUDENT BUDDY: COMPREHENSIVE DEVELOPER'S GUIDE
## An AI-Assisted Retrieval Practice System

---

## TABLE OF CONTENTS

1. [System Overview](#system-overview)
2. [Theoretical Foundation & Design Rationale](#theoretical-foundation)
3. [Architecture & Technology Stack](#architecture)
4. [Backend System Deep Dive](#backend-system)
5. [AI Service Implementation](#ai-service)
6. [Database Schema & Data Models](#database-schema)
7. [Frontend Architecture](#frontend-architecture)
8. [User Flow & Navigation](#user-flow)
9. [Retrieval Practice Implementation](#retrieval-practice)
10. [Practice Exam System](#practice-exam-system)
11. [Code Snippets & Examples](#code-snippets)
12. [Deployment & Configuration](#deployment)

---

## 1. SYSTEM OVERVIEW {#system-overview}

### 1.1 Project Purpose

Student Buddy is an AI-powered retrieval practice system designed to address the evidence-practice gap in student learning. While cognitive research demonstrates that retrieval practice (self-testing) produces superior learning outcomes compared to passive rereading (Roediger & Butler, 2011), students avoid this effective strategy due to:

- **Time costs**: Creating practice questions manually is labor-intensive
- **Metacognitive errors**: Rereading creates familiarity mistaken for mastery
- **Practical barriers**: Study materials scattered across multiple platforms
- **Subjective discomfort**: Self-testing feels harder than passive review

### 1.2 Core Innovation

Student Buddy bridges this gap by:

1. **Automating question generation** directly from students' own notes
2. **Providing scaffolded feedback** through a two-stage hint system (ZPD-aligned)
3. **Reducing extraneous cognitive load** via integrated note management
4. **Tracking progress** to build metacognitive awareness

### 1.3 Key Differentiators

Unlike existing tools (Quizlet, Anki, ChatGPT, NotebookLM):
- **Note-grounded generation**: Questions derived exclusively from student's actual notes
- **Pedagogically-informed feedback**: Graduated hints preserve productive struggle
- **Integrated workflow**: Consolidates note storage, question generation, practice, and tracking
- **Research-validated design**: Built on Constructivism, Cognitive Load Theory, and TPACK frameworks



---

## 2. THEORETICAL FOUNDATION & DESIGN RATIONALE {#theoretical-foundation}

### 2.1 Constructivist Principles

**Zone of Proximal Development (ZPD) Implementation**

The system maintains retrieval tasks within students' ZPD through:

```javascript
// Two-stage hint system (Study.jsx)
// Stage 1: Minimal contextual hint after first wrong attempt
if (attemptCounts[currentQuestion] === 1 && !isCorrect) {
  setHintShownAutomatically(prev => {
    const arr = [...prev];
    arr[currentQuestion] = true;
    return arr;
  });
}

// Stage 2: Full explanation after second attempt
if (attemptCounts[currentQuestion] >= 2) {
  // Show correct answer + detailed explanation
  showFullExplanation();
}
```

**Design Rationale**: This graduated scaffolding prevents complete retrieval failure while preserving the cognitive effort that drives learning (Vygotsky, 1978).

### 2.2 Cognitive Load Theory Application

**Extraneous Load Reduction**

The system minimizes non-productive cognitive demands:

| Traditional Approach | Student Buddy Solution | Load Type Reduced |
|---------------------|------------------------|-------------------|
| Scattered notes across platforms | Centralized note storage | Extraneous |
| Manual question creation | Automated AI generation | Extraneous |
| Self-tracking progress | Automatic performance analytics | Extraneous |
| Searching for study materials | Integrated note-to-quiz workflow | Extraneous |

**Germane Load Preservation**

Critical cognitive processes remain:
- Active memory retrieval (not recognition)
- Explanation generation for open-ended questions
- Error analysis through feedback review

### 2.3 TPACK Framework Tensions

**Resolved Design Trade-offs**:

1. **Automation vs. Quality Control**
   - Solution: Partial automation with programmatic filtering
   - AI generates questions → Regex validation → Student reporting mechanism

2. **Generic Strategies vs. Disciplinary Specificity**
   - Solution: Target text-heavy disciplines (humanities, social sciences)
   - Accept limitation: Not suitable for diagram-heavy STEM fields

3. **Grounding vs. Hallucination Risk**
   - Solution: Constrain LLM to student notes as explicit context
   - Prompt engineering: "Generate questions based ONLY on provided content"



---

## 3. ARCHITECTURE & TECHNOLOGY STACK {#architecture}

### 3.1 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Notes      │  │    Study     │  │   Practice   │      │
│  │  Management  │  │  (Quiz Mode) │  │    Exams     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                    Axios HTTP Client                         │
└────────────────────────────┼────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   API Gateway   │
                    │  (Express.js)   │
                    └────────┬────────┘
                             │
        ┏━━━━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━┓
        ┃                                          ┃
┌───────▼────────┐                      ┌─────────▼────────┐
│  AI Service    │                      │   Controllers    │
│  (Gemini API)  │                      │  - Notes         │
│                │                      │  - Courses       │
│  - Question    │                      │  - Practice Exam │
│    Generation  │                      └─────────┬────────┘
│  - Grading     │                                │
│  - Explanation │                                │
└───────┬────────┘                      ┌─────────▼────────┐
        │                               │   MongoDB        │
        │                               │   (Mongoose)     │
        │                               │                  │
        └───────────────────────────────►  - Users         │
                                        │  - Notes         │
                                        │  - QuizResults   │
                                        │  - PracticeExams │
                                        └──────────────────┘
```

### 3.2 Technology Stack

**Backend**
```json
{
  "runtime": "Node.js v18+",
  "framework": "Express.js 4.18.2",
  "database": "MongoDB 8.1.3 (Mongoose ODM)",
  "ai": "Google Generative AI (@google/generative-ai 0.24.1)",
  "authentication": "JWT (jsonwebtoken 9.0.2)",
  "fileProcessing": {
    "pdf": "pdf-parse 1.1.1",
    "docx": "mammoth 1.6.0",
    "ocr": "tesseract.js 6.0.1",
    "images": "pdf-poppler 0.2.3"
  },
  "utilities": [
    "bcryptjs 2.4.3 (password hashing)",
    "multer 2.0.0 (file uploads)",
    "moment 2.30.1 (date handling)",
    "nanoid 5.1.5 (ID generation)"
  ]
}
```

**Frontend**
```json
{
  "framework": "React 18.2.0",
  "buildTool": "Vite 7.1.7",
  "routing": "React Router DOM 7.6.2",
  "styling": "TailwindCSS 3.3.3",
  "uiComponents": [
    "@radix-ui/react-* (accessible primitives)",
    "Framer Motion 10.18.0 (animations)",
    "Lucide React 0.511.0 (icons)"
  ],
  "richTextEditor": "@tiptap/react 2.12.0",
  "markdown": "marked 15.0.12",
  "http": "axios 1.9.0",
  "stateManagement": "React Context API"
}
```

### 3.3 Project Structure

```
student-buddy/
├── backend/
│   ├── controllers/          # Business logic handlers
│   │   └── noteController.js
│   ├── middleware/           # Request processing
│   │   └── auth.js          # JWT verification
│   ├── models/              # Mongoose schemas
│   │   ├── User.js
│   │   ├── Note.js
│   │   ├── Course.js
│   │   ├── Quiz.js
│   │   ├── QuizResult.js
│   │   ├── PracticeExam.js
│   │   └── AIGeneratedPracticeExam.js
│   ├── routes/              # API endpoints
│   │   ├── auth.js
│   │   ├── notes.js
│   │   ├── courses.js
│   │   ├── ai.js
│   │   ├── practiceExam.js
│   │   └── users.js
│   ├── services/            # Core business services
│   │   └── aiService.js     # Gemini AI integration
│   ├── utils/
│   │   └── dateParser.js
│   ├── app.js               # Express app configuration
│   ├── server.js            # Server entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/             # API client functions
    │   ├── components/      # React components
    │   │   ├── layout/
    │   │   ├── ui/          # Reusable UI components
    │   │   ├── PracticeExam.jsx
    │   │   ├── PracticeExamQuestions.jsx
    │   │   ├── PracticeExamResults.jsx
    │   │   ├── NoteModal.jsx
    │   │   └── RichTextEditor.jsx
    │   ├── context/         # React Context providers
    │   │   ├── AuthContext.jsx
    │   │   └── ThemeContext.jsx
    │   ├── pages/           # Route components
    │   │   ├── Landing.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Notes.jsx
    │   │   ├── Study.jsx    # Quiz generation & interaction
    │   │   ├── PracticeExamPage.jsx
    │   │   └── QuizResultsPage.jsx
    │   ├── services/        # API service layer
    │   │   ├── api.js
    │   │   ├── practiceExamService.js
    │   │   └── studyService.js
    │   ├── utils/
    │   │   └── axios.js     # Axios instance with interceptors
    │   ├── App.jsx          # Root component
    │   └── main.jsx         # Entry point
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```



---

## 4. BACKEND SYSTEM DEEP DIVE {#backend-system}

### 4.1 Server Initialization & Configuration

**Entry Point: `server.js`**

```javascript
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS Configuration - Critical for frontend-backend communication
const allowedOrigins = [
  'http://localhost:5173',           // Development
  'https://main-student-buddy.vercel.app'  // Production
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS policy violation'), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));

// Body parsing with increased limits for large notes
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// MongoDB Connection with retry logic
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  retryWrites: true,
  w: 'majority'
})
.then(() => {
  console.log('✓ MongoDB Atlas connected');
  console.log('Database:', mongoose.connection.name);
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Route mounting
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/practice-exam', require('./routes/practiceExam'));
app.use('/api/users', require('./routes/users'));

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 4.2 Authentication Middleware

**File: `middleware/auth.js`**

```javascript
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      message: 'Access denied. No token provided.' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user info to request object
    req.user = {
      userId: decoded.userId,
      ...decoded
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expired. Please login again.' 
      });
    }
    res.status(403).json({ message: 'Invalid token.' });
  }
};
```

**Usage Pattern**:
```javascript
// Protected route example
router.get('/api/notes', authenticateToken, async (req, res) => {
  // req.user.userId is now available
  const notes = await Note.find({ user: req.user.userId });
  res.json(notes);
});
```

### 4.3 Core API Routes

#### 4.3.1 Authentication Routes (`routes/auth.js`)

**Registration with Password Hashing**:
```javascript
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, school, level } = req.body;
    
    // Check existing user
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user (password hashed by pre-save hook)
    const user = new User({
      username,
      email,
      password,  // Plain text - will be hashed
      school: school || '',
      level: level || ''
    });
    
    await user.save();
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({ 
      token,
      userId: user._id.toString()
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
});
```

**Login with bcrypt Comparison**:
```javascript
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    
    // Compare hashed password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid password' });
    }
    
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({ 
      token, 
      userId: user._id.toString()
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in' });
  }
});
```

#### 4.3.2 Notes Management Routes (`routes/notes.js`)

**Get All Notes with Filtering**:
```javascript
router.get('/', auth, async (req, res) => {
  try {
    const subject = req.query.subject;
    const course = req.query.course;
    
    let filter = { user: req.user.userId };

    // Filter by folder (subject)
    if (subject !== undefined) {
      filter.subject = subject === '' ? { $exists: false } : subject;
    }

    // Filter by course
    if (course) {
      filter.course = new mongoose.Types.ObjectId(course);
    }

    const notes = await Note.find(filter)
      .populate('course')
      .sort({ createdAt: -1 });
      
    res.status(200).json(notes);
  } catch (err) {
    console.error('Error fetching notes:', err);
    res.status(500).json({ message: 'Error fetching notes' });
  }
});
```

**File Upload with Text Extraction**:
```javascript
// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/temp';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'upload-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter: function (req, file, cb) {
    const allowedMimes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown'
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

router.post('/upload/extract-text', auth, upload.single('file'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    let extractedText = '';

    if (fileExt === '.pdf') {
      extractedText = await extractTextFromPDF(filePath);
    } else if (fileExt === '.docx') {
      extractedText = await extractTextFromDOCX(filePath);
    } else if (fileExt === '.txt' || fileExt === '.md') {
      extractedText = fs.readFileSync(filePath, 'utf8');
    }

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    // Limit text length (5M characters for large textbooks)
    if (extractedText.length > 5000000) {
      extractedText = extractedText.substring(0, 5000000) + 
        '\n\n[Text truncated due to length...]';
    }

    res.json({
      success: true,
      text: extractedText.trim(),
      filename: req.file.originalname,
      extractedLength: extractedText.trim().length
    });
  } catch (error) {
    console.error('Error extracting text:', error);
    res.status(500).json({
      error: 'Failed to extract text from file'
    });
  }
});
```

**PDF Text Extraction with OCR Fallback**:
```javascript
async function extractTextFromPDF(filePath) {
  try {
    const pdf = require('pdf-parse');
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);

    // If substantial text found, return it
    if (data.text && data.text.trim().length > 100) {
      return data.text;
    }

    // Otherwise, use OCR for image-based PDFs
    console.log('PDF appears to be image-based, using OCR...');
    return await extractTextFromImagePDF(filePath);
  } catch (error) {
    // Fallback to OCR
    return await extractTextFromImagePDF(filePath);
  }
}

async function extractTextFromImagePDF(filePath) {
  const { convert } = require('pdf-poppler');
  const Tesseract = require('tesseract.js');
  const tempDir = path.join(__dirname, '../uploads/temp-images');

  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  try {
    // Convert PDF pages to PNG images
    const opts = {
      format: 'png',
      out_dir: tempDir,
      out_prefix: `pdf-${Date.now()}`,
      page: null  // All pages
    };

    await convert(filePath, opts);

    // Get generated image files
    const imageFiles = fs.readdirSync(tempDir)
      .filter(file => file.startsWith(opts.out_prefix))
      .sort();

    let fullText = '';
    const maxPages = Math.min(imageFiles.length, 50);  // Limit for performance

    // Run OCR on each image
    for (let i = 0; i < maxPages; i++) {
      const imagePath = path.join(tempDir, imageFiles[i]);
      
      const { data: { text } } = await Tesseract.recognize(
        imagePath,
        'eng',
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              console.log(`Page ${i + 1} OCR: ${Math.round(m.progress * 100)}%`);
            }
          }
        }
      );

      fullText += `\n--- Page ${i + 1} ---\n${text}\n`;
      
      // Delete processed image
      fs.unlinkSync(imagePath);
    }

    return fullText.trim();
  } catch (error) {
    throw new Error('Failed to extract text using OCR');
  }
}
```



---

## 5. AI SERVICE IMPLEMENTATION {#ai-service}

### 5.1 Core AI Service Architecture

**File: `services/aiService.js`**

The AI service is the heart of Student Buddy's retrieval practice system. It implements multi-key rotation, error handling, and specialized methods for different educational tasks.

```javascript
const { GoogleGenerativeAI } = require("@google/generative-ai");

class AIService {
  constructor() {
    this.apiKeys = [];
    this.currentKeyIndex = 0;
    this.genAI = null;
    this.model = null;
    this.modelName = "gemini-2.5-flash";  // Free tier, fast responses
  }

  // Initialize with multiple API keys for rotation
  setApiKeys(keys) {
    if (Array.isArray(keys) && keys.length > 0) {
      this.apiKeys = keys.filter(key => key && typeof key === 'string');
      this.currentKeyIndex = 0;
      this.initializeClient();
    } else {
      console.warn('Invalid API keys array');
      this.apiKeys = [];
      this.genAI = null;
      this.model = null;
    }
  }

  initializeClient() {
    if (this.apiKeys.length === 0) {
      console.warn('No API keys available');
      return;
    }

    try {
      const currentKey = this.apiKeys[this.currentKeyIndex];
      this.genAI = new GoogleGenerativeAI(currentKey);
      this.model = this.genAI.getGenerativeModel({ model: this.modelName });
      console.log(`AI Client initialized (key: ***${currentKey.slice(-4)})`);
    } catch (error) {
      console.error('Failed to initialize GoogleGenerativeAI:', error);
      this.genAI = null;
      this.model = null;
    }
  }

  // Rotate to next API key when current one fails
  rotateToNextKey() {
    if (this.apiKeys.length <= 1) {
      console.warn('No alternative API keys for rotation');
      return false;
    }

    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
    this.initializeClient();
    console.log(`Rotated to key index ${this.currentKeyIndex}`);
    return true;
  }

  // Core generation method with automatic key rotation
  async generateResponse(prompt) {
    if (this.apiKeys.length === 0) {
      throw new Error('AI Service not initialized. API keys missing.');
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

        console.log(`Sending prompt to Gemini (key ${this.currentKeyIndex})`);
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        console.log(`Received response: "${text.substring(0,100)}..."`);
        return text;

      } catch (error) {
        console.error(`Error with key ${this.currentKeyIndex}:`, error);
        
        const errorMessage = error.message || '';
        const statusCode = error.status || error.statusCode;
        
        // Check for rate limiting or authentication errors
        if (statusCode === 403 || statusCode === 429 || statusCode === 503 || 
            errorMessage.includes('quota') || 
            errorMessage.includes('rate limit') || 
            errorMessage.includes('authentication')) {
          
          // Try rotating to next key
          const rotated = this.rotateToNextKey();
          if (rotated && attempt < this.apiKeys.length - 1) {
            console.log(`Retrying with next API key`);
            continue;
          }
        }
        
        // If all keys tried or non-recoverable error
        if (attempt === this.apiKeys.length - 1) {
          throw new Error('All Gemini keys failed or hit their limit');
        } else {
          throw error;
        }
      }
    }

    throw new Error('Failed to generate response after trying all keys');
  }
}

module.exports = new AIService();
```

### 5.2 Quiz Generation Method

**Pedagogical Design**: Questions must test understanding, not just recognition. The prompt engineering reflects Bloom's Taxonomy levels.

```javascript
// Generate 15 MCQ questions from note content
async generateQuizFromNote(noteContent) {
  const prompt = `Generate 15 multiple-choice quiz questions about the following content.

CRITICAL INSTRUCTIONS:
1. Generate questions based ONLY on the content provided below
2. Do NOT include external topics or general knowledge
3. Each question must have exactly 4 options: A, B, C, and D
4. Answers should be randomly distributed (not always C)
5. Include a subtle hint that guides thinking WITHOUT revealing the answer
6. Provide a detailed explanation (2-4 sentences) for the correct answer

FORMAT (follow exactly):
Q1: [Question text]
A) [option A]
B) [option B]
C) [option C]
D) [option D]
Hint: [brief hint without answer keywords]
Explanation: [detailed explanation with examples]
Answer: [A/B/C/D]

CONTENT:
${noteContent.substring(0, 400000)}

Generate 15 questions now in the exact format above.`;

  const response = await this.generateResponse(prompt);
  return response;
}
```

**Frontend Parsing Logic** (`Study.jsx`):

```javascript
// Parse AI response into structured question objects
const questionsArray = rawQuizText.split(/Q\d+:/).filter(Boolean).map(q => {
  try {
    // Extract answer letter
    const answerSplit = q.split(/Answer:/);
    if (answerSplit.length < 2) return null;
    
    const beforeAnswer = answerSplit[0];
    const answerLetter = answerSplit[1].trim().charAt(0).toUpperCase();

    // Extract hint (between "Hint:" and "Explanation:")
    const hintMatch = beforeAnswer.match(/Hint:\s*([\s\S]*?)(?=Explanation:|$)/i);
    const hint = hintMatch ? hintMatch[1].trim() : '';

    // Extract explanation
    const explanationMatch = beforeAnswer.match(/Explanation:\s*([\s\S]*?)(?=Hint:|$)/i);
    const explanation = explanationMatch ? explanationMatch[1].trim() : '';

    // Remove hint/explanation blocks before parsing options
    const beforeAnswerClean = beforeAnswer
      .replace(/Hint:\s*[\s\S]*$/i, '')
      .replace(/Explanation:\s*[\s\S]*$/i, '')
      .trim();

    // Split by option markers A), B), C), D)
    const parts = beforeAnswerClean.split(/A\)|B\)|C\)|D\)/);
    if (parts.length < 5) return null;
    
    const questionText = parts[0].trim();
    const options = [
      parts[1].trim(), 
      parts[2].trim(), 
      parts[3].trim(), 
      parts[4].trim()
    ];

    // Validate structure
    if (questionText && options.length === 4 && 
        ['A','B','C','D'].includes(answerLetter)) {
      return {
        question: questionText,
        options,
        correctAnswer: answerLetter,
        hint: hint || 'Think carefully about the key concepts.',
        explanation: explanation || 'Review the main concepts.'
      };
    }
    return null;
  } catch (parseError) {
    console.error('Error parsing question:', parseError);
    return null;
  }
}).filter(Boolean);  // Remove null entries

console.log(`Parsed ${questionsArray.length} valid questions`);
```

### 5.3 Practice Exam Question Generation

**Open-Ended Questions for Deeper Assessment**:

```javascript
async generatePracticeQuestions(topicOrNote, isNoteBased = true) {
  let prompt;
  
  if (isNoteBased) {
    prompt = `You are an experienced university lecturer creating practice exam questions.

CRITICAL: Generate questions based ONLY on the content provided in the notes below. 
Do not include external topics or concepts not explicitly covered.

Generate exactly 15 practice exam questions distributed fairly across the provided notes.

QUESTION TYPE DISTRIBUTION:
• 3-4 basic knowledge questions (Define, List, Identify, State)
• 3-4 understanding questions (Explain, Describe, Differentiate, Compare)
• 3-4 application/reasoning questions (Why, How, What happens if, Apply to scenarios)
• 2-3 higher-order questions (Compare/contrast, Evaluate, Analyze relationships)

For each question, include in parentheses which NOTE it came from: (NOTE 1), (NOTE 2), etc.

FORMAT:
1. [Basic knowledge question] (NOTE 1)
2. [Understanding question] (NOTE 1)
3. [Application question] (NOTE 2)
...

NOTES:
${topicOrNote}`;
  } else {
    // Topic-based generation (no specific notes)
    prompt = `Generate 15 practice exam questions for: "${topicOrNote}"

Follow the same distribution:
• 3-4 basic knowledge
• 3-4 understanding
• 3-4 application/reasoning
• 2-3 higher-order

Format as numbered list.`;
  }

  const response = await this.generateResponse(prompt);

  // Parse response to extract questions
  const questionRegex = /^\d+\.\s*(.+?)(?:\s*\(NOTE\s*\d+\))?\s*$/gm;
  const questions = [];
  let match;
  
  while ((match = questionRegex.exec(response)) !== null) {
    const questionText = match[1].trim();
    questions.push(questionText);
  }

  return questions;
}
```

### 5.4 AI Grading System

**Intelligent Scoring with Lecturer-Style Feedback**:

```javascript
async gradePracticeExam(questions, userAnswers, noteContent = null) {
  const prompt = `You are an experienced university lecturer providing detailed feedback.

${noteContent ? `REFERENCE MATERIAL (grade based STRICTLY on this):\n${noteContent}\n\n` : ''}

Grade each of the ${questions.length} questions with intelligent assessment.

SCORING SCALE (0-10):
- 9-10: Complete understanding - all key elements captured
- 7-8: Strong understanding - main concepts correct, minor omissions
- 5-6: Good understanding - core idea correct, missing details
- 3-4: Basic understanding - recognizes concept but significant gaps
- 1-2: Limited understanding - vague or mostly incorrect
- 0: No understanding or completely wrong

FEEDBACK STYLE (sound like a real lecturer):
• "Good grasp of the definition, but you missed the practical application."
• "You identified the key term correctly, but your explanation lacks depth."
• "Strong reasoning here, but didn't fully address the consequences."
• "Correct concept but phrased vaguely; be more specific."

Return a JSON array where each object has:
{
  "question": "exact question text",
  "studentAnswer": "student's answer (or 'No answer provided')",
  "mark": number (0-10),
  "comment": "specific, encouraging feedback",
  "reference": "specific concept from reference material"
}

Questions to grade:
`;

  // Add questions and answers
  questions.forEach((q, i) => {
    prompt += `${i + 1}. ${q}\n`;
    prompt += `Student Answer: ${userAnswers[i] || 'No answer provided'}\n\n`;
  });

  const response = await this.generateResponse(prompt);

  try {
    // Extract JSON from markdown code blocks if present
    let jsonStr = response;
    const codeBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim();
    } else {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }
    }

    // Clean up JSON (remove trailing commas)
    jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');

    const detailedResults = JSON.parse(jsonStr);

    // Enrich results with student answers
    const enrichedResults = detailedResults.map((result, index) => ({
      question: result.question || questions[index],
      studentAnswer: userAnswers[index] || 'No answer provided',
      mark: result.mark || 0,
      comment: result.comment || 'No feedback available',
      reference: result.reference || 'N/A'
    }));

    // Calculate total score
    const totalScore = enrichedResults.reduce((sum, item) => sum + item.mark, 0);
    const maxScore = questions.length * 10;
    const percentageScore = Math.round((totalScore / maxScore) * 100);

    // Generate overall feedback
    const averageMark = totalScore / enrichedResults.length;
    let feedback = '';
    if (averageMark >= 8) {
      feedback = 'Excellent work! Strong understanding demonstrated.';
    } else if (averageMark >= 6) {
      feedback = 'Good effort! Captured most key concepts.';
    } else if (averageMark >= 4) {
      feedback = 'Fair understanding. Review core concepts and examples.';
    } else {
      feedback = 'More review needed. Revisit fundamental concepts.';
    }

    return {
      score: percentageScore,
      feedback: feedback,
      detailed: enrichedResults
    };

  } catch (error) {
    console.error('Error parsing grade response:', error);
    
    // Fallback structure
    const fallbackResults = questions.map((q, i) => ({
      question: q,
      studentAnswer: userAnswers[i] || 'No answer provided',
      mark: 0,
      comment: 'Grading error occurred',
      reference: 'N/A'
    }));

    return {
      score: 0,
      feedback: 'Error processing grades',
      detailed: fallbackResults
    };
  }
}
```

### 5.5 Note Summarization & Explanation

**Summarize: Rewrite for Exam Preparation**:

```javascript
async summarizeNote(noteContent) {
  const prompt = `Rewrite this note as if you're an A-grade student preparing for exams.

REQUIREMENTS:
- Keep ALL important concepts and definitions
- Make it concise and clear
- Remove unnecessary details and repetition
- Organize with clear headings
- Use simple language
- Focus on what's needed for exams
- Make it shorter but complete

Note content:
${noteContent}`;

  return await this.generateResponse(prompt);
}
```

**Explain: Expand with Tutoring Depth**:

```javascript
async explainNote(noteContent) {
  const prompt = `Explain and expand upon the following notes in a detailed, educational way.

For each main concept:
- Provide thorough explanation building on original content
- Add relevant details and connections not in original
- Explain why this concept is important
- Include practical applications and implications
- Use clear, step-by-step explanations
- Include relevant background information
- Make connections between related concepts

Write in a clear, educational style that helps students understand and remember.

Original content:
${noteContent}`;
  
  return await this.generateResponse(prompt);
}
```



---

## 6. DATABASE SCHEMA & DATA MODELS {#database-schema}

### 6.1 User Model

**File: `models/User.js`**

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  school: {
    type: String,
    default: ''
  },
  level: {
    type: String,
    default: ''
  },
  semesterStart: String,
  semesterEnd: String,
  semesterGoals: {
    type: String,
    maxlength: 1000
  },
  preferences: {
    type: Object,
    default: {
      theme: 'system',
      language: 'en'
    }
  },
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook: Hash password before storing
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method: Compare password for login
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update timestamp before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);
```

**Design Rationale**:
- Password hashing via pre-save hook ensures security without manual intervention
- `preferences` object allows flexible user settings without schema changes
- `courses` array enables many-to-many relationship tracking

### 6.2 Note Model

**File: `models/Note.js`**

```javascript
const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
    // Stores HTML/Markdown from TipTap editor
  },
  subject: {
    type: String,
    trim: true
    // Acts as "folder" name for organization
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  attachments: [{
    name: String,
    type: String,
    url: String,
    size: Number
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Note', noteSchema);
```

**Design Rationale**:
- `subject` provides folder-like organization without rigid structure
- `content` stores rich text (HTML) from TipTap editor
- `course` reference enables filtering notes by course
- Supports up to 20MB content (configured in Express middleware)

### 6.3 Course Model

**File: `models/Course.js`**

```javascript
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    trim: true
  },
  school: {
    type: String,
    required: true,
    trim: true
  },
  level: {
    type: String,
    required: true,
    trim: true
  },
  semester: {
    type: String,
    trim: true
  },
  topics: [{
    name: { type: String, required: true },
    description: String,
    keyConcepts: [String],
    challenges: String,
    studentNotes: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Course', courseSchema);
```

**Design Rationale**:
- `topics` array allows flexible course content organization
- Each topic can have structured metadata (concepts, challenges)
- Supports AI-generated note creation from topic descriptions

### 6.4 QuizResult Model

**File: `models/QuizResult.js`**

```javascript
const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  noteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note',
    required: false
  },
  noteTitle: {
    type: String,
    required: true
  },
  questions: [{
    question: {
      type: String,
      required: true
    },
    options: [{
      type: String,
      required: true
    }],
    correctAnswer: {
      type: String,
      required: true
    },
    userAnswer: {
      type: String,
      default: null
    },
    isCorrect: {
      type: Boolean,
      default: false
    },
    hint: {
      type: String,
      default: ''
    },
    explanation: {
      type: String,
      default: ''
    }
  }],
  retakeOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuizResult',
    required: false,
    default: null
  },
  score: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  passed: {
    type: Boolean,
    default: false
  },
  timeSpent: {
    type: Number,  // in seconds
    default: 0
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  aiRemarks: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
quizResultSchema.index({ userId: 1, noteId: 1, createdAt: -1 });
quizResultSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('QuizResult', quizResultSchema);
```

**Design Rationale**:
- Stores complete quiz session including all questions and user responses
- `retakeOf` enables tracking quiz retakes for spaced repetition analysis
- Indexes optimize common query patterns (user's quiz history)
- `hint` and `explanation` stored per question for results review

### 6.5 AIGeneratedPracticeExam Model

**File: `models/AIGeneratedPracticeExam.js`**

```javascript
const mongoose = require('mongoose');

const aiGeneratedPracticeExamSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  topicOrNote: {
    type: String,
    required: true
    // Stores full note content or topic description
  },
  noteIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note'
  }],
  noteTitles: [{
    type: String
  }],
  questions: [{
    type: String,
    required: true
    // Open-ended questions (not MCQ)
  }],
  userAnswers: [{
    type: String,
    default: null
  }],
  score: {
    type: Number,
    default: null
    // Percentage score (0-100)
  },
  feedback: {
    type: String,
    default: null
    // Overall AI feedback
  },
  detailed: [{
    question: { type: String },
    studentAnswer: { type: String },
    mark: { type: Number },      // 0-10 scale
    comment: { type: String },    // Lecturer-style feedback
    reference: { type: String }   // Reference to note content
  }],
  submitted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AIGeneratedPracticeExam', aiGeneratedPracticeExamSchema);
```

**Design Rationale**:
- `topicOrNote` stores full context for AI grading reference
- `detailed` array provides granular feedback per question
- `submitted` flag prevents duplicate submissions
- Supports multi-note practice exams via `noteIds` array

### 6.6 Database Relationships Diagram

```
┌─────────────┐
│    User     │
│  _id        │◄──────────┐
│  username   │           │
│  email      │           │
│  password   │           │
│  courses[]  │───┐       │
└─────────────┘   │       │
                  │       │
                  │       │
┌─────────────┐   │       │
│   Course    │◄──┘       │
│  _id        │           │
│  user       │───────────┤
│  name       │           │
│  topics[]   │           │
└─────────────┘           │
       ▲                  │
       │                  │
       │                  │
┌─────────────┐           │
│    Note     │           │
│  _id        │           │
│  user       │───────────┤
│  course     │───────────┘
│  title      │
│  content    │
└─────────────┘
       │
       │ (referenced by)
       │
┌──────────────────┐
│   QuizResult     │
│  _id             │
│  userId          │───────────┐
│  noteId          │───────┐   │
│  questions[]     │       │   │
│  score           │       │   │
│  retakeOf        │───┐   │   │
└──────────────────┘   │   │   │
       ▲               │   │   │
       └───────────────┘   │   │
                           │   │
┌──────────────────────────┐   │
│ AIGeneratedPracticeExam  │   │
│  _id                     │   │
│  userId                  │───┘
│  noteIds[]               │───┘
│  questions[]             │
│  detailed[]              │
└──────────────────────────┘
```



---

## 7. FRONTEND ARCHITECTURE {#frontend-architecture}

### 7.1 Application Entry Point

**File: `main.jsx`**

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Error boundary for graceful failure handling
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <HelmetProvider>
              <App />
            </HelmetProvider>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
```

### 7.2 Authentication Context

**File: `context/AuthContext.jsx`**

```javascript
import React, { createContext, useContext, useState, useEffect } from 'react';
import jwtDecode from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check token expiration
  const checkTokenExpiration = (token) => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      console.error('Error checking token:', error);
      return false;
    }
  };

  // Initialize auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');
    
    if (token && storedUserId) {
      if (checkTokenExpiration(token)) {
        setUserId(storedUserId);
        setIsAuthenticated(true);
      } else {
        // Token expired - clear storage
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        window.location.href = '/login';
      }
    }
  }, []);

  const login = (token, userId) => {
    if (checkTokenExpiration(token)) {
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      setUserId(userId);
      setIsAuthenticated(true);
    } else {
      throw new Error('Token is invalid or expired');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setUserId(null);
    setIsAuthenticated(false);
    window.location.href = '/login';
  };

  const handleAuthError = (response) => {
    if (response && (response.status === 401 || response.status === 403)) {
      logout();
      return true;
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ 
      userId, 
      isAuthenticated, 
      login, 
      logout, 
      handleAuthError 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### 7.3 Routing Configuration

**File: `App.jsx`**

```javascript
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import { useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';

// Lazy load pages for code splitting
const Notes = React.lazy(() => import('./pages/Notes'));
const Study = React.lazy(() => import('./pages/Study'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Landing = React.lazy(() => import('./pages/Landing'));
const PracticeExamPage = React.lazy(() => import('./pages/PracticeExamPage'));
const PracticeExamQuestionsPage = React.lazy(() => import('./pages/PracticeExamQuestionsPage'));
const PracticeExamResultsPage = React.lazy(() => import('./pages/PracticeExamResultsPage'));
const QuizResultsPage = React.lazy(() => import('./pages/QuizResultsPage'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent 
                    rounded-full animate-spin"></div>
  </div>
);

const App = () => {
  const { isAuthenticated } = useAuth();

  const PrivateRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={5000} />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={
          <Suspense fallback={<LoadingFallback />}>
            {!isAuthenticated ? <Landing /> : <Navigate to="/app/active-learning" />}
          </Suspense>
        } />
        
        <Route path="/login" element={
          <Suspense fallback={<LoadingFallback />}>
            {!isAuthenticated ? <Login /> : <Navigate to="/app/active-learning" />}
          </Suspense>
        } />
        
        <Route path="/register" element={
          <Suspense fallback={<LoadingFallback />}>
            {!isAuthenticated ? <Register /> : <Navigate to="/app/active-learning" />}
          </Suspense>
        } />

        {/* Protected routes with MainLayout */}
        <Route path="/app" element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }>
          <Route index element={<Navigate to="/app/active-learning" />} />
          
          <Route path="notes" element={
            <Suspense fallback={<LoadingFallback />}>
              <Notes />
            </Suspense>
          } />
          
          <Route path="active-learning" element={
            <Suspense fallback={<LoadingFallback />}>
              <Study />
            </Suspense>
          } />
          
          <Route path="settings" element={
            <Suspense fallback={<LoadingFallback />}>
              <Settings />
            </Suspense>
          } />
          
          {/* Practice Exam Routes */}
          <Route path="practice-exam" element={<PracticeExamPage />} />
          <Route path="practice-exam/questions/:examId" element={<PracticeExamQuestionsPage />} />
          <Route path="practice-exam/results/:examId" element={<PracticeExamResultsPage />} />
          <Route path="quiz-results/:quizId" element={<QuizResultsPage />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={
          isAuthenticated ? 
            <Navigate to="/app/active-learning" /> : 
            <Navigate to="/login" />
        } />
      </Routes>
    </>
  );
};

export default App;
```

### 7.4 API Service Layer

**File: `utils/axios.js`**

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});

// Request interceptor: Attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

**File: `services/practiceExamService.js`**

```javascript
import api from '../utils/axios';

export const startPracticeExam = async (topicOrNote, noteIds = []) => {
  const payload = { topicOrNote };
  if (Array.isArray(noteIds) && noteIds.length > 0) {
    payload.noteIds = noteIds;
  }
  const response = await api.post('/api/practice-exam/start', payload);
  return response.data;
};

export const submitPracticeExam = async (examId, userAnswers) => {
  const response = await api.post(`/api/practice-exam/submit/${examId}`, { 
    userAnswers 
  });
  return response.data;
};

export const getPracticeExam = async (examId) => {
  const response = await api.get(`/api/practice-exam/${examId}`);
  return response.data;
};

export const retakePracticeExam = async (examId) => {
  const response = await api.post(`/api/practice-exam/${examId}/retake`);
  return response.data;
};
```



---

## 8. USER FLOW & NAVIGATION {#user-flow}

### 8.1 Complete User Journey Map

```
┌─────────────────────────────────────────────────────────────────┐
│                    LANDING PAGE (/)                              │
│  - Value proposition                                             │
│  - Feature highlights                                            │
│  - CTA: Login / Register                                         │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│              AUTHENTICATION (/login, /register)                  │
│  - JWT token generation                                          │
│  - LocalStorage persistence                                      │
│  - Redirect to /app/active-learning                              │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  MAIN APPLICATION (/app/*)                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              SIDEBAR NAVIGATION                          │   │
│  │  - Notes                                                 │   │
│  │  - Active Learning (Study/Quiz)                          │   │
│  │  - Settings                                              │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
             │
             ├──────────────┬──────────────┬──────────────┐
             │              │              │              │
             ▼              ▼              ▼              ▼
      ┌──────────┐   ┌──────────┐  ┌──────────┐  ┌──────────┐
      │  NOTES   │   │  STUDY   │  │ PRACTICE │  │ SETTINGS │
      │   PAGE   │   │   PAGE   │  │   EXAM   │  │   PAGE   │
      └──────────┘   └──────────┘  └──────────┘  └──────────┘
```

### 8.2 Notes Page Flow

**Navigation Path**: `/app/notes`

**User Actions**:

1. **View Notes List**
   - Grid/list view of all notes
   - Filter by folder (subject)
   - Filter by course
   - Search by title/content
   - Sort by date/title

2. **Create New Note**
   ```
   Click "Add Note" → Modal opens
   ├─ Enter title
   ├─ Select folder (or create new)
   ├─ Select course (optional)
   └─ Save → Opens rich text editor
   ```

3. **Upload Document**
   ```
   Click "Upload" → File picker
   ├─ Select PDF/DOCX/TXT/MD
   ├─ Backend extracts text (OCR if needed)
   ├─ Preview extracted content
   └─ Save as new note
   ```

4. **Edit Note**
   ```
   Click note card → Note detail view
   ├─ View content (rendered HTML)
   ├─ Click "Edit" → TipTap editor
   ├─ Modify content
   └─ Auto-save on blur
   ```

5. **Generate Quiz from Note**
   ```
   Click "Generate Quiz" on note card
   └─ Navigate to /app/active-learning with note pre-selected
      └─ Auto-generates quiz (see Study Page Flow)
   ```

6. **Generate Practice Exam from Note**
   ```
   Click "Practice Exam" on note card
   └─ Navigate to /app/practice-exam with note pre-selected
      └─ Auto-generates 15 open-ended questions
   ```

**Code Example: Note Selection for Quiz**:

```javascript
// Notes.jsx
const handleGenerateQuiz = (note) => {
  navigate('/app/active-learning', {
    state: {
      selectedNotes: [note],
      mode: 'note-based',
      autoStart: 'notes-quick'  // Triggers auto-generation
    }
  });
};
```

### 8.3 Study Page (Quiz Mode) Flow

**Navigation Path**: `/app/active-learning`

**Two Entry Points**:

1. **Manual Entry**: User navigates directly, selects notes/topic
2. **Auto-Start**: Navigated from Notes page with pre-selected note

**Quiz Generation Flow**:

```
┌─────────────────────────────────────────────────────────────┐
│              QUIZ PREPARATION SCREEN                         │
│                                                              │
│  Mode Toggle: [Note-Based] / [Topic-Based]                  │
│                                                              │
│  IF Note-Based:                                              │
│    ├─ Search and select notes (max 3)                       │
│    └─ Click "Generate Quiz"                                 │
│                                                              │
│  IF Topic-Based:                                             │
│    ├─ Enter topic text                                      │
│    └─ Click "Generate Quiz"                                 │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼ (API Call: POST /api/ai/generate-quiz)
┌─────────────────────────────────────────────────────────────┐
│              BACKEND AI PROCESSING                           │
│  1. Receive note content or topic                           │
│  2. Send to Gemini AI with structured prompt                │
│  3. Parse response into 15 MCQ questions                    │
│  4. Return questions with hints & explanations              │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│              QUIZ IN PROGRESS                                │
│                                                              │
│  Timer: 8 minutes countdown                                 │
│  Progress: Question 1 of 15                                 │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Question: [Question text]                         │     │
│  │                                                     │     │
│  │  A) [Option A]                                     │     │
│  │  B) [Option B]                                     │     │
│  │  C) [Option C]                                     │     │
│  │  D) [Option D]                                     │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  [Select Answer Button]                                     │
└─────────────────────────────────────────────────────────────┘
```

**Two-Attempt Interaction Logic**:

```javascript
// Study.jsx - Answer submission handler
const handleAnswerSubmit = (selectedOption) => {
  const currentQ = quizQuestions[currentQuestion];
  const isCorrect = selectedOption === currentQ.correctAnswer;
  const currentAttempt = attemptCounts[currentQuestion];

  if (currentAttempt === 0) {
    // FIRST ATTEMPT
    setFirstAttemptAnswers(prev => {
      const arr = [...prev];
      arr[currentQuestion] = selectedOption;
      return arr;
    });

    if (isCorrect) {
      // Correct on first try - immediate positive feedback
      setFeedbackType('correct');
      setFeedbackMessage('Correct! Well done.');
      setShowFeedback(true);
      
      // Move to next question after 2 seconds
      setTimeout(() => {
        moveToNextQuestion();
      }, 2000);
    } else {
      // Wrong on first try - show hint, allow second attempt
      setFeedbackType('wrong');
      setFeedbackMessage('Not quite. Here\'s a hint to help you think again.');
      setHintShownAutomatically(prev => {
        const arr = [...prev];
        arr[currentQuestion] = true;
        return arr;
      });
      setShowFeedback(true);
      
      // Increment attempt count
      setAttemptCounts(prev => {
        const arr = [...prev];
        arr[currentQuestion] = 1;
        return arr;
      });
    }
  } else if (currentAttempt === 1) {
    // SECOND ATTEMPT
    if (isCorrect) {
      // Correct on second try - acknowledge but don't count for score
      setFeedbackMessage('Correct! (Second attempt - not counted in score)');
    } else {
      // Wrong on second try - show correct answer + explanation
      setFeedbackMessage(`Incorrect. The correct answer is ${currentQ.correctAnswer}.`);
    }
    
    setShowFeedback(true);
    
    // Show full explanation
    setAttemptCounts(prev => {
      const arr = [...prev];
      arr[currentQuestion] = 2;
      return arr;
    });
    
    // Move to next after 4 seconds
    setTimeout(() => {
      moveToNextQuestion();
    }, 4000);
  }
};
```

**Hint Timer System**:

```javascript
// Study.jsx - 30-second hint availability timer
useEffect(() => {
  if (quizMode === 'in_progress' && 
      !isAnswerLocked && 
      attemptCounts[currentQuestion] === 0) {
    
    // Start 30-second countdown
    setHintTimerSeconds(30);
    setIsHintTimerRunning(true);

    const timer = setInterval(() => {
      setHintTimerSeconds(prev => {
        if (prev <= 1) {
          // Timer expired - make hint available (not auto-shown)
          setHintAvailable(prevArr => {
            const next = [...prevArr];
            next[currentQuestion] = true;
            return next;
          });
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }
}, [quizMode, currentQuestion, isAnswerLocked, attemptCounts]);

// User can manually reveal hint after timer expires
const handleRevealHint = () => {
  if (hintAvailable[currentQuestion]) {
    setHintRevealedManually(prev => {
      const arr = [...prev];
      arr[currentQuestion] = true;
      return arr;
    });
  }
};
```

**Quiz Completion & Results**:

```javascript
// Study.jsx - Finalize quiz
const finalizeQuiz = () => {
  // Score based ONLY on first attempts
  const firstAnswers = firstAttemptAnswers || [];
  const score = quizQuestions.reduce((count, q, idx) => {
    return count + (firstAnswers[idx] === q.correctAnswer ? 1 : 0);
  }, 0);

  const percentage = Math.round((score / quizQuestions.length) * 100);
  const passed = percentage >= 60;

  setQuizResults({
    score,
    total: quizQuestions.length,
    percentage,
    passed
  });

  // Save to database
  saveQuizResults({
    noteId: selectedQuizNotes[0]?._id,
    noteTitle: selectedQuizNotes[0]?.title || 'Quiz',
    questions: quizQuestions.map((q, idx) => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      userAnswer: firstAnswers[idx],
      isCorrect: firstAnswers[idx] === q.correctAnswer,
      hint: q.hint,
      explanation: q.explanation
    })),
    score,
    totalQuestions: quizQuestions.length,
    percentage,
    passed,
    timeSpent: (8 * 60) - timeLeft  // seconds
  });

  setQuizMode('results');
};
```

### 8.4 Practice Exam Flow

**Navigation Path**: `/app/practice-exam`

**Complete Flow Diagram**:

```
┌─────────────────────────────────────────────────────────────┐
│         PRACTICE EXAM SETUP (/app/practice-exam)            │
│                                                              │
│  Mode: [Note-Based] / [Topic-Based]                         │
│                                                              │
│  IF Note-Based:                                              │
│    └─ Select up to 3 notes                                  │
│                                                              │
│  IF Topic-Based:                                             │
│    └─ Enter topic description                               │
│                                                              │
│  [Generate Practice Exam Button]                            │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼ (API: POST /api/practice-exam/start)
┌─────────────────────────────────────────────────────────────┐
│              BACKEND PROCESSING                              │
│  1. Receive note content or topic                           │
│  2. AI generates 15 open-ended questions                    │
│  3. Create AIGeneratedPracticeExam document                 │
│  4. Return examId and questions                             │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼ (Navigate to /app/practice-exam/questions/:examId)
┌─────────────────────────────────────────────────────────────┐
│              ANSWER QUESTIONS PAGE                           │
│                                                              │
│  Progress: Question 5 of 15 (33% complete)                  │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Question 5:                                       │     │
│  │  Explain the concept of retrieval practice and    │     │
│  │  why it is more effective than rereading.         │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Your Answer (Markdown supported):                │     │
│  │  ┌──────────────────────────────────────────────┐ │     │
│  │  │ [Large textarea for essay response]          │ │     │
│  │  │                                               │ │     │
│  │  │                                               │ │     │
│  │  └──────────────────────────────────────────────┘ │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  [Previous] [Next] [Submit Exam]                            │
│                                                              │
│  Question Navigator: [1][2][3][4][5]...[15]                 │
│  (Green = answered, Gray = unanswered)                      │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼ (Click Submit)
┌─────────────────────────────────────────────────────────────┐
│              SUBMISSION CONFIRMATION                         │
│  "You have 3 unanswered questions. Submit anyway?"          │
│  [Cancel] [Submit]                                           │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼ (API: POST /api/practice-exam/submit/:examId)
┌─────────────────────────────────────────────────────────────┐
│              AI GRADING PROCESS                              │
│  1. Send all 15 questions + answers to AI                   │
│  2. Include original note content as reference              │
│  3. AI grades each answer (0-10 scale)                      │
│  4. AI provides lecturer-style feedback per question        │
│  5. Calculate overall percentage                            │
│  6. Update exam document with results                       │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼ (Navigate to /app/practice-exam/results/:examId)
┌─────────────────────────────────────────────────────────────┐
│              RESULTS PAGE                                    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │         YOUR SCORE: 78%                            │     │
│  │    [Circular progress indicator]                   │     │
│  │                                                     │     │
│  │  Performance: Good                                 │     │
│  │  12/15 questions scored 6+ out of 10               │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │  AI FEEDBACK:                                      │     │
│  │  "Good effort! You captured most key concepts.    │     │
│  │   Focus on providing more specific examples..."    │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  DETAILED BREAKDOWN:                                         │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Q1: Define retrieval practice     [9/10]         │     │
│  │  Your Answer: [shown]                              │     │
│  │  Feedback: "Excellent definition. You captured..." │     │
│  │  Reference: "Section 2.2 of your notes..."        │     │
│  └────────────────────────────────────────────────────┘     │
│  [... 14 more questions ...]                                │
│                                                              │
│  [Create New Exam] [Back to Dashboard]                      │
└─────────────────────────────────────────────────────────────┘
```



### 8.5 Assessment Tracking & Retake Flow

**Viewing Assessment History**:

```
Notes Page → Click "View Assessments" on note card
└─ Opens AssessmentTrackerModal
   ├─ Shows all quizzes for this note
   ├─ Shows all practice exams for this note
   ├─ Displays scores, dates, performance trends
   └─ Click any result → Navigate to results page
```

**Retake Quiz Flow**:

```
Quiz Results Page → Click "Retake Quiz"
└─ API: POST /api/practice-exam/quiz-results/:quizId/retake
   ├─ Backend returns same questions with reset answers
   └─ Navigate to /app/active-learning with retake data
      └─ Quiz starts with same questions
         └─ New attempt tracked separately
            └─ Results saved with retakeOf reference
```

**Code Example: Retake Implementation**:

```javascript
// QuizResultsPage.jsx
const handleRetakeQuiz = async () => {
  try {
    const response = await api.post(
      `/api/practice-exam/quiz-results/${quizId}/retake`
    );

    if (response.data.success && response.data.quiz) {
      // Store in sessionStorage for cross-page transfer
      sessionStorage.setItem('sb_retake', JSON.stringify({
        retakeQuiz: response.data.quiz,
        mode: 'quiz'
      }));

      // Navigate to Study page
      navigate(`/app/active-learning?retake=${Date.now()}`, {
        state: {
          retakeQuiz: response.data.quiz,
          mode: 'quiz'
        }
      });
    }
  } catch (error) {
    console.error('Error retaking quiz:', error);
    toast.error('Failed to load retake quiz');
  }
};

// Study.jsx - Handle retake on mount
useEffect(() => {
  const { retakeQuiz } = location.state || {};
  let sessionRetake = null;
  
  try {
    const s = sessionStorage.getItem('sb_retake');
    if (s) {
      sessionRetake = JSON.parse(s);
      sessionStorage.removeItem('sb_retake');
    }
  } catch (e) {}

  const effectiveRetake = retakeQuiz || sessionRetake?.retakeQuiz;

  if (effectiveRetake && effectiveRetake.questions) {
    // Initialize quiz with same questions
    setQuizQuestions(effectiveRetake.questions);
    setQuizAnswers(new Array(effectiveRetake.questions.length).fill(null));
    setAttemptCounts(new Array(effectiveRetake.questions.length).fill(0));
    setCurrentQuestion(0);
    setQuizMode('in_progress');
    setTimeLeft(8 * 60);
    setIsRunning(true);
  }
}, [location]);
```

### 8.6 Navigation State Management

**React Router State Passing**:

```javascript
// From Notes.jsx to Study.jsx
navigate('/app/active-learning', {
  state: {
    selectedNotes: [noteObject],
    mode: 'note-based',
    autoStart: 'notes-quick'  // Triggers immediate generation
  }
});

// From Notes.jsx to Practice Exam
navigate('/app/practice-exam', {
  state: {
    selectedNotes: [note1, note2],
    mode: 'note-based',
    autoStart: 'notes-quick'
  }
});

// Retake with query params for reliability
navigate(`/app/active-learning?retake=${Date.now()}&retakeId=${quizId}`, {
  state: { retakeQuiz: quizData }
});
```

**State Consumption Pattern**:

```javascript
// Study.jsx
const location = useLocation();
const { selectedNotes, mode, autoStart, retakeQuiz } = location.state || {};

useEffect(() => {
  if (selectedNotes && autoStart === 'notes-quick') {
    // Auto-generate quiz from selected notes
    generateQuizFromNotesFromArray(selectedNotes);
    
    // Clear state to prevent re-triggering
    navigate(location.pathname, { replace: true, state: {} });
  }
}, [location]);
```



---

## 9. RETRIEVAL PRACTICE IMPLEMENTATION {#retrieval-practice}

### 9.1 Theoretical Alignment

**Cognitive Science Principles Implemented**:

| Principle | Implementation | Code Location |
|-----------|----------------|---------------|
| **Testing Effect** | Active recall via MCQ questions | `Study.jsx` quiz generation |
| **Productive Struggle** | Two-attempt system with hints | `handleAnswerSubmit()` |
| **Spacing Effect** | Retake functionality tracks intervals | `QuizResult.retakeOf` field |
| **Elaboration** | Open-ended practice exam questions | `generatePracticeQuestions()` |
| **Metacognition** | Progress tracking & performance analytics | `AssessmentTrackerModal` |

### 9.2 Two-Attempt System (ZPD Implementation)

**Design Rationale**: Maintains task within Zone of Proximal Development by providing graduated support.

**State Management**:

```javascript
// Study.jsx - Per-question state tracking
const [attemptCounts, setAttemptCounts] = useState([]);  // [0,0,1,2,0,...]
const [firstAttemptAnswers, setFirstAttemptAnswers] = useState([]);  // ['A',null,'C',...]
const [hintShownAutomatically, setHintShownAutomatically] = useState([]);  // [false,false,true,...]
const [hintAvailable, setHintAvailable] = useState([]);  // [false,true,false,...]
const [hintRevealedManually, setHintRevealedManually] = useState([]);  // [false,false,false,...]
```

**Attempt Flow Logic**:

```javascript
const handleAnswerSubmit = (selectedOption) => {
  const currentQ = quizQuestions[currentQuestion];
  const isCorrect = selectedOption === currentQ.correctAnswer;
  const currentAttempt = attemptCounts[currentQuestion];

  if (currentAttempt === 0) {
    // ============ FIRST ATTEMPT ============
    // Store answer for scoring (only first attempts count)
    setFirstAttemptAnswers(prev => {
      const arr = [...prev];
      arr[currentQuestion] = selectedOption;
      return arr;
    });

    if (isCorrect) {
      // ✓ Correct on first try
      setFeedbackType('correct');
      setFeedbackMessage('✓ Correct! Well done.');
      setShowFeedback(true);
      
      // Immediate progression (2s delay for feedback visibility)
      setTimeout(() => {
        moveToNextQuestion();
      }, 2000);
    } else {
      // ✗ Wrong on first try - SHOW HINT
      setFeedbackType('wrong');
      setFeedbackMessage('Not quite. Here\'s a hint to guide your thinking:');
      
      // Auto-reveal hint after wrong first attempt
      setHintShownAutomatically(prev => {
        const arr = [...prev];
        arr[currentQuestion] = true;
        return arr;
      });
      
      setShowFeedback(true);
      
      // Increment attempt counter
      setAttemptCounts(prev => {
        const arr = [...prev];
        arr[currentQuestion] = 1;
        return arr;
      });
      
      // Don't auto-advance - let student try again
    }
  } else if (currentAttempt === 1) {
    // ============ SECOND ATTEMPT ============
    if (isCorrect) {
      // ✓ Correct on second try (not counted in score)
      setFeedbackType('correct');
      setFeedbackMessage('✓ Correct! (Second attempt - not counted in final score)');
    } else {
      // ✗ Wrong on second try - SHOW ANSWER + EXPLANATION
      setFeedbackType('wrong');
      setFeedbackMessage(
        `The correct answer is ${currentQ.correctAnswer}. ${currentQ.explanation}`
      );
    }
    
    setShowFeedback(true);
    
    // Mark as fully attempted
    setAttemptCounts(prev => {
      const arr = [...prev];
      arr[currentQuestion] = 2;
      return arr;
    });
    
    // Auto-advance after 4 seconds (time to read explanation)
    setTimeout(() => {
      moveToNextQuestion();
    }, 4000);
  }
};
```

**Pedagogical Benefits**:

1. **Preserves Retrieval Difficulty**: First attempt requires genuine recall
2. **Prevents Frustration**: Hint provides scaffolding without giving answer
3. **Encourages Reflection**: Second attempt with hint promotes deeper thinking
4. **Builds Metacognition**: Students learn to recognize knowledge gaps

### 9.3 Hint System Design

**30-Second Availability Timer**:

```javascript
// Study.jsx
const HINT_AUTO_SECONDS = 30;
const [hintTimerSeconds, setHintTimerSeconds] = useState(HINT_AUTO_SECONDS);
const [isHintTimerRunning, setIsHintTimerRunning] = useState(false);

useEffect(() => {
  // Start timer when question loads (no attempts yet)
  if (quizMode === 'in_progress' && 
      !isAnswerLocked && 
      attemptCounts[currentQuestion] === 0) {
    
    // Reset timer for current question
    setHintTimerSeconds(HINT_AUTO_SECONDS);
    setIsHintTimerRunning(true);
    
    // Clear any existing hint availability
    setHintAvailable(prev => {
      const arr = [...prev];
      arr[currentQuestion] = false;
      return arr;
    });

    const timer = setInterval(() => {
      setHintTimerSeconds(prev => {
        if (prev <= 1) {
          // Timer expired - make hint available (not auto-shown)
          setIsHintTimerRunning(false);
          setHintAvailable(prevArr => {
            const next = [...prevArr];
            next[currentQuestion] = true;
            return next;
          });
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }
}, [quizMode, currentQuestion, isAnswerLocked, attemptCounts]);
```

**Hint Display Logic**:

```javascript
// Study.jsx - Render hint section
{attemptCounts[currentQuestion] >= 1 && (
  <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 
                  border border-yellow-200 dark:border-yellow-700 rounded-lg">
    <div className="flex items-start gap-2">
      <LightBulbIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
      <div>
        <h4 className="font-medium text-yellow-900 dark:text-yellow-300 mb-1">
          Hint:
        </h4>
        <p className="text-yellow-800 dark:text-yellow-200 text-sm">
          {quizQuestions[currentQuestion].hint}
        </p>
      </div>
    </div>
  </div>
)}

{/* Manual hint reveal button (after 30s, before first attempt) */}
{hintAvailable[currentQuestion] && 
 attemptCounts[currentQuestion] === 0 && 
 !hintRevealedManually[currentQuestion] && (
  <button
    onClick={handleRevealHint}
    className="mt-3 text-sm text-blue-600 hover:text-blue-700 
               dark:text-blue-400 dark:hover:text-blue-300 
               flex items-center gap-1"
  >
    <LightBulbIcon className="w-4 h-4" />
    Need a hint? Click here
  </button>
)}

{/* Show hint if manually revealed */}
{hintRevealedManually[currentQuestion] && (
  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 
                  border border-blue-200 dark:border-blue-700 rounded">
    <p className="text-sm text-blue-800 dark:text-blue-200">
      {quizQuestions[currentQuestion].hint}
    </p>
  </div>
)}
```

**Design Rationale**:
- **30-second delay**: Encourages initial retrieval attempt without hint
- **Subtle availability**: Button appears, not intrusive popup
- **Manual reveal**: Student controls when to see hint (agency)
- **Auto-reveal on wrong answer**: Ensures scaffolding when needed

### 9.4 Scoring Algorithm

**First-Attempt-Only Scoring**:

```javascript
// Study.jsx - Calculate final score
const finalizeQuiz = () => {
  const firstAnswers = firstAttemptAnswers || [];
  
  // Count correct FIRST attempts only
  const score = quizQuestions.reduce((count, question, index) => {
    const userFirstAnswer = firstAnswers[index];
    const correctAnswer = question.correctAnswer;
    return count + (userFirstAnswer === correctAnswer ? 1 : 0);
  }, 0);

  const totalQuestions = quizQuestions.length;
  const percentage = Math.round((score / totalQuestions) * 100);
  const passed = percentage >= 60;  // 60% passing threshold

  setQuizResults({
    score,
    total: totalQuestions,
    percentage,
    passed
  });

  // Save to database
  saveQuizResults({
    userId: req.user.userId,
    noteId: selectedQuizNotes[0]?._id,
    noteTitle: selectedQuizNotes[0]?.title || 'Quiz',
    questions: quizQuestions.map((q, idx) => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      userAnswer: firstAnswers[idx] || null,
      isCorrect: firstAnswers[idx] === q.correctAnswer,
      hint: q.hint,
      explanation: q.explanation
    })),
    score,
    totalQuestions,
    percentage,
    passed,
    timeSpent: (8 * 60) - timeLeft,  // seconds
    difficulty: percentage >= 80 ? 'hard' : percentage >= 60 ? 'medium' : 'easy'
  });

  setQuizMode('results');
};
```

**Rationale**: 
- Aligns with retrieval practice research: initial recall difficulty drives learning
- Second attempts with hints don't reflect genuine memory strength
- Encourages students to think carefully before answering

### 9.5 Progress Tracking & Metacognition

**Assessment History Aggregation**:

```javascript
// practiceExam.js - GET /history endpoint
router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { noteId } = req.query;

    // Fetch quiz results
    const quizResultQuery = {
      userId,
      ...(noteId && { noteId })
    };
    const quizResults = await QuizResult.find(quizResultQuery)
      .select('noteTitle createdAt score totalQuestions percentage passed')
      .sort({ createdAt: -1 })
      .lean();

    // Fetch practice exams
    let practiceExamQuery = { userId };
    if (noteId) {
      practiceExamQuery.noteIds = noteId;
    }
    const practiceExams = await AIGeneratedPracticeExam.find(practiceExamQuery)
      .select('topicOrNote createdAt submitted score')
      .sort({ createdAt: -1 })
      .lean();

    // Format and combine
    const formattedQuizzes = quizResults.map(quiz => ({
      id: quiz._id,
      type: 'quiz',
      title: quiz.noteTitle,
      date: quiz.createdAt,
      score: quiz.score,
      totalQuestions: quiz.totalQuestions,
      percentage: quiz.percentage,
      status: 'completed',
      passed: quiz.passed
    }));

    const formattedExams = practiceExams.map(exam => ({
      id: exam._id,
      type: 'practice-exam',
      title: extractTitleFromTopic(exam.topicOrNote),
      date: exam.createdAt,
      score: exam.submitted ? exam.score : null,
      status: exam.submitted ? 'completed' : 'in-progress'
    }));

    // Combine and sort by date
    const allAssessments = [...formattedQuizzes, ...formattedExams]
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      assessments: allAssessments,
      summary: {
        totalAssessments: allAssessments.length,
        completedAssessments: allAssessments.filter(a => a.status === 'completed').length,
        averageScore: calculateAverageScore(allAssessments)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching assessment history' });
  }
});
```

**Frontend Display (AssessmentTrackerModal)**:

```javascript
// AssessmentTrackerModal.jsx
const AssessmentTrackerModal = ({ isOpen, onClose, noteId }) => {
  const [assessments, setAssessments] = useState([]);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (isOpen && noteId) {
      fetchAssessmentHistory();
    }
  }, [isOpen, noteId]);

  const fetchAssessmentHistory = async () => {
    try {
      const response = await api.get(`/api/practice-exam/history?noteId=${noteId}`);
      setAssessments(response.data.assessments);
      setSummary(response.data.summary);
    } catch (error) {
      console.error('Error fetching assessment history:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Assessment History</h2>
        
        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <StatCard 
              label="Total Assessments" 
              value={summary.totalAssessments} 
            />
            <StatCard 
              label="Completed" 
              value={summary.completedAssessments} 
            />
            <StatCard 
              label="Average Score" 
              value={`${summary.averageScore}%`} 
            />
          </div>
        )}

        {/* Assessment List */}
        <div className="space-y-3">
          {assessments.map(assessment => (
            <AssessmentCard 
              key={assessment.id}
              assessment={assessment}
              onClick={() => navigateToResults(assessment)}
            />
          ))}
        </div>
      </div>
    </Modal>
  );
};
```

**Metacognitive Benefits**:
- Students see performance trends over time
- Identify weak topics requiring more study
- Track improvement through retakes
- Build accurate self-assessment skills



---

## 10. PRACTICE EXAM SYSTEM {#practice-exam-system}

### 10.1 Open-Ended Question Generation

**Pedagogical Rationale**: Open-ended questions require elaboration and synthesis, testing deeper understanding than MCQ recognition tasks.

**Question Distribution Strategy**:

```javascript
// aiService.js - generatePracticeQuestions()
const prompt = `Generate 15 practice exam questions distributed as follows:

QUESTION TYPE DISTRIBUTION:
• 3-4 basic knowledge questions (Define, List, Identify, State)
  Example: "Define retrieval practice and explain its key components."

• 3-4 understanding questions (Explain, Describe, Differentiate, Compare)
  Example: "Explain why retrieval practice is more effective than rereading."

• 3-4 application/reasoning questions (Why, How, What happens if, Apply)
  Example: "How would you apply retrieval practice to study for a history exam?"

• 2-3 higher-order questions (Compare/contrast, Evaluate, Analyze, Synthesize)
  Example: "Compare retrieval practice with elaborative rehearsal. Which is more 
           effective for long-term retention and why?"

CRITICAL: Generate questions based ONLY on the content provided below.
Do not include external topics or general knowledge.

For each question, include in parentheses which NOTE it came from: (NOTE 1), (NOTE 2), etc.

NOTES:
${topicOrNote}`;
```

**Bloom's Taxonomy Alignment**:

| Cognitive Level | Question Types | Example Verbs |
|----------------|----------------|---------------|
| **Remember** | Basic knowledge | Define, List, Identify, State |
| **Understand** | Understanding | Explain, Describe, Summarize, Classify |
| **Apply** | Application | Apply, Demonstrate, Solve, Use |
| **Analyze** | Higher-order | Analyze, Compare, Contrast, Differentiate |
| **Evaluate** | Higher-order | Evaluate, Justify, Critique, Assess |
| **Create** | Higher-order | Design, Construct, Formulate, Propose |

### 10.2 AI Grading Implementation

**Grading Prompt Engineering**:

```javascript
// aiService.js - gradePracticeExam()
const prompt = `You are an experienced university lecturer providing detailed feedback.

${noteContent ? `REFERENCE MATERIAL (grade based STRICTLY on this):\n${noteContent}\n\n` : ''}

Grade each of the ${questions.length} questions with intelligent assessment that 
recognizes partial understanding and gives proportional credit.

SCORING SCALE (0-10):
- 9-10: Complete understanding
  • Captures all key elements accurately
  • Provides specific examples or applications
  • Demonstrates synthesis of concepts
  
- 7-8: Strong understanding
  • Main concepts correct
  • Minor omissions or lack of depth
  • Generally accurate but could be more specific
  
- 5-6: Good understanding
  • Core idea correct
  • Missing important details or connections
  • Demonstrates basic grasp but incomplete
  
- 3-4: Basic understanding
  • Recognizes concept but significant gaps
  • Vague or partially incorrect
  • Shows some awareness but lacks depth
  
- 1-2: Limited understanding
  • Mostly incorrect or very vague
  • Misunderstands key concepts
  • Minimal relevant content
  
- 0: No understanding
  • Completely wrong or no answer provided

FEEDBACK STYLE (sound like a real lecturer):
• "Good grasp of the definition, but you missed the practical application aspect."
• "You identified the key term correctly, but your explanation lacks depth - try to 
   elaborate on why this matters."
• "Strong reasoning here - you explained the cause well, but didn't fully address 
   the consequences."
• "Correct concept but phrased vaguely; be more specific about the mechanisms involved."
• "Nice attempt at application, but you mixed up the sequence of events."
• "You captured the main idea, but missed some critical connections between concepts."

Return a JSON array where each object has:
{
  "question": "exact question text",
  "studentAnswer": "student's answer (or 'No answer provided')",
  "mark": number (0-10),
  "comment": "specific, encouraging feedback that sounds like a real lecturer",
  "reference": "specific concept/section from reference material that supports this grading"
}

Questions to grade:
${questions.map((q, i) => `${i + 1}. ${q}\nStudent Answer: ${userAnswers[i] || 'No answer provided'}\n`).join('\n')}`;
```

**Response Parsing with Error Handling**:

```javascript
// aiService.js - gradePracticeExam() continued
const response = await this.generateResponse(prompt);

try {
  // Extract JSON from markdown code blocks if present
  let jsonStr = response;
  const codeBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1].trim();
  } else {
    // Fallback: extract JSON array directly
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    } else {
      throw new Error('Could not find JSON array in response');
    }
  }

  // Clean up JSON (remove trailing commas before closing brackets)
  jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');

  const detailedResults = JSON.parse(jsonStr);

  // Validate structure
  if (!Array.isArray(detailedResults) || detailedResults.length === 0) {
    throw new Error('Response is not a valid array');
  }

  // Enrich results with student answers (ensure they're included)
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

  // Generate overall feedback based on average mark
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
  
  // Fallback: return basic structure with student answers
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
```

### 10.3 Results Display with Granular Feedback

**Frontend Results Rendering**:

```javascript
// PracticeExamResults.jsx
const PracticeExamResults = () => {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);

  useEffect(() => {
    fetchExamResults();
  }, [examId]);

  const fetchExamResults = async () => {
    const response = await getPracticeExam(examId);
    setExam(response.exam);
  };

  // Determine score color
  const percentageScore = exam.score;
  let scoreColorClass = 'text-yellow-500';
  if (percentageScore >= 80) {
    scoreColorClass = 'text-green-500';
  } else if (percentageScore < 60) {
    scoreColorClass = 'text-red-500';
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Score Summary Card */}
      <Card className="text-center">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            {/* Circular Score Indicator */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br 
                              from-blue-100 to-indigo-100 dark:from-blue-900/50 
                              dark:to-indigo-900/50 flex items-center justify-center 
                              border-4 border-white dark:border-gray-800 shadow-lg">
                <div className={`text-4xl font-bold ${scoreColorClass}`}>
                  {percentageScore}%
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-3 gap-6 w-full max-w-md">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {exam.detailed.filter(d => d.mark >= 6).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Strong Answers
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {exam.questions.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Questions
                </div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  percentageScore >= 80 ? 'text-green-600' : 
                  percentageScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {percentageScore >= 80 ? 'Excellent' : 
                   percentageScore >= 60 ? 'Good' : 'Needs Work'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Performance
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Overall Feedback */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
            <Target className="h-5 w-5" />
            AI Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown>{exam.feedback}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Question-by-Question Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Detailed Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {exam.detailed.map((item, index) => {
            // Determine styling based on mark
            let markColor = 'text-red-600 dark:text-red-400';
            let bgColor = 'bg-red-50 dark:bg-red-900/20';
            let borderColor = 'border-red-200 dark:border-red-800';
            let icon = <XCircle className="h-4 w-4" />;

            if (item.mark >= 9) {
              markColor = 'text-green-600 dark:text-green-400';
              bgColor = 'bg-green-50 dark:bg-green-900/20';
              borderColor = 'border-green-200 dark:border-green-800';
              icon = <CheckCircle className="h-4 w-4" />;
            } else if (item.mark >= 6) {
              markColor = 'text-yellow-600 dark:text-yellow-400';
              bgColor = 'bg-yellow-50 dark:bg-yellow-900/20';
              borderColor = 'border-yellow-200 dark:border-yellow-800';
              icon = <AlertCircle className="h-4 w-4" />;
            }

            return (
              <Card key={index} className={`${bgColor} border ${borderColor}`}>
                <CardContent className="p-6">
                  {/* Question Header */}
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-semibold flex items-center gap-2">
                      <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 
                                     dark:text-blue-200 px-2 py-1 rounded text-sm">
                        Q{index + 1}
                      </span>
                      Question {index + 1}
                    </h4>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`flex items-center gap-1 px-2 py-1 rounded-full 
                                       text-xs font-medium ${
                        item.mark >= 9 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        item.mark >= 6 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {icon}
                        {item.mark}/10
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {item.mark >= 9 ? 'Excellent' : 
                         item.mark >= 6 ? 'Good' : 
                         item.mark >= 3 ? 'Fair' : 'Needs Work'}
                      </span>
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="mb-4">
                    <p className="text-gray-700 dark:text-gray-300 font-medium">
                      {item.question}
                    </p>
                  </div>

                  {/* Student Answer */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Your Answer:
                      </span>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-md 
                                    border border-gray-200 dark:border-gray-700">
                      {item.studentAnswer ? (
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <ReactMarkdown>{item.studentAnswer}</ReactMarkdown>
                        </div>
                      ) : (
                        <em className="text-gray-400 dark:text-gray-500 italic">
                          No answer provided
                        </em>
                      )}
                    </div>
                  </div>

                  {/* AI Feedback */}
                  {item.comment && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          AI Feedback:
                        </span>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md 
                                      border border-blue-200 dark:border-blue-800">
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <ReactMarkdown>{item.comment}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Reference Material */}
                  {item.reference && item.reference !== 'N/A' && (
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                          Reference:
                        </span>
                        <div className="prose prose-xs max-w-none dark:prose-invert">
                          <ReactMarkdown>{item.reference}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};
```

### 10.4 Note-Grounded Grading

**Critical Design Feature**: AI grades based on student's actual notes, not general knowledge.

**Implementation**:

```javascript
// practiceExam.js - Submit endpoint
router.post('/submit/:examId', auth, async (req, res) => {
  try {
    const { examId } = req.params;
    const { userAnswers } = req.body;
    const userId = req.user.userId;

    const exam = await AIGeneratedPracticeExam.findOne({ _id: examId, userId });
    
    // Get original note content for grading reference
    let noteContent = null;
    if (exam.topicOrNote && exam.topicOrNote.startsWith('--- NOTE')) {
      // This is a note-based exam - use topicOrNote as reference
      noteContent = exam.topicOrNote;
    }

    // Limit noteContent length to prevent AI token limits (400K chars for large textbooks)
    if (noteContent && noteContent.length > 400000) {
      noteContent = noteContent.substring(0, 400000) + '... (content truncated for grading)';
    }

    // Grade with note content as reference
    const gradeResult = await aiService.gradePracticeExam(
      exam.questions, 
      userAnswers, 
      noteContent  // ← Critical: AI grades based on THIS content
    );

    // Update exam with results
    exam.score = gradeResult.score;
    exam.feedback = gradeResult.feedback;
    exam.detailed = gradeResult.detailed;
    exam.submitted = true;
    await exam.save();

    res.json({
      success: true,
      score: gradeResult.score,
      feedback: gradeResult.feedback,
      detailed: gradeResult.detailed
    });
  } catch (error) {
    res.status(500).json({ error: 'Error submitting practice exam' });
  }
});
```

**Pedagogical Benefit**: Ensures assessment aligns with what student actually studied, not generic textbook knowledge.



---

## 11. DEPLOYMENT & CONFIGURATION {#deployment}

### 11.1 Environment Variables

**Backend `.env` Configuration**:

```bash
# Server Configuration
NODE_ENV=production
PORT=3001

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/student-buddy?retryWrites=true&w=majority

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your_secure_random_string_here

# Frontend URLs (comma-separated for CORS)
FRONTEND_URLS=https://your-frontend-domain.vercel.app,http://localhost:5173

# Google Gemini AI API Keys (multiple for rotation)
GEMINI_API_KEY_1=your_primary_gemini_key
GEMINI_API_KEY_2=your_secondary_gemini_key
GEMINI_API_KEY_3=your_tertiary_gemini_key

# Cloudinary (for file uploads - optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Frontend `.env` Configuration**:

```bash
# Backend API URL
VITE_BACKEND_URL=https://your-backend-domain.com

# App Metadata
VITE_APP_NAME=Student Buddy
VITE_APP_SHORT_NAME=StudentBuddy
VITE_APP_DESCRIPTION=An AI-assisted retrieval practice system
```

### 11.2 MongoDB Atlas Setup

**Database Configuration**:

1. **Create Cluster**:
   - Free tier (M0) sufficient for development
   - Choose region closest to deployment

2. **Network Access**:
   - Add IP whitelist: `0.0.0.0/0` (allow all) for cloud deployment
   - Or specific IPs for production security

3. **Database User**:
   ```
   Username: student_buddy_user
   Password: [generate strong password]
   Role: readWrite on student-buddy database
   ```

4. **Connection String**:
   ```
   mongodb+srv://student_buddy_user:<password>@cluster0.xxxxx.mongodb.net/student-buddy?retryWrites=true&w=majority
   ```

**Collections Created Automatically**:
- `users`
- `notes`
- `courses`
- `quizresults`
- `aigeneratedpracticeexams`

### 11.3 Google Gemini API Setup

**Obtaining API Keys**:

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create new API key
3. Copy key to `.env` file
4. Repeat for multiple keys (recommended for rate limit handling)

**Rate Limits (Free Tier)**:
- 60 requests per minute
- 1,500 requests per day
- 1 million tokens per minute

**Key Rotation Strategy**:
```javascript
// server.js
const apiKeys = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3
].filter(key => key);

if (apiKeys.length > 0) {
  aiService.setApiKeys(apiKeys);
} else {
  console.error('WARNING: No Gemini API keys defined');
}
```

### 11.4 Backend Deployment (Render/Railway)

**Render Deployment**:

1. **Create Web Service**:
   - Connect GitHub repository
   - Root directory: `backend`
   - Build command: `npm install`
   - Start command: `npm start`

2. **Environment Variables**:
   - Add all variables from `.env`
   - Set `NODE_ENV=production`

3. **Health Check**:
   - Path: `/api/ping`
   - Expected response: `200 OK`

**Railway Deployment**:

```yaml
# railway.toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm start"
healthcheckPath = "/api/ping"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

### 11.5 Frontend Deployment (Vercel)

**Vercel Configuration**:

1. **Project Settings**:
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

2. **Environment Variables**:
   ```
   VITE_BACKEND_URL=https://your-backend.onrender.com
   ```

3. **Build Settings** (`vite.config.js`):
   ```javascript
   export default defineConfig({
     define: {
       'import.meta.env.VITE_BACKEND_URL': JSON.stringify(
         process.env.VITE_BACKEND_URL || 'http://localhost:3001'
       )
     },
     build: {
       outDir: 'dist',
       sourcemap: true,
       rollupOptions: {
         external: []
       }
     }
   });
   ```

### 11.6 Production Checklist

**Security**:
- [ ] JWT_SECRET is strong random string (32+ characters)
- [ ] MongoDB user has minimal required permissions
- [ ] CORS origins restricted to production domains
- [ ] API keys stored in environment variables (not code)
- [ ] HTTPS enabled on all endpoints

**Performance**:
- [ ] MongoDB indexes created for common queries
- [ ] Frontend code splitting enabled (React.lazy)
- [ ] Static assets cached (Vite build optimization)
- [ ] API response compression enabled (Express)

**Monitoring**:
- [ ] Error logging configured (console.error captured)
- [ ] API rate limiting implemented
- [ ] Database connection pooling configured
- [ ] Health check endpoints responding

**Testing**:
- [ ] User registration/login flow works
- [ ] Note creation and editing functional
- [ ] Quiz generation produces valid questions
- [ ] Practice exam grading returns results
- [ ] File upload and text extraction working

---

## 12. CONCLUSION

### 12.1 System Summary

Student Buddy successfully bridges the evidence-practice gap in student learning by:

1. **Automating Retrieval Practice**: Eliminates time barriers through AI-powered question generation
2. **Maintaining Pedagogical Integrity**: Two-attempt system preserves productive struggle
3. **Reducing Cognitive Load**: Integrated workflow consolidates scattered study materials
4. **Building Metacognition**: Progress tracking reveals performance patterns
5. **Ensuring Content Alignment**: Note-grounded generation tests actual study material

### 12.2 Research Contributions

This system addresses five identified research gaps:

1. **Ecological Validity**: Uses students' actual notes in naturalistic conditions
2. **Note-Grounded Effectiveness**: Validates automated generation from personal materials
3. **Quality at Scale**: Implements filtering and validation for AI-generated questions
4. **Integrated Workflow**: Demonstrates adoption benefits of consolidated functions
5. **Retention Measurement**: Tracks performance over extended periods

### 12.3 Technical Achievements

**Backend**:
- Multi-key AI rotation for reliability
- Sophisticated prompt engineering for educational tasks
- Robust file processing with OCR fallback
- Scalable MongoDB schema design

**Frontend**:
- Responsive React architecture with code splitting
- Rich text editing with TipTap
- Complex state management for quiz interactions
- Accessible UI components (Radix UI)

### 12.4 Future Enhancements

**Potential Improvements**:
- Spaced repetition scheduling algorithm
- Collaborative study groups
- Mobile native applications
- Advanced analytics dashboard
- Integration with LMS platforms (Canvas, Moodle)
- Support for mathematical notation (LaTeX)
- Diagram/image-based question generation

### 12.5 Developer Resources

**Documentation**:
- API Reference: See route files in `backend/routes/`
- Component Library: See `frontend/src/components/`
- Database Schema: See `backend/models/`

**Support**:
- GitHub Issues: [repository-url]/issues
- Developer Guide: This document
- API Postman Collection: Available on request

---

**Document Version**: 1.0  
**Last Updated**: April 2025  
**Maintained By**: Student Buddy Development Team

