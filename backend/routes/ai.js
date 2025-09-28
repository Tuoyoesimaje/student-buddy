const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const aiService = require('../services/aiService');
const Note = require('../models/Note');

// Explain text endpoint
router.post('/explain', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }

    // Use aiService to generate the explanation
    const prompt = `Explain the following text:

${text}`;
    const explanation = await aiService.generateResponse(prompt);

    res.json({ explanation });
  } catch (error) {
    console.error('Error in explain endpoint:', error);
    // Check for specific error messages
    if (error.message.includes('All Gemini keys failed')) {
      return res.status(503).json({ 
        message: 'All Gemini keys failed or hit their limit. Try again later.' 
      });
    }
    // Pass the specific error message from the AI service
    res.status(500).json({ message: error.message });
  }
});

// Summarize text endpoint
router.post('/summarize', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }

    // Use aiService to generate the summary
    const prompt = `Summarize the following text:

${text}`;
    const summary = await aiService.generateResponse(prompt);

    res.json({ summary });
  } catch (error) {
    console.error('Error in summarize endpoint:', error);
    // Check for specific error messages
    if (error.message.includes('All Gemini keys failed')) {
      return res.status(503).json({ 
        message: 'All Gemini keys failed or hit their limit. Try again later.' 
      });
    }
    // Pass the specific error message from the AI service
    res.status(500).json({ message: error.message });
  }
});

// Generate Quiz endpoint
router.post('/generate-quiz', async (req, res) => {
  try {
    const { topic } = req.body;

    // Validate input
    if (!topic) {
      return res.status(400).json({
        success: false,
        error: 'Topic is required to generate a quiz.'
      });
    }

    // Construct prompt for AI to generate quiz questions
    const prompt = `Generate 10 multiple-choice quiz questions about ${topic}. Each question should have exactly 3 multiple-choice options: A, B, and C. Provide the correct answer for each question.
Format the output clearly, with each question starting with 'Q#:', followed by the question text, then options A, B, C on separate lines, and finally 'Answer: [Correct Option Letter]'.

Example Format:
Q1: What is the capital of France?
A) London
B) Berlin
C) Paris
Answer: C

Q2: What is the main function of photosynthesis?
A) Producing oxygen
B) Converting light energy to chemical energy
C) Absorbing carbon dioxide
Answer: B

Now generate 10 questions about ${topic} in this exact format, using only options A, B, and C.`;

    console.log('Sending quiz generation prompt to AI service...');
    const rawQuizText = await aiService.generateResponse(prompt);

    // Log the raw AI response
    console.log('Raw quiz text from AI:', rawQuizText);

    // Send the raw text back to the frontend for parsing
    res.json({
      success: true,
      response: rawQuizText
    });

  } catch (error) {
    console.error('AI Quiz Generation Error:', error);

    // Handle different types of errors
    if (error.message.includes('Invalid prompt')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    if (error.message.includes('No response received') || error.message.includes('All Gemini keys failed')) {
      return res.status(503).json({
        success: false,
        error: error.message.includes('All Gemini keys failed') ? 
          'All Gemini keys failed or hit their limit. Try again later.' : 
          'AI service is currently unavailable for quiz generation.'
      });
    }

    // Default error response
    res.status(500).json({
      success: false,
      error: 'Error generating quiz. Please try again.'
    });
  }
});

// Chat endpoint with history and context
router.post('/chat', async (req, res) => {
  // Get user from auth if available
  const userId = req.user?.userId;
  try {
    let { prompt, messages = [], courses = [] } = req.body;

    // If prompt is not provided but messages array is, use the last user message as prompt
    if ((!prompt || typeof prompt !== 'string') && Array.isArray(messages) && messages.length > 0) {
      const lastUserMessage = messages
        .filter(msg => msg && msg.role === 'user' && msg.content)
        .pop();
      if (lastUserMessage) {
        prompt = String(lastUserMessage.content || '');
      }
    }

    // Validate input
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        error: 'Prompt is required' 
      });
    }

    // Get the last 5 messages for context (or all if less than 5)
    const recentMessages = Array.isArray(messages) ? messages.slice(-5) : [];
    
    // Create context from courses if available
    let courseContext = '';
    if (courses && courses.length > 0) {
      courseContext = `User's enrolled courses: ${Array.isArray(courses) ? courses.join(', ') : courses}. `;
    }

    // Format the chat history for the prompt if messages are provided
    let chatHistory = [];
    if (recentMessages.length > 0) {
      chatHistory = recentMessages
        .filter(msg => msg && msg.role && msg.content) // Filter out any invalid messages
        .map(msg => ({
          role: msg.role === 'user' ? 'User' : 'Alfred',
          content: String(msg.content || '').trim()
        }))
        .filter(msg => msg.content.length > 0);
    }

    // Create the full prompt with context and history
    let fullPrompt = `You are Alfred, a helpful AI study assistant. ${courseContext}\n\n`;
    
    // Add conversation history if available
    if (chatHistory.length > 0) {
      fullPrompt += 'Previous conversation:\n';
      chatHistory.forEach(msg => {
        fullPrompt += `${msg.role}: ${msg.content}\n`;
      });
      fullPrompt += '\n';
    }
    
    // Add the current prompt
    fullPrompt += `User: ${prompt}\nAlfred: `;

    // Generate AI response using the service
    const response = await aiService.generateResponse(fullPrompt);

    // Send successful response
    res.json({ 
      success: true, 
      response: response.trim() 
    });

  } catch (error) {
    console.error('AI Chat Error:', error);
    
    // Handle different types of errors
    if (error.message.includes('Invalid prompt')) {
      return res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }
    
    if (error.message.includes('No response received') || error.message.includes('All Gemini keys failed')) {
      return res.status(503).json({ 
        success: false, 
        error: error.message.includes('All Gemini keys failed') ? 
          'All Gemini keys failed or hit their limit. Try again later.' : 
          'AI service is currently unavailable' 
      });
    }

    // Default error response
    res.status(500).json({ 
      success: false, 
      error: 'Error processing your request' 
    });
  }
});

// Configuration endpoint - REMOVED as updateConfig is no longer part of aiService
/*
router.post('/config', (req, res) => {
  try {
    const config = req.body;
    aiService.updateConfig(config);
    res.json({ 
      success: true, 
      message: 'AI configuration updated successfully' 
    });
  } catch (error) {
    console.error('AI Config Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error updating AI configuration' 
    });
  }
});
*/

// Process notes with AI
router.post('/process-note', auth, async (req, res) => {
  try {
    const { noteId, action } = req.body;
    
    if (!noteId || !action) {
      return res.status(400).json({ 
        success: false, 
        error: 'Note ID and action are required' 
      });
    }

    // Find the original note
    const originalNote = await Note.findOne({ _id: noteId, user: req.user.userId });
    
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

    // Create a new note with the processed content
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
    // Check for specific error messages
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

module.exports = router;