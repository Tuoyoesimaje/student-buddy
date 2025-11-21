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
    const prompt = `Rewrite this note as if you're an A-grade student preparing for exams. Keep ALL important concepts and definitions, but make it concise and clear. Remove unnecessary details and repetition. Organize with clear headings. Use simple language. Focus on what I need to know for exams. Make it shorter but complete - like quality student study notes, not a summary.

Note content:
${noteContent}`;

    return await this.generateResponse(prompt);
  }

  async explainNote(noteContent) {
    const prompt = `Explain and expand upon the following notes in a detailed, educational way, as if you're tutoring a student who's new to this topic.
    
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

  async generatePracticeQuestions(topicOrNote, isNoteBased = true) {
    let prompt;
    if (isNoteBased) {
      prompt = `You are an experienced university lecturer creating practice exam questions. You will be given study notes content. Generate exactly 15 practice exam questions in total, distributing them across the provided notes fairly so each note is represented proportionally to its content length and importance.

CRITICAL: Generate questions based ONLY on the content provided in the notes. Do not include external topics, concepts, or information not explicitly covered in the given notes.

Create a balanced mix of question types that mirrors real exam variety:

• 3-4 basic knowledge questions (Define, List, Identify, State)
• 3-4 understanding questions (Explain, Describe, Differentiate, Compare basic concepts)
• 3-4 application/reasoning questions (Why, How, What happens if, Apply concepts to scenarios)
• 2-3 higher-order/scenario questions (Compare/contrast in depth, Evaluate, Give examples that demonstrate, Analyze relationships)

For each question, include in parentheses a short source tag indicating which NOTE it came from (for example: (NOTE 1)).

Format the output as a numbered list, one question per line:

1. [Basic knowledge question] (NOTE 1)
2. [Understanding question] (NOTE 1)
3. [Application question] (NOTE 2)
etc.

Ensure questions:
- Progress from foundational concepts to more complex analysis
- Test different aspects of the same concept across question types but always based strictly on the provided notes
- Use clear, precise academic language
- Focus strictly on note content - never add outside information or concepts not explicitly covered
- When multiple notes are given, distribute questions across notes fairly based on content depth

Notes:
${topicOrNote}`;
    } else {
      prompt = `You are an experienced university lecturer creating practice exam questions for the topic: "${topicOrNote}". Generate exactly 15 practice exam questions that progress from basic to complex thinking.

Create a balanced mix of question types that mirrors real exam variety:

• 3-4 basic knowledge questions (Define, List, Identify, State)
• 3-4 understanding questions (Explain, Describe, Differentiate, Compare basic concepts)
• 3-4 application/reasoning questions (Why, How, What happens if, Apply concepts to scenarios)
• 2-3 higher-order/scenario questions (Compare/contrast in depth, Evaluate, Give examples that demonstrate, Analyze relationships)

Format the output as a numbered list, one question per line:

1. [Basic knowledge question]
2. [Understanding question]
3. [Application question]
etc.

Ensure questions:
- Progress from foundational concepts to more complex analysis
- Test different aspects of the same concept across question types
- Use clear, precise academic language appropriate for university-level assessment
- Cover different aspects of the topic comprehensively
- Build in complexity throughout the question set`;
    }

    const response = await this.generateResponse(prompt);

    // Parse the response to extract questions as an array
    // Handle both formats: with source tags (NOTE 1) and without
    const questionRegex = /^\d+\.\s*(.+?)(?:\s*\(NOTE\s*\d+\))?\s*$/gm;
    const questions = [];
    let match;
    while ((match = questionRegex.exec(response)) !== null) {
      // Extract just the question text, removing source tags if present
      const questionText = match[1].trim();
      questions.push(questionText);
    }

    return questions;
  }

  async gradePracticeExam(questions, userAnswers, noteContent = null) {
    // Construct the prompt for grading based on note content
    let prompt = `You are an experienced university lecturer providing detailed, constructive feedback on student exam answers.

${noteContent ? `REFERENCE MATERIAL (grade answers based on the CONCEPTS in this content, not exact wording):\n${noteContent}\n\n` : ''}

CRITICAL GRADING PHILOSOPHY:
- Focus on CONCEPTUAL UNDERSTANDING, not exact wording or specific examples
- Students should be rewarded for demonstrating they understand the concept, even if they use different words or examples
- Different terminology is acceptable if it conveys the same meaning
- Alternative examples are acceptable if they demonstrate the same principle
- Paraphrasing and rephrasing should be credited if the core concept is correct
- Only penalize if the concept itself is wrong, missing, or misunderstood

Grade each of the ${questions.length} questions with intelligent assessment that recognizes partial understanding and gives proportional credit:

SCORING SCALE (0-10):
- 9-10: Complete conceptual understanding - demonstrates mastery of the concept (exact wording not required)
- 7-8: Strong understanding - grasps main concepts correctly, minor details may differ from notes
- 5-6: Good understanding - correct core idea, may use different words or examples
- 3-4: Basic understanding - recognizes concept but with conceptual gaps or misunderstandings
- 1-2: Limited understanding - fundamental misconceptions or very vague
- 0: No understanding shown or completely wrong concept

COMMENTS must be detailed and structured like a real lecturer's feedback. Each comment MUST include THREE parts:

1. **What they did well**: Start with positive recognition of correct elements, good reasoning, or strong understanding shown
2. **What they did wrong**: Clearly identify specific errors, omissions, misconceptions, or gaps in their answer
3. **How to improve**: Provide actionable next steps - what to review, what to focus on, or how to strengthen their understanding

COMMENT EXAMPLES:
• "✓ Well done: You correctly identified the main concept and provided a clear definition. ✗ However: You missed the practical application aspect and didn't explain how this concept connects to real-world scenarios. → Next steps: Review the examples in the reference material and practice explaining how theory applies to practice."

• "✓ Strong points: Your reasoning about the cause was well-explained and showed good logical thinking. ✗ Gap identified: You didn't address the consequences or downstream effects of this process. → To improve: Study the complete cause-and-effect chain and practice tracing through all stages of the process."

• "✓ Good start: You recognized the key term and attempted to explain it. ✗ Needs work: Your explanation lacks depth and specificity - it's too vague to demonstrate real understanding. → Action items: Review the detailed definition in your notes, focus on the 'why' and 'how' aspects, and try to elaborate with specific mechanisms or examples."

Return a JSON array where each object has:
{
  "question": "exact question text",
  "studentAnswer": "student's answer (or 'No answer provided')",
  "mark": number (0-10),
  "comment": "detailed 3-part feedback (what they did well, what they did wrong, how to improve) that sounds like a real lecturer",
  "reference": "specific concept/section from reference material that supports this grading"
}

Questions to grade:\n`;

    // Add questions and answers to prompt
    questions.forEach((q, i) => {
      prompt += `${i + 1}. ${q}\n`;
      prompt += `Student Answer: ${userAnswers[i] || 'No answer provided'}\n\n`;
    });

    // Get AI response
    const response = await this.generateResponse(prompt);

    try {
      // Try to parse the response as JSON
      // First, try to extract JSON from markdown code blocks
      let jsonStr = response;

      // Check if response contains markdown code blocks
      const codeBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1].trim();
      } else {
        // Fallback to extracting just the JSON array
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          jsonStr = jsonMatch[0];
        } else {
          throw new Error('Could not find JSON array in response');
        }
      }

      // Clean up the JSON string - remove any trailing commas or extra characters
      jsonStr = jsonStr.trim();

      // Try to fix common JSON issues
      // Remove trailing commas before closing brackets/braces
      jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');

      const detailedResults = JSON.parse(jsonStr);

      // Validate the result structure
      if (!Array.isArray(detailedResults) || detailedResults.length === 0) {
        throw new Error('Response is not a valid array');
      }

      // Ensure each result has the student answer included
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

      // Generate overall feedback
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
      // Fallback: return a basic structure with student answers
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