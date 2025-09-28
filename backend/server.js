const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Task = require('./models/Task');
const Note = require('./models/Note');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Course = require('./models/Course');
const authRoutes = require('./routes/auth');
const studyRoutes = require('./routes/study');
const { initializeSocket } = require('./socket');

const userRoutes = require('./routes/users');
const courseRoutes = require('./routes/courses');
const aiRoutes = require('./routes/ai');
const axios = require('axios');
const aiService = require('./services/aiService');
const notificationController = require('./controllers/notificationController');
const notificationRoutes = require('./routes/notificationRoutes');
const agentRoutes = require('./routes/agent');

const syncSpaceRoutes = require('./routes/syncSpace');

const noteRoutes = require('./routes/notes'); // Import notes routes

const app = express();
const PORT = process.env.PORT || 3001;
const mongoURI = process.env.MONGO_URI;
const jwtSecret = process.env.JWT_SECRET;
const googleApiKey = process.env.GOOGLE_API_KEY;
const googleApiKey1 = process.env.GEMINI_API_KEY_1 || process.env.GOOGLE_API_KEY;
const googleApiKey2 = process.env.GEMINI_API_KEY_2;
const googleApiKey3 = process.env.GEMINI_API_KEY_3;

// Set up the API keys for the AI service
const apiKeys = [googleApiKey1, googleApiKey2, googleApiKey3].filter(key => key);
if (apiKeys.length > 0) {
  console.log(`Setting up AI service with ${apiKeys.length} API keys`);
  aiService.setApiKeys(apiKeys);
} else {
  console.error('WARNING: No Gemini API keys defined. AI features will not work.');
}

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

// Configure CORS
// Debug log all environment variables (for troubleshooting)
console.log('Environment Variables:', {
  NODE_ENV: process.env.NODE_ENV,
  FRONTEND_URLS: process.env.FRONTEND_URLS,
  // Don't log sensitive data
});

// Allow localhost for development and production frontend URL
const allowedOrigins = ['http://localhost:5173', 'http://localhost:3001', 'https://main-student-buddy.vercel.app'];

console.log('Allowed CORS origins:', allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified origin: ${origin}`;
      console.warn(msg);
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Handle preflight requests
app.options('*', cors());

// Handle preflight requests
app.options('*', cors());
app.use(express.json());

// Mount agent routes
app.use('/api/agent', agentRoutes);

// Mount notification routes
app.use('/api/notifications', notificationRoutes);


// Mount Sync Space routes
app.use('/api/sync-spaces', syncSpaceRoutes);



// Mount Notes routes
app.use('/api/notes', noteRoutes);

// Ping route to keep backend awake
app.get("/api/ping", (req, res) => {
  console.log(`[${new Date().toISOString()}] Ping received`);
  res.status(200).send("🟢 Backend is awake!");
});

// Check if keys are loaded
if (!jwtSecret) {
  console.error('FATAL ERROR: JWT_SECRET is not defined.');
  process.exit(1);
}
if (!googleApiKey) {
  console.error('WARNING: GOOGLE_API_KEY is not defined. AI features may not work.');
}

// Connect to MongoDB
console.log('Attempting to connect to MongoDB Atlas...');
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 10000,  // Increased timeout to 10 seconds
  socketTimeoutMS: 45000,
  maxPoolSize: 10,  // Maximum number of connections in the connection pool
  retryWrites: true,
  w: 'majority'
})
.then(() => {
  console.log('Successfully connected to MongoDB Atlas');
  console.log('Database:', mongoose.connection.name);
  console.log('Host:', mongoose.connection.host);
  
  // Verify the connection by listing all collections
  return mongoose.connection.db.listCollections().toArray();
})
.then(collections => {
  console.log('Available collections:', collections.map(c => c.name));
  
  // Check if the database is empty
  if (collections.length === 0) {
    console.log('Database is empty. You may need to create collections.');
  }
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  console.error('Please check your MongoDB Atlas connection string and network access settings.');
  console.error('Make sure your IP is whitelisted in MongoDB Atlas Network Access.');
  process.exit(1);
});

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected successfully');  
});

mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
});

// Handle process termination
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (err) {
    console.error('Error during MongoDB disconnection:', err);
    process.exit(1);
  }
});

console.log('MongoDB connection setup complete.');

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('No token provided in request');
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log('Token verified for user:', decoded.userId);

    // Log specific route access
    if (req.originalUrl === '/api/notifications/count') {
      console.log('Accessing notification count route with authenticated token');
    }

    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please login again.' });
    }
    res.status(403).json({ message: 'Invalid token.' });
  }
};

app.get('/', (req, res) => {
  res.send('Student Buddy Backend');
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Register endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password, school, level, semesterStart, semesterEnd } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Do NOT hash password here, let the pre-save hook do it!
    const user = new User({
      username,
      email,
      password, // plain password
      school: school || '',
      level: level || '',
      semesterStart: semesterStart || '',
      semesterEnd: semesterEnd || ''
    });
    
    await user.save();

    // Create default course folders
    const defaultCourses = [
      {
        name: 'General',
        code: 'GEN101',
        school: school,
        level: level,
        semester: 'Default',
        schedule: [],
        user: user._id
      }
    ];

    // Create courses and their folders
    for (const course of defaultCourses) {
      const newCourse = new Course(course);
      await newCourse.save();
    }
    
    // Create token
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

// Login endpoint
app.post('/api/login', async (req, res) => {
  console.log('Received login request');
  console.log('Request body:', req.body);

  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    console.log('User found:', user ? user.email : 'None');
    if (!user) {
      console.log('Login failed: User not found');
      return res.status(400).json({ message: 'User not found' });
    }
    
    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    console.log('Password valid:', validPassword);
    if (!validPassword) {
      console.log('Login failed: Invalid password');
      return res.status(400).json({ message: 'Invalid password' });
    }
    
    // Create token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Return token and user ID as string
    res.json({ 
      token, 
      userId: user._id.toString() // Convert ObjectId to string
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});







// Get all Notes for a user
app.get('/api/notes', authenticateToken, async (req, res) => {
  try {
    const subject = req.query.subject;
    let filter = { user: req.user.userId };

    if (subject !== undefined) {
      filter.subject = subject === '' ? { $exists: false } : subject;
    }

    const course = req.query.course;
    if (course) {
      filter.course = new mongoose.Types.ObjectId(course);
    }

    const notes = await Note.find(filter).populate('course').sort({ createdAt: -1 });
    res.status(200).json(notes);
  } catch (err) {
    console.error('Error fetching notes:', err);
    res.status(500).json({ message: 'Error fetching notes' });
  }
});

// Create a new Note
app.post('/api/notes', authenticateToken, async (req, res) => {
  try {
    const { title, content, subject } = req.body;

    const newNote = new Note({
      user: req.user.userId,
      title,
      content,
      subject,
    });

    const savedNote = await newNote.save();
    res.status(201).json(savedNote);
  } catch (err) {
    console.error('Error creating note:', err);
    res.status(500).json({ message: 'Error creating note' });
  }
});

// Update a Note by ID
app.put('/api/notes/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedNote = await Note.findOneAndUpdate(
      { _id: id, user: req.user.userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedNote) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.status(200).json(updatedNote);
  } catch (err) {
    console.error('Error updating note:', err);
    res.status(500).json({ message: 'Error updating note' });
  }
});

// Delete a Note by ID
app.delete('/api/notes/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedNote = await Note.findOneAndDelete({ _id: id, user: req.user.userId });

    if (!deletedNote) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.status(200).json({ message: 'Note deleted successfully' });
  } catch (err) {
    console.error('Error deleting note:', err);
    res.status(500).json({ message: 'Error deleting note' });
  }
});

// AI Chat Endpoint - Now uses the aiService which has the key set
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { prompt } = req.body;
    console.log('Received chat request:', { prompt });

    if (!prompt) {
      console.log('Error: No prompt provided');
      return res.status(400).json({ msg: 'Prompt is required' });
    }

    console.log('Making request to AI service via chat endpoint...');
    // Call the AI service to generate the response
    const aiResponse = await aiService.generateResponse(prompt);

    console.log('Received response from AI service:', aiResponse);

    if (!aiResponse) {
      // This case should ideally be handled by the service throwing an error,
      // but keep a check here just in case.
      console.error('Error: Empty response from AI service.', aiResponse);
      return res.status(500).json({ msg: 'Failed to get a response from AI.' });
    }

    console.log('Sending successful response to client');
    res.json({ response: aiResponse });

  } catch (error) {
    console.error('Error in chat endpoint (calling AI service): ', error);
    // Pass along the error message from the AI service
    res.status(500).json({ msg: error.message });
  }
});

// Note: User preference and notification routes are now handled in routes/users.js

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept images, documents, and other common file types
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// File upload endpoint
app.post('/api/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Update Note model to include attachments
const noteSchema = new mongoose.Schema({
  // ... existing fields ...
  attachments: [{
    name: String,
    type: String,
    url: String,
    size: Number
  }]
});

// Get all courses for a user
app.get('/api/courses', authenticateToken, async (req, res) => {
  try {
    const courses = await Course.find({ user: req.user.userId });
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Error fetching courses' });
  }
});

// Create a new course
app.post('/api/courses', authenticateToken, async (req, res) => {
  try {
    const { name, code, semester, schedule } = req.body;
    
    // Get user's school and level
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Ensure base uploads directory exists
    const baseUploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(baseUploadsDir)) {
      fs.mkdirSync(baseUploadsDir);
    }

    // Ensure user's uploads directory exists
    const userUploadsDir = path.join(baseUploadsDir, req.user.userId.toString());
    if (!fs.existsSync(userUploadsDir)) {
      fs.mkdirSync(userUploadsDir);
    }

    // Ensure notes directory exists
    const notesDir = path.join(userUploadsDir, 'notes');
    if (!fs.existsSync(notesDir)) {
      fs.mkdirSync(notesDir);
    }
    
    // Create the course
    const course = new Course({
      name,
      code,
      school: user.school,
      level: user.level,
      semester,
      schedule,
      user: req.user.userId
    });
    await course.save();


    // Create a folder for the course notes
    const courseFolderPath = path.join(notesDir, name);
    if (!fs.existsSync(courseFolderPath)) {
      fs.mkdirSync(courseFolderPath);
    }

    // Create a default note with scheme of work template
    const defaultNote = new Note({
      user: req.user.userId,
      title: `${name} - Course Overview & Scheme of Work`,
      content: `# ${name} (${code})

## Course Information
- School: ${user.school}
- Level: ${user.level}
- Semester: ${semester}

## Schedule
${schedule.map(s => `- ${s.day}: ${s.startTime} - ${s.endTime} (${s.location})`).join('\n')}

## Scheme of Work
Please fill in the topics and subtopics for this course. This will be used by AI to generate detailed notes.

### Week 1
- Topic 1: [Topic Name]
  - Subtopic 1.1: [Description]
  - Subtopic 1.2: [Description]
  - Learning Objectives:
    - [Objective 1]
    - [Objective 2]

### Week 2
- Topic 2: [Topic Name]
  - Subtopic 2.1: [Description]
  - Subtopic 2.2: [Description]
  - Learning Objectives:
    - [Objective 1]
    - [Objective 2]

### Week 3
- Topic 3: [Topic Name]
  - Subtopic 3.1: [Description]
  - Subtopic 3.2: [Description]
  - Learning Objectives:
    - [Objective 1]
    - [Objective 2]

## Assessment Schedule
- Midterm Exam: [Date]
- Final Exam: [Date]
- Assignments:
  - Assignment 1: [Due Date]
  - Assignment 2: [Due Date]

## Resources
- Required Textbooks:
  - [Book 1]
  - [Book 2]
- Online Resources:
  - [Resource 1]
  - [Resource 2]

## Notes
Add your course notes here. The AI will use the scheme of work above to help generate detailed notes for each topic.`,
      subject: name,
      course: course._id
    });
    await defaultNote.save();

    res.status(201).json(course);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ message: error.message || 'Error creating course' });
  }
});

// Update a course
app.put('/api/courses/:id', authenticateToken, async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, user: req.user.userId });
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const { name, code, semester, schedule } = req.body;
    
    // Update course details
    course.name = name;
    course.code = code;
    course.semester = semester;
    course.schedule = schedule;

    await course.save();


    // Update folder name if course name changed
    if (name !== course.name) {
      const oldFolderPath = path.join(__dirname, 'uploads', req.user.userId.toString(), 'notes', course.name);
      const newFolderPath = path.join(__dirname, 'uploads', req.user.userId.toString(), 'notes', name);
      if (fs.existsSync(oldFolderPath)) {
        fs.renameSync(oldFolderPath, newFolderPath);
      }
    }

    res.json(course);
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ message: error.message || 'Error updating course' });
  }
});

// Delete a course
app.delete('/api/courses/:id', authenticateToken, async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, user: req.user.userId });
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }


    // Delete course folder
    const folderPath = path.join(__dirname, 'uploads', req.user.userId.toString(), 'notes', course.name);
    if (fs.existsSync(folderPath)) {
      fs.rmSync(folderPath, { recursive: true, force: true });
    }

    // Delete the course
    await course.deleteOne();

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ message: 'Error deleting course' });
  }
});

// Add a result to a course
app.post('/api/courses/:id/results', authenticateToken, async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, user: req.user.userId });
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const { assessment, score, maxScore, date } = req.body;
    course.results.push({ assessment, score, maxScore, date });
    await course.save();
    res.json(course);
  } catch (error) {
    console.error('Error adding result:', error);
    res.status(500).json({ message: 'Error adding result' });
  }
});

// Add attendance record to a course
app.post('/api/courses/:id/attendance', authenticateToken, async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, user: req.user.userId });
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const { date, present, note } = req.body;
    
    // Validate date
    const attendanceDate = new Date(date);
    if (isNaN(attendanceDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    // Check if attendance record already exists for this date
    const existingRecord = course.attendance.find(record => 
      record.date.toDateString() === attendanceDate.toDateString()
    );

    if (existingRecord) {
      // Update existing record
      existingRecord.present = present;
      existingRecord.note = note;
    } else {
      // Add new record
      course.attendance.push({ date: attendanceDate, present, note });
    }

    await course.save();
    res.json(course);
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({ message: 'Error updating attendance' });
  }
});

// Get attendance records for a course
app.get('/api/courses/:id/attendance', authenticateToken, async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, user: req.user.userId });
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(course.attendance);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: 'Error fetching attendance records' });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/study', studyRoutes);

app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);

// Course Topics routes
const courseTopicsRoutes = require('./routes/courseTopics');
app.use('/api/topics', courseTopicsRoutes);

// Practice Exam routes
const practiceExamRoutes = require('./routes/practiceExam');
app.use('/api/practice-exam', practiceExamRoutes);

// Create HTTP server
const server = require('http').createServer(app);

// Initialize Socket.IO
const io = initializeSocket(server);


server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});