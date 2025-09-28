const express = require('express');
const mongoose = require('mongoose');
const aiService = require('../services/aiService');
const Note = require('../models/Note');
const Course = require('../models/Course');
const CourseTopic = require('../models/CourseTopic');

const router = express.Router();
const authenticateToken = require('../middleware/auth');

// IMPORTANT: Make sure GOOGLE_API_KEY is set in your .env file


// In-memory store for chat history. For production, consider Redis or MongoDB.
const chatHistories = {};

// Enhanced system prompt for better AI behavior
const SYSTEM_PROMPT = `You are 'Buddy', a highly intelligent student assistant AI. Your primary role is to help users with their academic notes and study plans.

Available tools:
- 'generate_note': Create a new study note on a specific topic
- 'save_note': Save the previous AI response as a note
- 'get_courses': Get user's courses to suggest study plans
- 'get_course_topics': Get topics for a specific course
- 'find_resources': Suggest study materials and resources based on user's courses and topics

Only use these tools when explicitly requested by the user. For general conversation, respond naturally without using tools.

Today's date is ${new Date().toDateString()}.
`;

// --- ENHANCED TOOL DEFINITIONS ---
const tools = {
  generate_note: {
    name: 'generate_note',
    description: 'Generate a comprehensive study note on a specific topic and save it.',
    parameters: {
      type: 'object',
      properties: {
        topic: { 
          type: 'string', 
          description: 'The specific topic for the note. Be detailed for better results.' 
        },
        subject: { 
          type: 'string', 
          description: 'The subject or course for this note (optional).' 
        }
      },
      required: ['topic'],
    },
  },
  save_note: {
    name: 'save_note',
    description: 'Save the previous AI response as a new note.',
    parameters: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'The title for the new note.'
        },
        subject: {
          type: 'string',
          description: 'The subject or course for this note (optional).'
        }
      },
      required: ['title']
    }
  },
  get_courses: {
    name: 'get_courses',
    description: 'Get the user\'s courses to suggest study plans.',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  get_course_topics: {
    name: 'get_course_topics',
    description: 'Get topics for a specific course.',
    parameters: {
      type: 'object',
      properties: {
        courseId: {
          type: 'string',
          description: 'The ID of the course to get topics for.'
        }
      },
      required: ['courseId']
    }
  },
  find_resources: {
    name: 'find_resources',
    description: 'Suggest study materials, resources, and learning aids based on user\'s courses, topics, or specific subjects.',
    parameters: {
      type: 'object',
      properties: {
        topic: {
          type: 'string',
          description: 'The specific topic or subject to find resources for.'
        },
        courseId: {
          type: 'string',
          description: 'Optional: The course ID to find resources for.'
        },
        resourceType: {
          type: 'string',
          enum: ['books', 'videos', 'articles', 'practice', 'tools', 'all'],
          description: 'Type of resources to focus on. Defaults to "all".'
        },
        difficulty: {
          type: 'string',
          enum: ['beginner', 'intermediate', 'advanced', 'mixed'],
          description: 'Difficulty level of resources. Defaults to "mixed".'
        }
      },
      required: ['topic']
    }
  }
};

// --- ENHANCED TOOL EXECUTION LOGIC ---
const executeTool = async (toolName, args, userId) => {
  console.log(`Executing tool: ${toolName} with args:`, JSON.stringify(args, null, 2));
  
  try {
    switch (toolName) {
      case 'generate_note':
        const notePrompt = `Generate a comprehensive, well-structured study note on: "${args.topic}"
        
Format: ${args.format || 'detailed'}

Guidelines:
- Use clear headings and subheadings
- Include key concepts and definitions
- Add examples where helpful
- Make it suitable for studying and review
- Use bullet points and numbered lists for clarity
- Keep it concise but comprehensive`;

        const noteContent = await aiService.generateResponse(notePrompt);
        
        const newNote = new Note({ 
          title: args.topic,
          content: noteContent,
          subject: args.subject || '',
          user: userId
        });
        
        const savedNote = await newNote.save();
        return { 
          success: true, 
          message: `📝 I've generated and saved a ${args.format || 'detailed'} note on "${args.topic}".`,
          note: {
            id: savedNote._id,
            title: savedNote.title,
            preview: noteContent.substring(0, 200) + '...'
          }
        };

      case 'save_note':
        const chatHistory = chatHistories[userId];
        if (!chatHistory || chatHistory.length === 0) {
          return { error: 'No chat history found to save a note from.' };
        }

        // Find the last response from the AI model
        const lastModelResponse = [...chatHistory].reverse().find(entry => entry.role === 'model');

        if (!lastModelResponse || !lastModelResponse.parts || !lastModelResponse.parts[0]?.text) {
          return { error: 'Could not find a previous response from the AI to save.' };
        }


        const noteToSaveContent = lastModelResponse.parts[0].text;
        const noteToSave = new Note({
          title: args.title,
          content: noteToSaveContent,
          subject: args.subject || '',
          user: userId
        });

        const savedNoteFromHistory = await noteToSave.save();
        return {
          success: true,
          message: `✅ I've saved the previous response as a note titled "${args.title}".`,
          note: {
            id: savedNoteFromHistory._id,
            title: savedNoteFromHistory.title
          }
        };
        
      case 'get_courses':
        console.log(`get_courses: Fetching courses for userId: ${userId}`);
        const courses = await Course.find({ user: userId }).sort({ updatedAt: -1 });
        console.log(`get_courses: Found ${courses.length} courses for userId: ${userId}`);
        if (courses.length > 0) {
          console.log('get_courses: First course found:', courses[0]);
        }
        
        if (!courses || courses.length === 0) {
          return { message: 'You don\'t have any courses yet. Would you like me to help you add some?' };
        }
        
        return {
          success: true,
          courses: courses.map(course => ({
            id: course._id.toString(),
            name: course.name,
            code: course.code,
            school: course.school,
            level: course.level,
            semester: course.semester
          }))
        };
        
      case 'get_course_topics':
        if (!args.courseId) {
          console.error(`get_course_topics: Missing courseId for userId: ${userId}`);
          return { error: 'Course ID is required to fetch topics.' };
        }
        console.log(`get_course_topics: Fetching topics for courseId: ${args.courseId} and userId: ${userId}`);

        let actualCourseId = args.courseId;

        // Check if courseId is a valid ObjectId, if not, try to find course by name
        if (!mongoose.Types.ObjectId.isValid(args.courseId)) {
          console.log(`get_course_topics: courseId "${args.courseId}" is not a valid ObjectId, searching by course name`);
          const course = await Course.findOne({
            $or: [
              { name: args.courseId },
              { name: { $regex: new RegExp(args.courseId, 'i') } }
            ],
            user: userId
          });

          if (!course) {
            console.log(`get_course_topics: No course found with name "${args.courseId}" for userId: ${userId}`);
            return { error: `No course found with name "${args.courseId}". Please check the course name.` };
          }

          actualCourseId = course._id;
          console.log(`get_course_topics: Found course "${course.name}" with ID: ${actualCourseId}`);
        }

        const topics = await CourseTopic.find({
          courseId: actualCourseId,
          userId: userId
        }).sort({ weekDate: 1 });
        console.log(`get_course_topics: Found ${topics.length} topics for courseId: ${actualCourseId} and userId: ${userId}`);
        if (topics.length > 0) {
          console.log('get_course_topics: First topic found:', topics[0]);
        }

        if (!topics || topics.length === 0) {
          return { message: 'No topics found for this course. Would you like to add some topics in the Settings page?' };
        }

        return {
          success: true,
          topics: topics.map(topic => ({
            id: topic._id.toString(),
            topic: topic.topic,
            description: topic.description || '',
            weekDate: topic.weekDate
          }))
        };
        

      case 'find_resources':
        const topic = args.topic;
        const resourceCourseId = args.courseId;
        const resourceType = args.resourceType || 'all';
        const difficulty = args.difficulty || 'mixed';

        // Get course context if courseId provided
        let courseContext = '';
        if (resourceCourseId) {
          const course = await Course.findOne({ _id: resourceCourseId, user: userId });
          if (course) {
            courseContext = `Course: ${course.name} (${course.code})`;

            // Get course topics for additional context
            const courseTopics = await CourseTopic.find({
              courseId: resourceCourseId,
              userId: userId
            });

            if (courseTopics.length > 0) {
              courseContext += `\nCourse Topics: ${courseTopics.map(t => t.topic).join(', ')}`;
            }
          }
        }

        // Get user's courses for general context
        const userCourses = await Course.find({ user: userId });
        const coursesContext = userCourses.length > 0 ?
          `\nUser's Courses: ${userCourses.map(c => `${c.name} (${c.code})`).join(', ')}` : '';

        const resourcePrompt = `Find and suggest study materials and resources for: "${topic}"

${courseContext}${coursesContext}

**Resource Requirements:**
- Resource Type: ${resourceType}
- Difficulty Level: ${difficulty}
- Academic Level: University/College

Please provide a comprehensive list of resources including:

1. **📚 Books & Textbooks**
   - Recommended textbooks and reference books
   - Include author names and brief descriptions

2. **🎥 Video Resources**
   - YouTube channels, online courses, video lectures
   - Specific video series or playlists

3. **📄 Articles & Papers**
   - Academic articles, research papers
   - Online articles and tutorials

4. **💻 Online Tools & Platforms**
   - Interactive learning platforms
   - Simulation tools, calculators, apps

5. **📝 Practice Resources**
   - Practice problems, worksheets
   - Past exams, quiz resources

6. **🌐 Websites & Databases**
   - Educational websites
   - Online libraries and databases

For each resource, provide:
- Name/Title
- Brief description of what it covers
- Why it's useful for studying "${topic}"
- Difficulty level (if applicable)
- Access method (free/paid/subscription)

Focus on high-quality, reputable sources that are commonly used in academic settings.`;

        const resourceSuggestions = await aiService.generateResponse(resourcePrompt);

        return {
          success: true,
          message: `📚 Here are study resources for "${topic}":`,
          resources: resourceSuggestions,
          topic: topic,
          resourceType: resourceType,
          difficulty: difficulty
        };

      default:
        return { error: `Tool "${toolName}" not found.` };
    }
  } catch (error) {
    console.error(`Error executing tool ${toolName}:`, error);
    // Provide detailed validation error messages
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message).join(', ');
      return { error: `Validation failed for ${toolName}: ${messages}` };
    }
    return { 
      error: `Failed to execute ${toolName}: ${error.message}`,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
  }
};

// --- ENHANCED MAIN AGENT CHAT ROUTE ---
router.post('/chat', authenticateToken, async (req, res) => {
  try {
    const { prompt: message } = req.body;
    const userId = req.user.userId;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required.' });
    }

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    // Initialize chat history if it doesn't exist
    if (!chatHistories[userId]) {
      chatHistories[userId] = [];
    }
    
    const history = chatHistories[userId];

    const model = aiService.getChatModel({ 
      functionDeclarations: Object.values(tools), 
      modelName: 'gemini-2.5-flash',
      functionCallingMode: 'AUTO'
    });

    const chat = model.startChat({ history, systemInstruction: { role: 'system', parts: [{ text: SYSTEM_PROMPT }] } });
    const result = await chat.sendMessage(message);
    let response = result.response;

    // Add user message to history
    history.push({ role: 'user', parts: [{ text: message }] });

    // --- SIMPLIFIED FUNCTION CALL EXTRACTION ---
    const extractFunctionCalls = (resp) => {
      try {
        if (!resp) return [];
        
        // Handle modern SDK format first
        if (resp.functionCalls?.length) {
          return resp.functionCalls
            .filter(fc => fc?.name && tools[fc.name])
            .map(({ name, args }) => ({ name, args: args || {} }));
        }
    
        // Fallback to candidate-based extraction
        return (resp.candidates || []).flatMap(candidate => 
          (candidate.content?.parts || [])
            .filter(part => part.functionCall)
            .map(part => ({
              name: part.functionCall.name,
              args: part.functionCall.args || {}
            }))
        );
      } catch (error) {
        console.error('Function call extraction error:', error);
        return [];
      }
    };
    
    // --- ENHANCED TOOL EXECUTION LOGIC ---
    const processToolCalls = async (pendingCalls, userId, config = {}) => {
      const {
        maxCalls = 5,
        timeout = 10000,
        retries = 2
      } = config;
    
      const results = [];
      
      for (let i = 0; i < Math.min(pendingCalls.length, maxCalls); i++) {
        const call = pendingCalls[i];
        let attempt = 0;
        
        while (attempt <= retries) {
          try {
            const timer = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Tool execution timeout')), timeout)
            );
            
            const result = await Promise.race([
              executeTool(call.name, call.args, userId),
              timer
            ]);
            
            results.push({
              ...result,
              tool: call.name,
              attempt: attempt + 1
            });
            break;
          } catch (error) {
            attempt++;
            if (attempt > retries) {
              results.push({
                error: `Failed after ${retries} retries: ${error.message}`,
                tool: call.name,
                stack: error.stack
              });
            }
          }
        }
      }
      
      return results;
    };

    // Handle function calls with improved error handling
    let toolCallCount = 0;
    const maxToolCalls = 5;
    let toolResults = []; // Prevent infinite loops

    console.log('Raw model response:', JSON.stringify(response, null, 2).slice(0,1000));
    let pendingCalls = extractFunctionCalls(response);
      // ---- DEBUG ----
      console.log('Extracted pendingCalls:', JSON.stringify(pendingCalls, null, 2));
      if (pendingCalls.length === 0) {
        console.warn('⚠️  No function calls detected after extraction even though the raw model response suggests there should be one.');
      }
    while (pendingCalls.length > 0 && toolCallCount < maxToolCalls) {
      toolCallCount++;
      
      const toolCalls = pendingCalls.filter(call => call && call.name && tools[call.name]);
      if (toolCalls.length === 0) {
        break;
      }
      
      console.log(`Processing ${toolCalls.length} tool call(s)...`);
      
      toolResults = await Promise.all(toolCalls.map(call => executeTool(call.name, call.args || {}, userId)));

      try {
        // CRITICAL FIX: The function responses must match exactly the number of function calls 
        // and be sent as a USER message, not as separate parts 
        
        const functionResponses = toolCalls.map((call, i) => ({
          functionResponse: {
            name: call.name,
            response: toolResults[i]
          }
        }));

        // Add the model's function call to history first 
        history.push({
          role: 'model',
          parts: response.candidates[0].content.parts // The original function call 
        });

        // Then send the function responses as a USER message 
        const resultWithToolOutput = await chat.sendMessage(functionResponses);
        response = resultWithToolOutput.response;
        pendingCalls = extractFunctionCalls(response);
        
      } catch (error) {
        console.error('Primary tool response method failed:', error);
        
        // FALLBACK: Create a new chat session without the problematic history 
        try {
          // Clean up the history - remove any malformed entries 
          const cleanHistory = history.filter(entry => {
            if (entry.role === 'model') {
              // Only keep model entries that don't have functionResponse parts 
              const hasFunctionResponse = entry.parts?.some(part => part.functionResponse);
              return !hasFunctionResponse;
            }
            return true;
          });
          
          // Create fresh chat with clean history 
          const freshModel = aiService.getChatModel({
            functionDeclarations: Object.values(tools),
            modelName: 'gemini-2.5-flash',
            functionCallingMode: 'AUTO'
          });
          
          const freshChat = freshModel.startChat({
            history: cleanHistory,
            systemInstruction: { role: 'system', parts: [{ text: SYSTEM_PROMPT }] }
          });
          
          // Create a summary of tool results for the model 
          const toolSummary = toolResults
            .filter(result => result && !result.error)
            .map(result => {
              if (result.message) return result.message;
              if (result.courses) return `Found ${result.courses.length} courses: ${result.courses.map(c => c.name).join(', ')}`;
              if (result.topics) return `Found ${result.topics.length} topics`;
              if (result.studyPlan) return result.studyPlan;
              return 'Task completed successfully';
            })
            .join('\n\n');
          
          const summaryPrompt = `Based on the following tool execution results, provide a helpful response to the user:\n\n${toolSummary}`;
          const summaryResult = await freshChat.sendMessage(summaryPrompt);
          
          response = summaryResult.response;
          
          // Update our chat reference and history 
          chat = freshChat;
          chatHistories[userId] = await chat.getHistory(); 
          
        } catch (fallbackError) {
          console.error('Fallback method also failed:', fallbackError);
          
          // Final fallback: Use tool results directly 
          const toolMessages = toolResults
            .filter(result => result && result.message)
            .map(result => result.message);
          
          if (toolMessages.length > 0) {
            response = { text: () => toolMessages.join('\n\n') };
          } else {
            response = { text: () => "I've completed your request. Is there anything else?" };
          }
        }
        
        pendingCalls = [];
      }
    }

    const finalResponseText = response.text();
    let finalReply = finalResponseText;

    // If the model's final text response is empty, use the tool's output directly.
    if (toolResults && toolResults.length > 0) {
      // Collect all non-error messages from tool results with enhanced content extraction
      const toolMessages = toolResults
        .filter(result => result && !result.error)
        .map(result => {
          if (!result) return '';

          // Build comprehensive response from tool result
          let message = result.message || '';

          // Add specific content based on tool type
          if (result.analysis) {
            message += '\n\n' + result.analysis;
          }
          if (result.studyPlan) {
            message += '\n\n' + result.studyPlan;
          }
          if (result.resources) {
            message += '\n\n' + result.resources;
          }
          if (result.note && result.note.preview) {
            message += '\n\nNote preview: ' + result.note.preview;
          }

          // Add stats if available (for schedule analysis)
          if (result.stats) {
            message += '\n\n**Quick Stats:**';
            message += `\n• Total Tasks: ${result.stats.totalTasks}`;
            message += `\n• Study Hours: ${result.stats.studyHours?.toFixed(1) || 0} hours`;
            message += `\n• Workload: ${result.stats.workload || 'Unknown'}`;
            if (result.stats.busyDays?.length > 0) {
              message += `\n• Busy Days: ${result.stats.busyDays.join(', ')}`;
            }
            if (result.stats.freeDays?.length > 0) {
              message += `\n• Free Days: ${result.stats.freeDays.join(', ')}`;
            }
          }

          return message;
        })
        .filter(Boolean);

      // If we have any tool messages, use them as the reply
      if (toolMessages.length > 0) {
        finalReply = toolMessages.join('\n\n');
      } else if (!finalReply.trim()) {
        // If no messages from tools and no final reply, use a generic message
        finalReply = "I've completed your request. Is there anything else?";
      }
      
      // If we have errors, append them to the response
      const toolErrors = toolResults
        .filter(result => result && result.error)
        .map(result => `Error: ${result.error}`);
        
      if (toolErrors.length > 0) {
        finalReply = [finalReply, ...toolErrors].filter(Boolean).join('\n\n');
      }
    }
    
    const updatedHistory = await chat.getHistory();
    chatHistories[userId] = updatedHistory;

    if (chatHistories[userId].length > 20) {
      chatHistories[userId] = [chatHistories[userId][0], ...chatHistories[userId].slice(-19)];
    }

    // If still no reply, use the default.
    let reply = finalReply || "I've completed your request. Is there anything else I can help you with?";
    
    // Ensure the reply is a string
    if (reply && typeof reply === 'object') {
      reply = JSON.stringify(reply);
    }
    
    // Remove any potential duplicate messages
    reply = reply.replace(/(I've completed your request[^\n]*\n?)+/g, '').trim() || 
            "I've completed your request. Is there anything else I can help you with?";

    res.json({ 
      reply, 
      toolCallsExecuted: toolCallCount, 
      timestamp: new Date().toISOString() 
    });

  } catch (error) {
    console.error('Error in /api/agent/chat:', error);
    
    // Provide more specific error messages
    if (error.message.includes('API key')) {
      return res.status(500).json({ 
        error: 'AI service configuration error. Please check your API key.' 
      });
    }
    
    if (error.message.includes('quota') || error.message.includes('rate limit') || error.message.includes('All Gemini keys failed')) {
      return res.status(429).json({ 
        error: error.message.includes('All Gemini keys failed') ? 
          'All Gemini keys failed or hit their limit. Try again later.' : 
          'AI service is temporarily unavailable. Please try again in a moment.'
      });
    }

    res.status(500).json({ 
      error: 'An internal server error occurred. Please try again.',
      requestId: Date.now().toString() // For tracking
    });
  }
});

// --- ADDITIONAL UTILITY ROUTES ---

// Get chat history for debugging (development only)
if (process.env.NODE_ENV === 'development') {
  router.get('/chat/history/:userId', (req, res) => {
    const { userId } = req.params;
    res.json({ 
      history: chatHistories[userId] || [],
      messageCount: chatHistories[userId]?.length || 0
    });
  });
}

// Clear chat history
router.delete('/chat/history/:userId', (req, res) => {
  const { userId } = req.params;
  delete chatHistories[userId];
  res.json({ success: true, message: 'Chat history cleared.' });
});

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    activeChats: Object.keys(chatHistories).length
  });
});

module.exports = router;
