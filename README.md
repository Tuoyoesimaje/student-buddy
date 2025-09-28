# Modern Student Dashboard

A modern web application for managing study resources, notes, schedules, and progress tracking.

## Features

- **Note Management:** Rich text editor with AI-powered explanations
- **AI Study Tools:** Generate notes, explanations, and quizzes
- **Practice Exams:** Take comprehensive practice exams
- **Study Sessions:** Gamified quiz experience with achievements and streaks
- **Real-time Collaboration:** Sync spaces for group work and shared notes
- **Modern UI:** Dark mode, responsive design, and PWA capabilities

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
│   │   ├── 📁 pages/               # Main page components
│   │   ├── 📁 context/             # React contexts
│   │   ├── 📁 hooks/               # Custom hooks
│   │   ├── 📁 services/            # API services
│   │   └── 📁 utils/               # Utility functions
│   └── package.json
├── 📁 backend/                     # Node.js backend application
│   ├── 📁 controllers/             # Route controllers
│   ├── 📁 models/                  # Mongoose models
│   ├── 📁 routes/                  # API routes
│   ├── 📁 middleware/              # Custom middleware
│   ├── 📁 services/                # Business logic services
│   ├── server.js                   # Main server file
│   └── socket.js                   # WebSocket configuration
└── 📄 documentation/               # Project documentation
```

## Getting Help

For any questions or issues, please contact the development team.

---

*This is a private project. Unauthorized access, use, or distribution is prohibited.*
