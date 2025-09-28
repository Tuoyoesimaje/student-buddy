# Student Buddy - Quick Reference Guide

## 🚀 Quick Start Commands

### Development Setup
```bash
# Install dependencies
npm install

# Frontend development
cd frontend && npm run dev

# Backend development  
cd backend && npm run dev

# Build for production
npm run build
```

### Environment Setup
```bash
# Frontend (.env.local)
VITE_BACKEND_URL=http://localhost:5000

# Backend (.env)
MONGODB_URI=mongodb://localhost:27017/student-buddy
JWT_SECRET=your-jwt-secret
GOOGLE_AI_API_KEY=your-google-ai-key
```

---

## 📁 Key File Locations

### Frontend Structure
```
frontend/src/
├── pages/           # Main page components
│   ├── Notes.jsx
│   ├── Study.jsx
│   ├── PracticeExamListPage.jsx
│   ├── SyncSpaces.jsx
│   └── Chatbot.jsx
├── components/      # Reusable components
│   ├── layout/      # Layout components
│   ├── NoteCard.jsx
│   ├── AINoteProcessor.jsx
│   ├── PracticeExam.jsx
│   └── RichTextEditor.jsx
├── context/         # React contexts
│   ├── AuthContext.jsx
│   ├── ThemeContext.jsx
│   └── SocketContext.js
├── hooks/           # Custom hooks
│   ├── useTextToSpeech.js
│   └── usePWA.js
└── services/        # API services
    ├── api.js
    └── NotificationService.js
```

### Backend Structure
```
backend/
├── controllers/     # Route controllers
│   ├── noteController.js
│   ├── notificationController.js
│   └── syncSpaceController.js
├── models/          # Database models
│   ├── User.js
│   ├── Note.js
│   ├── Course.js
│   ├── SyncSpace.js
│   └── PracticeExam.js
├── routes/          # API routes
│   ├── auth.js
│   ├── notes.js
│   ├── courses.js
│   ├── ai.js
│   └── syncSpace.js
├── middleware/      # Custom middleware
│   └── auth.js
├── services/        # Business logic
│   └── aiService.js
├── server.js        # Main server
└── socket.js        # WebSocket config
```

---

## 🔌 API Quick Reference

### Authentication
```http
POST /api/auth/login
POST /api/auth/register
GET /api/auth/me
```

### Notes
```http
GET /api/notes
POST /api/notes
PUT /api/notes/:id
DELETE /api/notes/:id
```


### AI Features
```http
POST /api/ai/generate-notes
POST /api/ai/explain
POST /api/ai/generate-quiz
```

### Sync Spaces
```http
GET /api/sync-spaces
POST /api/sync-spaces
POST /api/sync-spaces/:id/join
```

---

## 🛠 Common Development Tasks

### Adding a New Page
1. Create component in `frontend/src/pages/`
2. Add route in `App.jsx`
3. Add navigation link in `Sidebar.jsx`
4. Create corresponding API routes if needed

### Adding a New API Endpoint
1. Create route in `backend/routes/`
2. Add controller function in `backend/controllers/`
3. Register route in `server.js`
4. Add frontend service function in `services/api.js`

### Adding Real-time Features
1. Add socket event in `backend/socket.js`
2. Handle event in `frontend/src/context/SocketContext.js`
3. Use socket in components via `useSocket()` hook

### Database Operations
```javascript
// Create
const note = new Note({ title, content, user });
await note.save();

// Read
const notes = await Note.find({ user }).populate('course');

// Update
await Note.findByIdAndUpdate(id, { title, content });

// Delete
await Note.findByIdAndDelete(id);
```

---

## 🎨 UI Component Patterns

### Standard Component Structure
```jsx
const ComponentName = ({ prop1, prop2 }) => {
  const [state, setState] = useState(initialValue);
  
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  const handleAction = () => {
    // Event handlers
  };
  
  return (
    <div className="tailwind-classes">
      {/* Component JSX */}
    </div>
  );
};

export default ComponentName;
```

### Common Tailwind Patterns
```css
/* Card styling */
.card {
  @apply bg-white dark:bg-gray-800 rounded-xl shadow-md p-6;
}

/* Button styling */
.btn-primary {
  @apply bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg;
}

/* Input styling */
.input {
  @apply border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2;
}
```

---

## 🔧 Debugging Tips

### Frontend Debugging
```javascript
// React DevTools
// Check component state and props

// Console debugging
console.log('State:', state);
console.log('Props:', props);

// Network debugging
// Check Network tab in DevTools for API calls
```

### Backend Debugging
```javascript
// Console logging
console.log('Request body:', req.body);
console.log('User:', req.user);

// Error handling
try {
  // Code that might fail
} catch (error) {
  console.error('Error:', error);
  res.status(500).json({ error: error.message });
}
```

### Database Debugging
```javascript
// Mongoose debugging
mongoose.set('debug', true);

// Query debugging
const query = Note.find({ user });
console.log('Query:', query.getQuery());
```

---

## 📱 PWA Features

### Service Worker Registration
```javascript
// In main.jsx
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

### Push Notifications
```javascript
// Request permission
const permission = await Notification.requestPermission();

// Subscribe to push
const subscription = await registration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: vapidPublicKey
});
```

---

## 🚀 Deployment Checklist

### Frontend (Vercel)
- [ ] Environment variables configured
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Domain configured

### Backend (Render/Railway)
- [ ] Environment variables set
- [ ] Database connection string updated
- [ ] CORS origins configured
- [ ] Health check endpoint working

### Database (MongoDB Atlas)
- [ ] Cluster created
- [ ] User credentials set
- [ ] IP whitelist configured
- [ ] Connection string obtained

---

## 🔍 Troubleshooting

### Common Issues
1. **CORS errors**: Check backend CORS configuration
2. **Auth failures**: Verify JWT secret and token format
3. **Database connection**: Check MongoDB URI and network access
4. **Build failures**: Check for missing dependencies
5. **Socket connection**: Verify WebSocket URL and authentication

### Performance Issues
1. **Slow API responses**: Add database indexes
2. **Large bundle size**: Implement code splitting
3. **Memory leaks**: Check for unsubscribed event listeners
4. **Slow rendering**: Use React.memo and useMemo

This quick reference provides immediate access to the most commonly needed information for developing and maintaining the Student Buddy application. 🎓✨
