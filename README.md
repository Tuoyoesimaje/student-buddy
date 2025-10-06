# Modern Student Dashboard

A modern web application for managing study resources, notes, schedules, and progress tracking.

## Features

- **Note Management:** Rich text editor with AI-powered explanations
- **AI Study Tools:** Generate notes, explanations, and quizzes
- **Practice Exams:** Take comprehensive practice exams with detailed results
- **Study Sessions:** AI-generated quiz experience for effective learning
- **Course Management:** Organize study materials by courses and topics
- **Modern UI:** Dark mode, responsive design, and clean interface

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Framer Motion
- **Backend:** Node.js, Express.js, Socket.IO
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT with bcryptjs
- **AI Integration:** Google Generative AI
- **Real-time:** WebSocket notifications and push notifications
- **PWA:** Service workers and offline capabilities

## Prerequisites

- Node.js (v14 or later) and npm (or yarn)
- MongoDB (local or MongoDB Atlas)

## Development Setup

1. **Clone the repository:**
   ```bash
   git clone [your-private-repo-url]
   cd [repository-name]
   ```

2. **Set up the backend:**
   ```bash
   cd backend
   npm install
   ```

3. **Set up the frontend:**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure environment variables:**

   - Backend (create `.env` in the `backend` directory):
     ```
     # Server Configuration
     PORT=3001
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_secure_jwt_secret
     FRONTEND_URL=https://main-working-version.vercel.app
     ```

   - Frontend (create `.env` in the `frontend` directory):
     ```
     # Backend Configuration
     VITE_BACKEND_URL=http://localhost:3001
     
     # PWA Configuration
     VITE_APP_NAME=Student Buddy
     VITE_APP_SHORT_NAME=StudentBuddy
     VITE_APP_DESCRIPTION=A modern student dashboard for managing studies and tasks
     VITE_APP_THEME_COLOR=#ffffff
     VITE_APP_BACKGROUND_COLOR=#ffffff
     VITE_APP_DISPLAY=standalone
     ```

## Running the Application

1. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend development server:**
   ```bash
   cd ../frontend
   npm run dev
   ```

3. Access the application at [https://main-working-version.vercel.app](https://main-working-version.vercel.app)

## Building for Production

1. **Build the frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Start the production server:**
   ```bash
   cd ../backend
   npm start
   ```

## Project Structure

```
student-buddy/
├── 📁 frontend/                    # React frontend application
│   ├── 📁 public/                  # Static assets and PWA files
│   ├── 📁 src/
│   │   ├── 📁 components/          # Reusable UI components
│   │   │   ├── 📁 layout/          # Layout components (MainLayout)
│   │   │   ├── 📁 ui/              # Base UI components
│   │   │   ├── AINoteProcessor.jsx  # AI-powered note processing
│   │   │   ├── FloatingAIAssistant.jsx # AI assistant component
│   │   │   ├── NoteCard.jsx        # Note display component
│   │   │   ├── PracticeExam.jsx    # Practice exam components
│   │   │   ├── RichTextEditor.jsx  # Rich text editing
│   │   │   └── ThemeToggle.jsx     # Dark/light mode toggle
│   │   ├── 📁 pages/               # Main page components
│   │   │   ├── Login.jsx           # Authentication pages
│   │   │   ├── Register.jsx
│   │   │   ├── Notes.jsx           # Note management
│   │   │   ├── Study.jsx           # Study tools and quizzes
│   │   │   ├── Settings.jsx        # User settings
│   │   │   └── Practice Exam pages # Exam management
│   │   ├── 📁 context/             # React contexts
│   │   │   ├── AuthContext.jsx     # Authentication state
│   │   │   └── ThemeContext.jsx    # Theme management
│   │   ├── 📁 hooks/               # Custom hooks
│   │   ├── 📁 services/            # API services
│   │   └── 📁 utils/               # Utility functions
│   ├── package.json                # Frontend dependencies
│   ├── vite.config.js              # Vite configuration
│   ├── tailwind.config.js          # Tailwind CSS config
│   └── postcss.config.js           # PostCSS config
├── 📁 backend/                     # Node.js backend application
│   ├── 📁 controllers/             # Route controllers
│   │   ├── noteController.js       # Note management logic
│   │   └── auth.js                 # Authentication logic
│   ├── 📁 models/                  # Mongoose models
│   │   ├── User.js                 # User data model
│   │   ├── Note.js                 # Note data model
│   │   ├── Course.js               # Course data model
│   │   ├── CourseTopic.js          # Course topic model
│   │   ├── PracticeExam.js         # Practice exam model
│   │   ├── Quiz.js                 # Quiz model
│   │   └── AIGeneratedPracticeExam.js # AI exam model
│   ├── 📁 routes/                  # API routes
│   │   ├── auth.js                 # Authentication endpoints
│   │   ├── notes.js                # Note CRUD operations
│   │   ├── courses.js              # Course management
│   │   ├── practiceExam.js         # Practice exam endpoints
│   │   ├── study.js                # Study tools
│   │   ├── users.js                # User management
│   │   ├── ai.js                   # AI-powered features
│   │   └── noteGeneration.js       # Note generation
│   ├── 📁 middleware/              # Custom middleware
│   │   └── auth.js                 # JWT authentication
│   ├── 📁 services/                # Business logic services
│   │   └── aiService.js            # AI integration service
│   ├── 📁 utils/                   # Utility functions
│   ├── 📁 uploads/                 # File uploads directory
│   ├── server.js                   # Main server file
│   └── package.json                # Backend dependencies
├── 📄 PROJECT_DOCUMENTATION.md     # Complete project documentation
├── 📄 README.md                    # Project overview and setup
└── 📄 QUICK_REFERENCE.md           # Quick reference guide
```

## Getting Help

For any questions or issues, please contact the development team.

---

*This is a private project. Unauthorized access, use, or distribution is prohibited.*
