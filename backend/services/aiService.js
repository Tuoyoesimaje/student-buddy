const { GoogleGenerativeAI } = require("@google/generative-ai");

class AIService {
  constructor() {
    this.apiKeys = [];
    this.currentKeyIndex = 0;
    this.genAI = null;
    this.model = null; 
    // Default model - can be overridden if needed
    this.modelName = "gemini-2.5-flash"; 
  }

  setApiKey(key) {
    // For backward compatibility, set the first key
    if (key) {
      this.apiKeys = [key];
      this.initializeClient();
    } else {
      console.warn('AIService API Key set to null or undefined. Google AI Client not initialized.');
      this.apiKeys = [];
      this.genAI = null;
      this.model = null;
    }
  }

  setApiKeys(keys) {
    if (Array.isArray(keys) && keys.length > 0) {
      this.apiKeys = keys.filter(key => key && typeof key === 'string');
      this.currentKeyIndex = 0;
      this.initializeClient();
    } else {
      console.warn('Invalid API keys array provided. Google AI Client not initialized.');
      this.apiKeys = [];
      this.genAI = null;
      this.model = null;
    }
  }

  initializeClient() {
    if (this.apiKeys.length === 0) {
      console.warn('No API keys available. Google AI Client not initialized.');
      this.genAI = null;
      this.model = null;
      return;
    }

    try {
      const currentKey = this.apiKeys[this.currentKeyIndex];
      this.genAI = new GoogleGenerativeAI(currentKey);
      this.model = this.genAI.getGenerativeModel({ model: this.modelName });
      console.log(`AIService API Key set and Google AI Client initialized for model: ${this.modelName} (masked key): ***${currentKey.slice(-4)}`);
    } catch (error) {
      console.error('Failed to initialize GoogleGenerativeAI with API key:', error);
      this.genAI = null;
      this.model = null;
    }
  }

  rotateToNextKey() {
    if (this.apiKeys.length <= 1) {
      console.warn('No alternative API keys available for rotation.');
      return false;
    }

    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
    this.initializeClient();
    console.log(`Rotated to next API key (index: ${this.currentKeyIndex}, masked key: ***${this.apiKeys[this.currentKeyIndex].slice(-4)})`);
    return true;
  }

  async generateResponse(prompt) {
    if (this.apiKeys.length === 0) {
      throw new Error('AI Service not initialized. API keys might be missing or invalid.');
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

        console.log(`Sending prompt to Gemini (${this.modelName}) with key index ${this.currentKeyIndex}: "${prompt.substring(0, 100)}..."`);
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        console.log(`Received response from Gemini (${this.modelName}): "${text.substring(0,100)}..."`);
        return text;

      } catch (error) {
        console.error(`Error generating response from Google AI (key index ${this.currentKeyIndex}):`, error);
        
        // Check if error is related to rate limiting or authentication
        const errorMessage = error.message || '';
        const statusCode = error.status || error.statusCode || (error.response && error.response.status);
        
        // If error is related to rate limiting (429), authentication (403), or service unavailable (503)
        if (statusCode === 403 || statusCode === 429 || statusCode === 503 || 
            errorMessage.includes('quota') || errorMessage.includes('rate limit') || 
            errorMessage.includes('authentication') || errorMessage.includes('unauthorized')) {
          
          // Try rotating to the next key
          const rotated = this.rotateToNextKey();
          if (rotated && attempt < this.apiKeys.length - 1) {
            console.log(`Retrying with next API key (index: ${this.currentKeyIndex})`);
            continue; // Try again with the new key
          }
        }
        
        // If we've tried all keys or it's not a rate limit/auth error, throw the error
        if (attempt === this.apiKeys.length - 1) {
          throw new Error('All Gemini keys failed or hit their limit. Try again later.');
        } else {
          throw error; // Throw the original error for other types of errors
        }
      }
    }

    // This should never be reached due to the error handling above
    throw new Error('Failed to generate response after trying all available API keys.');
  }

  async summarizeNote(noteContent) {
    const prompt = `Please summarize the following notes in a concise, easy-to-remember format. 
    Focus on key points and main ideas. Make it suitable for quick review before exams.\n\n${noteContent}`;
    
    return await this.generateResponse(prompt);
  }

  async explainNote(noteContent) {
    const prompt = `Explain and expand upon the following notes in a detailed, educational way, as if you're teaching a student who's new to this topic.
    
    For each main concept:
       - Provide a thorough explanation that builds on the original content
       - Add relevant details and connections that weren't in the original notes
       - Explain why this concept is important and how it fits into the bigger picture
       - Include practical applications and implications
       - Use clear, step-by-step explanations where appropriate
       - Include relevant background information that helps understand the concepts better
       - Make connections between related concepts
    
    The goal is to create a more comprehensive and understandable version of the content that goes beyond the original notes.
    Write in a clear, educational style that helps students understand and remember the material.
    
    Original content:\n\n${noteContent}`;
    
    return await this.generateResponse(prompt);
  }
  async generateNotes(topic, level = 'intermediate', context = '') {
    console.log(`Generating notes for topic: ${topic}, level: ${level}`);

    const prompt = `Generate comprehensive study notes for the following topic.

Topic: ${topic}
Level: ${level}
${context ? `Additional Context:\n${context}` : ''}

Please create detailed, well-structured study notes that include:
1. **Key Concepts**: Main ideas and definitions
2. **Detailed Explanations**: Clear explanations of each concept
3. **Examples**: Practical examples where applicable
4. **Important Points**: Key takeaways and formulas if relevant
5. **Summary**: Concise overview at the end

Format the notes in a clean, readable structure with headings and bullet points. Make it suitable for studying, detailed, long if possible and easy to understand.`;

    const result = await this.generateResponse(prompt);
    console.log(`Notes generated successfully for topic: ${topic}`);
    return result;
  }

  async generatePracticeQuestions(topicOrNote) {
    const prompt = `Generate 15 practice exam questions from the following topic or notes.
Do NOT include answers. Format the output as a numbered list only.

Topic/Notes:
${topicOrNote}`;

    const response = await this.generateResponse(prompt);
    
    // Parse the response to extract questions as an array
    const questions = response
      .split(/\d+\.\s+/) // Split by numbered list format (e.g., "1. ", "2. ")
      .filter(q => q.trim().length > 0) // Remove empty entries
      .map(q => q.trim()); // Trim whitespace
    
    return questions;
  }

  async gradePracticeExam(questions, userAnswers) {
    // Construct the prompt for grading
    let prompt = `You are an expert exam grader.

Below are 15 questions and the user's 15 answers.
Score each answer (0 or 1). Then return:
- Total score out of 15
- Short feedback summary of user performance
- Optional breakdown of each question, user answer, and mark

Format the output as:
{
  score: 12,
  feedback: "You did well on most concepts. Improve on Q5, Q7, Q13.",
  detailed: [
    { q: "What is a binary tree?", a: "User answer here", mark: 1 },
    ...
  ]
}

Questions:\n`;

    // Add questions to prompt
    questions.forEach((q, i) => {
      prompt += `${i + 1}. ${q}\n`;
    });

    // Add answers to prompt
    prompt += `\nAnswers:\n`;
    userAnswers.forEach((a, i) => {
      prompt += `${i + 1}. ${a}\n`;
    });

    // Get AI response
    const response = await this.generateResponse(prompt);
    
    try {
      // Try to parse the response as JSON
      // First, find the JSON object in the response (in case there's text before or after)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not find JSON in response');
      }
      
      const jsonStr = jsonMatch[0];
      const result = JSON.parse(jsonStr);
      
      // Validate the result has the expected structure
      if (!result.score || !result.feedback || !Array.isArray(result.detailed)) {
        throw new Error('Response missing required fields');
      }
      
      return result;
    } catch (error) {
      console.error('Error parsing grade response:', error);
      // Fallback: return a basic structure with the raw response
      return {
        score: 0,
        feedback: 'Error processing grades. Please try again.',
        detailed: [],
        rawResponse: response
      };
    }
  }

  // updateConfig method removed as it was specific to the old setup.
  // If model parameters (temperature, topP, etc.) need to be configurable for Gemini,
  // a new method can be added here to set generationConfig for the model.

  getChatModel({ functionDeclarations, modelName = 'gemini-2.5-flash', functionCallingMode = 'AUTO' } = {}) {
    if (!this.genAI) {
      throw new Error('AI Service not initialized. API key might be missing or invalid.');
    }
    // Use 2.5 Flash (free tier) for function calling capability
        const tools = [{ functionDeclarations }];

    // Encourage the model to use any available function when appropriate
    const toolConfig = {
      functionCallingConfig: {
        mode: functionCallingMode
        // allowedFunctionNames: functionDeclarations.map(fd => fd.name) // optional fine-grained control
      },
    };

    return this.genAI.getGenerativeModel({
      model: modelName,
      tools,
      toolConfig,
    });
  }
}

module.exports = new AIService();