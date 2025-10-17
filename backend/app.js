const notificationRoutes = require('./routes/notificationRoutes');
const notificationController = require('./controllers/notificationController');
const express = require('express');
const cors = require('cors');
const syncSpaceRoutes = require('./routes/syncSpace');
const noteRoutes = require('./routes/notes');

const app = express();

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`Received incoming request: ${req.method} ${req.originalUrl}`);
  next();
});

// Use body parsing middleware for JSON with increased limit for large notes
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// Configure CORS to allow requests from production frontend
app.use(cors({
  origin: ['https://main-student-buddy.vercel.app', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Handle preflight requests
app.options('*', cors());

// Add Sync Space routes
app.use('/api/sync-spaces', syncSpaceRoutes);
app.use('/api/notes', noteRoutes);

// Add notification routes
app.use('/api/notifications', notificationRoutes);

// Add task routes
const taskRoutes = require('./routes/taskRoutes');
app.use('/api/tasks', taskRoutes);

// Initialize notification scheduler
notificationController.scheduleReminders();

// Mount user routes - ensure this is after middleware
const userRoutes = require('./routes/users'); // Assuming you mount users.js like this
app.use('/api/users', userRoutes);
