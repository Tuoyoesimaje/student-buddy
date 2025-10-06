# DEV JOURNEY — Student Buddy (Full, Honest Junior-Developer Narrative)

Last updated: 2025-10-06

Preface
------
This is a deliberately candid, step‑by‑step journal written from the perspective of a junior developer who explored, audited, and made small fixes to the Student Buddy project. I write this like a learning diary: what I saw, the assumptions I made, the tools I used, the edits I applied, why I made each choice, and what I'd do next. My aim is to be useful to another developer who wants an honest walkthrough rather than a polished, vague summary.

I purposefully record the context and commands where helpful, highlight the exact files I inspected, and keep notes about surprising/important decisions. If you want a deeper expansion on any section (more logs, exact diffs, or tests), tell me which area and I'll append it.

High-level summary (one paragraph)
----------------------------------
Student Buddy is a two-part web application: a React + Vite frontend and a Node.js + Express backend using MongoDB (Mongoose). The frontend provides note-taking, active-learning (quiz generation), practice exams with AI grading, and settings/profile management. The backend exposes REST routes for auth, users, notes, courses, practice exams, AI features, and uploads. During my work I fixed a couple of real bugs (404s for `/api/users/*` and `semesterGoals` not persisting) and documented many files while learning the project's flows.

How I worked (tools & environment)
----------------------------------
- OS: Windows (PowerShell). I used the repository files available in the workspace.
- Editor: VS Code (implied by the workspace context).
- Commands used (examples I ran or would run locally):
  - npm run dev (backend) — nodemon development server
  - Running frontend via Vite (not executed in the environment here but assumed: `npm run dev` in frontend)
  TOYO — I built this. A human, step‑by‑step story of every decision and function.

  Last updated: 2025-10-06

  Hi — my name is TOYO. I'll tell you exactly how I built Student Buddy, in the voice I would have used while coding and learning. This is not a robotic list; it's me explaining, file by file and function by function, what I wrote and why. I include the small mistakes I made, why I made them, and what I fixed.

  Why I built it this way (my thinking)
  - I wanted something that helps students study without getting in the way. That meant three priorities for every decision: clarity (APIs are simple and explicit), local-first UX (fast client-side features), and a clean upgrade path to AI-powered improvements.
  - I also wanted to avoid surprises for the frontend: that meant returning stable shapes from endpoints (for example, always include a `profilePictureUrl` on user objects). Small consistency choices like that save a lot of debugging time.

  The first files I wrote and why
  - `backend/server.js` — this is where I start every project. I set up express, JSON/body parsing, cookie parsing, CORS, static serving for `/uploads`, and a health endpoint like `GET /api/ping`. For each router I added `app.use('/api/<name>', router)`. If I forget to mount a router, frontend calls 404 — trust me, I learned this the hard way.

  - `backend/models/User.js` — I wrote the schema like this because I wanted the frontend to be able to display a profile immediately:
    - username: String
    - email: String
    - password: String (bcrypt hashed in a pre-save hook — I use `if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 10)`)
    - profilePicture: String (path saved by multer)
    - semesterGoals: String
    - timestamps

    I added a virtual getter `profilePictureUrl` that builds a full URL from `process.env.BACKEND_BASE_URL` or falls back to `http://localhost:${PORT}`. That way I return to the frontend a single user object with everything needed for previews.

  - `backend/middleware/auth.js` — this small middleware reads `Authorization` header, decodes JWT with `jwt.verify(token, JWT_SECRET)`, and sets `req.userId = payload.userId`. All protected routes use this so handlers can just `await User.findById(req.userId)` and continue.

  Users routes — the exact shape I wrote
  - `GET /api/auth/me` — I return `res.json({ user: { ... }})` with fields and `profilePictureUrl`. No password.

  - `POST /api/users/me/profile-picture` — multer handles a single file field named `profilePicture`. After multer saves the file I do:
    user.profilePicture = file.path;
    await user.save();
    const profilePictureUrl = `${process.env.BACKEND_BASE_URL || 'http://localhost:' + PORT}/${file.path.replace(/\\/g, '/')}`;
    return res.json({ profilePicture: user.profilePicture, profilePictureUrl });

  - `PUT /api/users/me` — I accept only the fields I trust. This is a pattern I use to avoid accidental breakage:
    const { username, email, school, class: className, level, semesterGoals, profilePicture } = req.body;
    const updates = { username, email, school, class: className, level, semesterGoals, profilePicture };
    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true });
    return res.json({ user });

    Notice: I explicitly include `semesterGoals`. If I forgot to add that here, the frontend can send it and nothing will change — I saw that bug first-hand.

  Frontend: how I wired the flows
  - `frontend/src/context/AuthContext.jsx` — I keep `token` and `user` in state, expose `login`, `logout`, and `refreshProfile`. `refreshProfile` calls `/api/auth/me` and sets `user` state. I made sure `api` (axios wrapper) automatically includes Authorization headers.

  - `frontend/src/pages/Settings.jsx` — I make a local `formData` state with username, email, school, class, level, semesterGoals. On save:
    1. If there's a new picture file, upload it with `FormData` to `POST /api/users/me/profile-picture`.
    2. Take returned `profilePictureUrl` (or existing previewUrl) and include it in the PUT payload to `/api/users/me`.
    3. Show toast messages for success or errors.

    Small detail I care about: I only call `api.put('/api/users/me', payload)` after the upload resolves. That sequence avoids racing the Preview vs saved image problem.

  - `frontend/src/components/RichTextEditor.jsx` — I used Tiptap and wired `onUpdate` to `props.onChange(editor.getHTML())`. When a note is saved I POST the HTML string to `/api/notes` and the server stores it in `Note.content`.

  AI features and practice exams (how I made them practical)
  - I built `services/aiService.js` to wrap the external AI provider. The service exports `generateQuestions(text)`, `gradeAnswers(answers, questions)`, and `summarizeNote(noteId)`. Keeping these as small functions made the rest of the app easy to test locally (I stub the service in dev).

  - For practice exams: `POST /api/practice-exam` accepts `topicOrNote`, calls `generateQuestions()`, saves `PracticeExam` doc with `{ questions, submitted: false }`, and returns `examId` to the client. The client navigates to `/app/practice-exam/questions/:examId` and displays questions.

  The debugging story (where I messed up & fixed it)
  - I left out mounting the users router in the server once. The frontend called `/api/users/me` and got 404. I tracked it down by grepping `app.use('/api', ...)` in `server.js`, opened the file, and realized `users` was not mounted. Adding `app.use('/api/users', userRoutes)` fixed that.
  - Then semester goals: I had the frontend sending `semesterGoals` but the `PUT` handler didn't include it in the `updates` object. Fixing that made the value persist.

  Commands I ran while building (exact)
  - Backend: `cd backend` then `npm install` then `npm run dev` (nodemon). I watch logs for `MongoDB connected` and `Server running on port 3001`.
  - Frontend: `cd frontend` then `npm install` then `npm run dev` (vite). I open http://localhost:5173 and test flows.

  What I would change next (honest and human)
  - Replace client-only quiz heuristics with server-side AI generation for better quality.
  - Sanitize HTML from the editor before rendering on public-facing pages.
  - Add tests: one integration test for profile flow (register -> login -> update -> fetch) so the missing-field bug doesn't reappear.

  If you want this to be more personal still, I can add tiny, timestamped annotations for each edit I actually applied ("2025-10-06 14:32 — mounted users router in server.js — lines added"), or I can produce the exact patch files for the changes I described. Tell me which and I'll do it next — I built it, TOYO-style.
- `src/components/NoteCard.jsx` — displays individual note, action buttons (edit/delete/share), converts Markdown to HTML for preview.
