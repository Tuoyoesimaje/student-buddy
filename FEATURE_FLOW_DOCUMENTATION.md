# STUDENT BUDDY - COMPREHENSIVE FEATURE FLOW DOCUMENTATION

## Overview

This document provides an in-depth analysis of how Student Buddy's core features work, from frontend user interactions to backend processing and database operations. Each feature is analyzed with complete code flow, component interactions, state management, API calls, and backend logic based on the actual implementation.

---

## TABLE OF CONTENTS

1. [AI Service Architecture](#1-ai-service-architecture)
2. [Upload Feature Flow](#2-upload-feature-flow)
3. [Quiz Generation Feature](#3-quiz-generation-feature)
4. [Practice Exam Feature](#4-practice-exam-feature)
5. [AI Chat Assistant (Alfred)](#5-ai-chat-assistant-alfred)
6. [Text Explanation Feature](#6-text-explanation-feature)
7. [Note Processing (Summarize/Explain)](#7-note-processing-feature)

---

## 1. AI SERVICE ARCHITECTURE

### 1.1 Core AI Service Implementation

**File**: `backend/services/aiService.js`

The AI service is built on Google's Gemini API with intelligent key rotation and error handling.

**Key Features**:
- Multiple API key management (up to 3 keys)
- Automatic key rotation on rate limit/quota errors
- Gemini 2.5 Flash model integration
- Robust error handling and fallback mechanisms

**Class Structure**:
```javascript
class AIService {
  constructor() {
    this.apiKeys = [];
    this.currentKeyIndex = 0;
    this.genAI = null;
    this.model = null;
    this.modelName = "gemini-2.5-flash";
  }
}
```

### 1.2 API Key Management

**Initialization Process**:

```javascript
// From server.js - API key setup
const googleApiKey1 = process.env.GEMINI_API_KEY_1 || process.env.GOOGLE_API_KEY;
const googleApiKey2 = process.env.GEMINI_API_KEY_2;
const googleApiKey3 = process.env.GEMINI_API_KEY_3;

const apiKeys = [googleApiKey1, googleApiKey2, googleApiKey3].filter(key => key);
if (apiKeys.length > 0) {
  console.log(`Setting up AI service with ${apiKeys.length} API keys`);
  aiService.setApiKeys(apiKeys);
}
```

**Key Rotation Logic**:
```javascript
rotateToNextKey() {
  if (this.apiKeys.length <= 1) {
    console.warn('No alternative API keys available for rotation.');
    return false;
  }
  
  this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
  this.initializeClient();
  console.log(`Rotated to next API key (index: ${this.currentKeyIndex})`);
  return true;
}
```

### 1.3 Core Response Generation

**Main Generation Method**:
```javascript
async generateResponse(prompt) {
  if (this.apiKeys.length === 0) {
    throw new Error('AI Service not initialized. API keys might be missing or invalid.');
  }
  
  // Try all available keys if needed
  for (let attempt = 0; attempt < this.apiKeys.length; attempt++) {
    try {
      if (!this.model) {
        this.initializeClient();
      }
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
      
    } catch (error) {
      const statusCode = error.status || error.statusCode;
      
      // Check for rate limiting or authentication errors
      if (statusCode === 403 || statusCode === 429 || statusCode === 503) {
        const rotated = this.rotateToNextKey();
        if (rotated && attempt < this.apiKeys.length - 1) {
          continue; // Try again with new key
        }
      }
      
      if (attempt === this.apiKeys.length - 1) {
        throw new Error('All Gemini keys failed or hit their limit. Try again later.');
      }
    }
  }
}
```

---

## 2. UPLOAD FEATURE FLOW

### 2.1 File Upload & Text Extraction

**Frontend Component**: `NoteModal.jsx`

**File Selection**:
```javascript
const handleFileChange = (e) => {
  const selectedFile = e.target.files[0];
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown'
  ];
  
  if (allowedTypes.includes(selectedFile.type)) {
    setFile(selectedFile);
    setContent('');
  }
};
```

**Text Extraction API Call**:
```javascript
const handleExtractText = async () => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/api/notes/upload/extract-text', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 300000 // 5 minutes for OCR
  });
  
  setExtractedText(response.data.text);
  setContent(response.data.text);
};
```

### 2.2 Note Saving

**Frontend Save Logic**:
```javascript
const handleSave = async () => {
  const noteData = {
    title: title.trim(),
    content: content.trim(),
    subject: subject.trim(),
    course: course || null
  };
  
  const response = await api.post('/api/notes', noteData);
  onNoteAdded(response.data.note);
};
```

---

## 3. QUIZ GENERATION FEATURE

### 3.1 Frontend Quiz Request

**Component**: `Study.jsx`

**Quiz Generation Trigger**:
```javascript
const generateQuiz = async () => {
  const response = await api.post('/api/ai/generate-quiz', {
    noteContent: selectedNote.content,
    questionCount: 15
  });
  
  setQuestions(response.data.questions);
  setUserAnswers(Array(response.data.questions.length).fill(null));
  setQuizStarted(true);
};
```

### 3.2 Backend Quiz Generation

**Route**: `POST /api/ai/generate-quiz`
**File**: `backend/routes/ai.js`

**Implementation**:

```javascript
router.post('/generate-quiz', async (req, res) => {
  try {
    const { topic } = req.body;
    
    if (!topic) {
      return res.status(400).json({
        success: false,
        error: 'Topic is required to generate a quiz.'
      });
    }

    // Construct detailed prompt for AI
    const prompt = `Generate 15 multiple-choice quiz questions about ${topic}. 
Each question should have exactly 4 options: A, B, C, and D.

For each question generate:
1. A concise hint (8-20 words) that guides thinking without revealing the answer
2. A detailed explanation (2-4 sentences) explaining why the correct answer is right

Format:
Q1: [Question text]
A) [option A]
B) [option B]
C) [option C]
D) [option D]
Hint: [subtle hint avoiding answer keywords]
Explanation: [detailed explanation with reasoning]
Answer: [A/B/C/D]

Answers should be randomly distributed among A, B, C, and D.`;

    const rawQuizText = await aiService.generateResponse(prompt);
    
    res.json({
      success: true,
      response: rawQuizText
    });

  } catch (error) {
    console.error('AI Quiz Generation Error:', error);
    
    if (error.message.includes('All Gemini keys failed')) {
      return res.status(503).json({
        success: false,
        error: 'All Gemini keys failed or hit their limit. Try again later.'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Error generating quiz. Please try again.'
    });
  }
});
```

**Frontend Parsing**:
The frontend receives the raw text and parses it into structured question objects with regex patterns.

---

## 4. PRACTICE EXAM FEATURE

### 4.1 Practice Question Generation

**AI Service Method**: `generatePracticeQuestions()`
**File**: `backend/services/aiService.js`

**Implementation**:
```javascript
async generatePracticeQuestions(topicOrNote, isNoteBased = true) {
  let prompt;
  
  if (isNoteBased) {
    prompt = `You are an experienced university lecturer creating practice exam questions.
Generate exactly 15 practice exam questions based ONLY on the provided notes content.

CRITICAL: Generate questions based ONLY on the content provided. Do not include 
external topics or information not explicitly covered in the notes.

Create a balanced mix:
• 3-4 basic knowledge questions (Define, List, Identify, State)
• 3-4 understanding questions (Explain, Describe, Differentiate, Compare)
• 3-4 application/reasoning questions (Why, How, What happens if, Apply concepts)
• 2-3 higher-order questions (Compare/contrast, Evaluate, Analyze relationships)

For each question, include (NOTE X) tag indicating source.

Format as numbered list:
1. [Basic knowledge question] (NOTE 1)
2. [Understanding question] (NOTE 1)
etc.

Notes:
${topicOrNote}`;
  } else {
    prompt = `Generate exactly 15 practice exam questions for: "${topicOrNote}"
    
Create balanced mix progressing from basic to complex thinking.
Format as numbered list with clear, precise academic language.`;
  }

  const response = await this.generateResponse(prompt);
  
  // Parse response to extract questions
  const questionRegex = /^\d+\.\s*(.+?)(?:\s*\(NOTE\s*\d+\))?\s*$/gm;
  const questions = [];
  let match;
  
  while ((match = questionRegex.exec(response)) !== null) {
    questions.push(match[1].trim());
  }
  
  return questions;
}
```

### 4.2 Practice Exam Grading

**AI Service Method**: `gradePracticeExam()`

**Implementation**:
```javascript
async gradePracticeExam(questions, userAnswers, noteContent = null) {
  let prompt = `You are an experienced university lecturer providing detailed feedback.

${noteContent ? `REFERENCE MATERIAL (grade based STRICTLY on this):\n${noteContent}\n\n` : ''}

Grade each of the ${questions.length} questions with intelligent assessment 
that recognizes partial understanding.

SCORING SCALE (0-10):
- 9-10: Complete understanding - all key elements accurate
- 7-8: Strong understanding - main concepts correct, minor omissions
- 5-6: Good understanding - correct core idea, missing details
- 3-4: Basic understanding - recognizes concept with significant gaps
- 1-2: Limited understanding - vague or mostly incorrect
- 0: No understanding or completely wrong

COMMENTS should sound like real lecturer feedback:
• "Good grasp of definition, but missed practical application"
• "Strong reasoning, but didn't fully address consequences"
• "Correct concept but phrased vaguely; be more specific"

Return JSON array:
{
  "question": "exact question text",
  "studentAnswer": "student's answer",
  "mark": number (0-10),
  "comment": "specific encouraging feedback",
  "reference": "concept/section from reference material"
}

Questions to grade:\n`;

  questions.forEach((q, i) => {
    prompt += `${i + 1}. ${q}\n`;
    prompt += `Student Answer: ${userAnswers[i] || 'No answer provided'}\n\n`;
  });

  const response = await this.generateResponse(prompt);
  
  try {
    // Extract JSON from response (handles markdown code blocks)
    let jsonStr = response;
    const codeBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim();
    } else {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) jsonStr = jsonMatch[0];
    }
    
    // Clean up JSON (remove trailing commas)
    jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');
    
    const detailedResults = JSON.parse(jsonStr);
    
    // Enrich with student answers
    const enrichedResults = detailedResults.map((result, index) => ({
      question: result.question || questions[index],
      studentAnswer: userAnswers[index] || 'No answer provided',
      mark: result.mark || 0,
      comment: result.comment || 'No feedback available',
      reference: result.reference || 'N/A'
    }));
    
    // Calculate scores
    const totalScore = enrichedResults.reduce((sum, item) => sum + item.mark, 0);
    const maxScore = questions.length * 10;
    const percentageScore = Math.round((totalScore / maxScore) * 100);
    
    // Generate overall feedback
    const averageMark = totalScore / enrichedResults.length;
    let feedback = '';
    if (averageMark >= 8) {
      feedback = 'Excellent work! Strong understanding of the material.';
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
      feedback: 'Error processing grades.',
      detailed: fallbackResults
    };
  }
}
```

### 4.3 Practice Exam Routes

**File**: `backend/routes/practiceExam.js`

**Start Exam**:
```javascript
router.post('/start', auth, async (req, res) => {
  const { topicOrNote, noteIds = [], isNoteBased = true } = req.body;
  
  // Generate questions
  const questions = await aiService.generatePracticeQuestions(
    topicOrNote, 
    isNoteBased
  );
  
  // Create exam document
  const practiceExam = new AIGeneratedPracticeExam({
    userId: req.user.userId,
    topicOrNote,
    noteIds,
    questions,
    userAnswers: Array(questions.length).fill(''),
    submitted: false
  });
  
  await practiceExam.save();
  res.status(201).json({ success: true, exam: practiceExam });
});
```

**Submit Exam**:
```javascript
router.post('/submit/:examId', auth, async (req, res) => {
  const { examId } = req.params;
  const { userAnswers } = req.body;
  
  const exam = await AIGeneratedPracticeExam.findOne({
    _id: examId,
    userId: req.user.userId
  });
  
  if (exam.submitted) {
    return res.status(400).json({ error: 'Exam already submitted' });
  }
  
  // Grade with AI
  const gradingResult = await aiService.gradePracticeExam(
    exam.questions,
    userAnswers,
    exam.topicOrNote
  );
  
  // Update exam
  exam.userAnswers = userAnswers;
  exam.score = gradingResult.score;
  exam.feedback = gradingResult.feedback;
  exam.detailed = gradingResult.detailed;
  exam.submitted = true;
  
  await exam.save();
  
  res.json({
    success: true,
    score: gradingResult.score,
    feedback: gradingResult.feedback,
    detailed: gradingResult.detailed
  });
});
```

---

## 5. AI CHAT ASSISTANT (ALFRED)

### 5.1 Chat Endpoint

**Route**: `POST /api/ai/chat`
**File**: `backend/routes/ai.js`

**Implementation**:

```javascript
router.post('/chat', async (req, res) => {
  const userId = req.user?.userId;
  
  try {
    let { prompt, messages = [], courses = [] } = req.body;
    
    // Extract prompt from messages if not provided directly
    if (!prompt && messages.length > 0) {
      const lastUserMessage = messages
        .filter(msg => msg.role === 'user' && msg.content)
        .pop();
      if (lastUserMessage) {
        prompt = String(lastUserMessage.content);
      }
    }
    
    if (!prompt || prompt.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        error: 'Prompt is required' 
      });
    }
    
    // Get last 5 messages for context
    const recentMessages = messages.slice(-5);
    
    // Create course context
    let courseContext = '';
    if (courses && courses.length > 0) {
      courseContext = `User's enrolled courses: ${courses.join(', ')}. `;
    }
    
    // Format chat history
    let chatHistory = [];
    if (recentMessages.length > 0) {
      chatHistory = recentMessages
        .filter(msg => msg.role && msg.content)
        .map(msg => ({
          role: msg.role === 'user' ? 'User' : 'Alfred',
          content: String(msg.content).trim()
        }))
        .filter(msg => msg.content.length > 0);
    }
    
    // Build full prompt with context
    let fullPrompt = `You are Alfred, a helpful AI study assistant. ${courseContext}\n\n`;
    
    if (chatHistory.length > 0) {
      fullPrompt += 'Previous conversation:\n';
      chatHistory.forEach(msg => {
        fullPrompt += `${msg.role}: ${msg.content}\n`;
      });
      fullPrompt += '\n';
    }
    
    fullPrompt += `User: ${prompt}\nAlfred: `;
    
    // Generate response
    const response = await aiService.generateResponse(fullPrompt);
    
    res.json({ 
      success: true, 
      response: response.trim() 
    });
    
  } catch (error) {
    console.error('AI Chat Error:', error);
    
    if (error.message.includes('All Gemini keys failed')) {
      return res.status(503).json({ 
        success: false, 
        error: 'All Gemini keys failed or hit their limit. Try again later.' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Error processing your request' 
    });
  }
});
```

**Key Features**:
- Maintains conversation history (last 5 messages)
- Includes user's enrolled courses as context
- Handles both direct prompts and message arrays
- Graceful error handling with key rotation

---

## 6. TEXT EXPLANATION FEATURE

### 6.1 Explain Endpoint

**Route**: `POST /api/ai/explain`
**File**: `backend/routes/ai.js`

**Implementation**:
```javascript
router.post('/explain', auth, async (req, res) => {
  try {
    const { text, noteContent } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }
    
    // Hint prompt - active learning approach
    const hintPrompt = `You are a skilled tutor creating an active learning hint.
Student highlighted: "${text}"

${noteContent ? `Context: ${noteContent}` : ''}

Create a brief hint (2-3 sentences max) that actively pushes the student to think 
deeply WITHOUT giving away the answer. Choose the most effective approach:

- Ask a Socratic question probing their understanding
- Suggest a connection to something they know
- Provide a thought-provoking analogy
- Pose a "what if" scenario
- Challenge a common misconception
- Ask them to consider implications

Make it conversational. Start with "Think about this...", "Consider...", 
"Have you ever wondered...", "What if...". Spark curiosity, don't explain.`;

    // Full explanation prompt - conversational tutoring
    const fullPrompt = `You are a friendly tutor explaining: "${text}"

${noteContent ? `Context: ${noteContent}` : ''}

Structure like a natural conversation:
1. Clear, relatable explanation
2. Break down key components in simple terms
3. Real-world example they can relate to
4. Explain why this matters in bigger picture
5. End with thought-provoking question

Use conversational language: "Think of it this way...", "Here's what makes this 
interesting...", "The key insight is...". Make it feel like one-on-one tutoring.

IMPORTANT: Keep concise but comprehensive - 100-300 words total.`;

    // Generate both responses in parallel
    const [hint, fullExplanation] = await Promise.all([
      aiService.generateResponse(hintPrompt),
      aiService.generateResponse(fullPrompt)
    ]);
    
    res.json({
      hint: hint.trim(),
      fullExplanation: fullExplanation.trim()
    });
    
  } catch (error) {
    console.error('Error in explain endpoint:', error);
    
    if (error.message.includes('All Gemini keys failed')) {
      return res.status(503).json({
        message: 'All Gemini keys failed or hit their limit. Try again later.'
      });
    }
    
    res.status(500).json({ message: error.message });
  }
});
```

**Key Features**:
- Generates both hint and full explanation simultaneously
- Hint uses Socratic method to encourage active thinking
- Full explanation is conversational and limited to 300 words
- Includes note context for better relevance

---

## 7. NOTE PROCESSING FEATURE

### 7.1 Summarize Note

**AI Service Method**: `summarizeNote()`
**File**: `backend/services/aiService.js`

**Implementation**:
```javascript
async summarizeNote(noteContent) {
  const prompt = `Rewrite this note as if you're an A-grade student preparing for exams.
Keep ALL important concepts and definitions, but make it concise and clear.

Remove unnecessary details and repetition. Organize with clear headings.
Use simple language. Focus on what I need to know for exams.

Make it shorter but complete - like quality student study notes, not a summary.

Note content:
${noteContent}`;

  return await this.generateResponse(prompt);
}
```

### 7.2 Explain Note

**AI Service Method**: `explainNote()`

**Implementation**:
```javascript
async explainNote(noteContent) {
  const prompt = `Explain and expand upon the following notes in a detailed, 
educational way, as if you're tutoring a student new to this topic.

For each main concept:
- Provide thorough explanation building on original content
- Add relevant details and connections not in original notes
- Explain why this concept is important and how it fits bigger picture
- Include practical applications and implications
- Use clear, step-by-step explanations where appropriate
- Include relevant background information
- Make connections between related concepts

Goal: Create more comprehensive and understandable version that goes beyond 
original notes. Write in clear, educational style that helps students understand 
and remember.

Original content:
${noteContent}`;
  
  return await this.generateResponse(prompt);
}
```

### 7.3 Process Note Endpoint

**Route**: `POST /api/ai/process-note`
**File**: `backend/routes/ai.js`

**Implementation**:
```javascript
router.post('/process-note', auth, async (req, res) => {
  try {
    const { noteId, action } = req.body;
    
    if (!noteId || !action) {
      return res.status(400).json({ 
        success: false, 
        error: 'Note ID and action are required' 
      });
    }
    
    // Find original note
    const originalNote = await Note.findOne({ 
      _id: noteId, 
      user: req.user.userId 
    });
    
    if (!originalNote) {
      return res.status(404).json({ 
        success: false, 
        error: 'Note not found' 
      });
    }
    
    let processedContent = '';
    let titleSuffix = '';
    
    // Process based on action
    if (action === 'summarize') {
      processedContent = await aiService.summarizeNote(originalNote.content);
      titleSuffix = ' (AI Summary)';
    } else if (action === 'explain') {
      processedContent = await aiService.explainNote(originalNote.content);
      titleSuffix = ' (AI Explanation)';
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid action. Use "summarize" or "explain"'
      });
    }
    
    // Create new note with processed content
    const newNote = new Note({
      title: `${originalNote.title}${titleSuffix}`,
      content: processedContent,
      user: req.user.userId,
      tags: [...(originalNote.tags || []), 'ai-generated']
    });
    
    await newNote.save();
    
    res.json({ 
      success: true, 
      note: newNote 
    });
    
  } catch (error) {
    console.error('Error processing note with AI:', error);
    
    if (error.message.includes('All Gemini keys failed')) {
      return res.status(503).json({ 
        success: false,
        error: 'All Gemini keys failed or hit their limit. Try again later.'
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Error processing note with AI',
      details: error.message 
    });
  }
});
```

**Key Features**:
- Creates new note with processed content
- Preserves original note unchanged
- Adds descriptive suffix to title
- Tags processed notes as 'ai-generated'

---

## 8. SUMMARIZE TEXT ENDPOINT

### 8.1 Implementation

**Route**: `POST /api/ai/summarize`
**File**: `backend/routes/ai.js`

```javascript
router.post('/summarize', auth, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }
    
    const prompt = `Summarize the following text:

${text}`;
    
    const summary = await aiService.generateResponse(prompt);
    
    res.json({ summary });
    
  } catch (error) {
    console.error('Error in summarize endpoint:', error);
    
    if (error.message.includes('All Gemini keys failed')) {
      return res.status(503).json({
        message: 'All Gemini keys failed or hit their limit. Try again later.'
      });
    }
    
    res.status(500).json({ message: error.message });
  }
});
```

---

## 9. ERROR HANDLING PATTERNS

### 9.1 Common Error Responses

**Rate Limit Errors** (429, 503):
```javascript
if (error.message.includes('All Gemini keys failed')) {
  return res.status(503).json({
    success: false,
    error: 'All Gemini keys failed or hit their limit. Try again later.'
  });
}
```

**Authentication Errors** (403):
- Automatically triggers key rotation
- Retries with next available key
- Returns error only after all keys exhausted

**Validation Errors** (400):
```javascript
if (!requiredField) {
  return res.status(400).json({
    success: false,
    error: 'Required field is missing'
  });
}
```

### 9.2 Key Rotation Strategy

1. **Initial Request**: Uses `currentKeyIndex` (starts at 0)
2. **Error Detection**: Checks for status codes 403, 429, 503
3. **Rotation**: Increments index, wraps around using modulo
4. **Retry**: Attempts request with new key
5. **Exhaustion**: After trying all keys, returns error to client

---

## 10. CONFIGURATION & INITIALIZATION

### 10.1 Server Startup

**File**: `backend/server.js`

```javascript
// Load API keys from environment
const googleApiKey1 = process.env.GEMINI_API_KEY_1 || process.env.GOOGLE_API_KEY;
const googleApiKey2 = process.env.GEMINI_API_KEY_2;
const googleApiKey3 = process.env.GEMINI_API_KEY_3;

// Filter out undefined keys
const apiKeys = [googleApiKey1, googleApiKey2, googleApiKey3].filter(key => key);

// Initialize AI service
if (apiKeys.length > 0) {
  console.log(`Setting up AI service with ${apiKeys.length} API keys`);
  aiService.setApiKeys(apiKeys);
} else {
  console.error('WARNING: No Gemini API keys defined. AI features will not work.');
}
```

### 10.2 Route Mounting

```javascript
app.use('/api/ai', aiRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/practice-exam', practiceExamRoutes);
app.use('/api/users', userRoutes);
```

### 10.3 CORS Configuration

```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3001',
  'https://main-student-buddy.vercel.app'
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
```

---

## 11. BEST PRACTICES & PATTERNS

### 11.1 Prompt Engineering

**Effective Patterns**:
1. **Clear Role Definition**: "You are an experienced university lecturer..."
2. **Explicit Constraints**: "Generate EXACTLY 15 questions", "Keep to 100-300 words"
3. **Format Specification**: Provide exact output format with examples
4. **Context Inclusion**: Pass relevant note content or conversation history
5. **Tone Guidance**: "Sound like a real lecturer", "Be conversational and encouraging"

### 11.2 Response Parsing

**Robust Parsing Strategy**:
1. Try extracting from markdown code blocks first
2. Fall back to regex pattern matching
3. Clean JSON (remove trailing commas)
4. Validate structure before use
5. Provide fallback data on parse failure

### 11.3 Performance Optimization

**Parallel Requests**:
```javascript
// Generate hint and explanation simultaneously
const [hint, fullExplanation] = await Promise.all([
  aiService.generateResponse(hintPrompt),
  aiService.generateResponse(fullPrompt)
]);
```

**Timeout Configuration**:
```javascript
// Long timeout for OCR operations
timeout: 300000 // 5 minutes
```

---

## 12. SUMMARY

The Student Buddy AI integration leverages Google's Gemini 2.5 Flash model with:

- **Multi-key rotation** for high availability
- **Intelligent error handling** with automatic fallback
- **Diverse AI features**: quiz generation, practice exams, chat, explanations
- **Robust parsing** with fallback mechanisms
- **Context-aware prompting** for better responses
- **Parallel processing** for improved performance

All AI features are accessible through RESTful API endpoints with consistent error handling and authentication middleware.

---

*Documentation generated based on actual implementation in backend/routes/ai.js, backend/services/aiService.js, and backend/server.js*
