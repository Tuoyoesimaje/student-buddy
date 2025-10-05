const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Note = require('./models/Note');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const Course = require('./models/Course');
const authRoutes = require('./routes/auth');
const studyRoutes = require('./routes/study');

const courseRoutes = require('./routes/courses');
const aiRoutes = require('./routes/ai');
const axios = require('axios');
const aiService = require('./services/aiService');


const noteRoutes = require('./routes/notes'); // Import notes routes
const practiceExamRoutes = require('./routes/practiceExam'); // Import practice exam routes

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









// Note: User preference and notification routes are now handled in routes/users.js



// Routes
app.use('/api/auth', authRoutes);
app.use('/api/study', studyRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/practice-exam', practiceExamRoutes);
app.use('/api/note-generation', require('./routes/noteGeneration'));

// Create HTTP server
const server = require('http').createServer(app);



server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});