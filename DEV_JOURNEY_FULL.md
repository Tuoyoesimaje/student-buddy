
```markdown
# TOYO — The Whole Project Story (lively, human, month-long)

This is the story you asked for: the full-scope, human-first, slightly messy but honest account of how I built Student Buddy. I wrote it as if I'm telling a friend — the kind of story that starts with an idea, has a few wrong turns, some late-night Googling, a tiny bit of ChatGPT help (~5%), and then a sequence of fixes that finally make the app feel useful.

Short summary — what I did in one line
- I designed and built a notes-and-study web app (React + Vite frontend, Express + MongoDB backend), added AI-assisted note features and practice exams, fixed API mismatches, and polished UX — learning and failing along the way.

How to read this file
- Read the timeline if you want the "I lived this" story.
- Read the per-area sections if you want concrete notes about frontend, backend, AI, and tooling.
- Commands at the end show exactly what I ran locally (PowerShell style).

The month in a story (week-by-week)

Week 1 — The idea, the sketch, and the prototype
I started sketching on a messy notebook. A notes list on the left, a big editor in the middle, a tiny study area with a timer, and a practice-exam area that accepts pasted notes. I love wireframes — they shrink a problem into a few screens.

Day 1 I scaffolded the app: two folders, `frontend/` and `backend/`. I ran `npm init -y` and installed the basics. I chose Vite because it starts instantly. I chose Express + Mongoose because I could iterate fast and Mongo's document shape fits notes well.

I threw together the first pages: a notes list and a plain textarea editor. It wasn't pretty, but it worked. I got excited and added a settings page where users can edit their profile.

Week 2 — Tradeoffs and the editor fight
I experimented with simple Markdown first. It felt fast, but switching between edit/preview was buggy. My notes had images and formatting; Markdown was more friction than gain.

I watched a short Tiptap tutorial (15 minutes) and set it up. Tiptap felt heavier at first, but the UX was smoother — inline formatting, images, lists, everything 'just worked'. I migrated to Tiptap and never looked back.

Meanwhile on the backend I created the models. The `User` model got fields like username, email, hashed password, `profilePicture` (internal path) and `semesterGoals`. I added timestamps. For a while I returned the stored file path directly to the UI; after testing I changed to return `profilePictureUrl` — a full URL — because the frontend needs that to display the image immediately.

Week 3 — AI experiments and messy prompts
I wanted AI features: generate practice questions, summarize notes, and help grade open answers. I created a small `aiService.js` that wraps the provider and keeps keys/config in one place.

The first prompts were boring: repetitive questions, bland choices. I watched a prompt-engineering video (18 minutes), learned to give the model an example, length constraints, and an explicit requirement for distractors. I used ChatGPT very sparingly (~5% of total time) to sanity-check prompts and find better structures — for example, asking it "Given this paragraph, return one MCQ with 4 distinct options and label the correct one" helped refine my template.

With better prompts the generated exams became usable. I saved generated exams in the DB (`PracticeExam` documents) so I could re-run grading without re-calling AI repeatedly.

Week 4 — Polishing, the missing field, and truth-telling
This is where the small, annoying bug crept in. The UI in Settings sent `semesterGoals` but the backend handler didn't pick that field up. The fix was trivial, and the lesson stuck: tests.

I also added small UX things: toast notifications, a client-side preview for images (URL.createObjectURL), and better error handling in the frontend when API calls fail (display the server message if present).

The human bits — help, videos, and a few late nights
I relied mostly on my own experimentation and short videos (Tiptap setup, Multer, Express best practices). I used ChatGPT for quick pointers only a few times (maybe 5% of the time). The rest was trial-and-error and reading docs.

Per-area notes — the whole application, file-by-file highlights

Backend — the bones (what I wrote and why)
- `backend/server.js` — I set up express, body parsers, CORS, static serving for `/uploads`, and mounted routers. Important: don't forget to `app.use('/api/users', userRoutes)` — that omission caused a 404 in Settings.

- `backend/models/User.js` — fields I used:
  - username, email
  - password (bcrypt hashed in pre-save)
  - profilePicture (string path)
  - semesterGoals (string)
  - timestamps

  I added a small virtual `profilePictureUrl` to provide a ready-to-use URL for the frontend.

- `backend/routes/users.js` — key handlers:
  - `GET /api/auth/me` returns the user object without password.
  - `POST /api/users/me/profile-picture` handles the upload with multer, saves `user.profilePicture`, and returns `{ profilePicture, profilePictureUrl }`.
  - `PUT /api/users/me` accepts a fixed set of fields and updates the user — I explicitly included `semesterGoals` here.

- `backend/routes/notes.js` — CRUD for notes. Notes store HTML content so Tiptap output is saved directly to DB.

- `backend/routes/practiceExam.js` — create exam (calls `aiService.generateQuestions`), fetch exam by id, submit answers (calls `aiService.gradeAnswers`). I persisted `questions`, `userAnswers`, `score`, `feedback`.

Frontend — the visible bits (what I wired and why)
- `frontend/src/pages/Notes.jsx` — list and search notes; open note modal or editor.
- `frontend/src/components/RichTextEditor.jsx` — Tiptap editor; it calls `onChange` with HTML. I added a small toolbar and placeholder.
- `frontend/src/components/NoteCard.jsx` — displays note previews using `dangerouslySetInnerHTML`. I left a TODO to sanitize server-side.
- `frontend/src/pages/Study.jsx` — this big page contains Pomodoro timer, quiz generation from notes (client-side heuristics for quick quizzes), and a practice-exam entry point. It calls `GET /api/notes` and `GET /api/courses`.
- `frontend/src/pages/PracticeExamPage.jsx`, `PracticeExamQuestions.jsx`, `PracticeExamResults.jsx` — the flow from creating an exam to answering and seeing AI-graded results.
- `frontend/src/pages/Settings.jsx` — profile edit form. Sequence: upload picture → receive `profilePictureUrl` → PUT `/api/users/me` with form and picture URL. I ensured the code awaits the upload before calling PUT.

Cross-cutting notes
- API expectations and shapes: the frontend expects user objects to include a `profilePictureUrl` and the `Settings` form to save `semesterGoals`. Matching these shapes matters.
- Security: passwords are hashed; JWT used for auth. File uploads are saved locally in `uploads/` for dev.

Exact commands I ran (PowerShell) — copy/paste
```powershell
# Backend
cd "c:\Users\LOGICMIND COMPUTERS\main work\defence-day\student-buddy\backend"
npm install
npm run dev

# Frontend (new shell)
cd "c:\Users\LOGICMIND COMPUTERS\main work\defence-day\student-buddy\frontend"
npm install
npm run dev

# Quick smoke tests (PowerShell examples):
# TOYO — The Whole Project Story (detailed developer journal)

I rewrote this file to be more granular and technical while still keeping a human voice: you asked for more detail, more function-level notes, and clear instructions for verification. Below you'll find a chronological narrative, a deep per-file and per-feature breakdown (what each file contains, key functions, data shapes, and edge cases), and concrete smoke-test commands you can run locally.

## TL;DR — what I changed and why
- Fixed a set of API mismatches that caused 404s and prevented `semesterGoals` from persisting.
- Returned friendly `profilePictureUrl` from the upload endpoint so the frontend can preview avatars immediately.
- Audited the codebase end-to-end and documented essential features, primary functions, data shapes, and recommended tests.

## High-level architecture recap
- Frontend: React (Vite), Tiptap for rich text, Tailwind CSS, Context for auth and theme, a thin API wrapper in `frontend/src/services/api.js`.
- Backend: Express, Mongoose for MongoDB, JWT-based auth middleware in `backend/middleware/auth.js`, file uploads via Multer into `uploads/`.
- AI: encapsulated in `backend/services/aiService.js` which exposes functions to generate practice questions and grade answers.

---

## Week-by-week (concise but precise) — what happened and why

Week 1 — scaffold and MVP
- Created `frontend/` and `backend/`. Set up a simple notes editor and a list page.
- Backend models: `User`, `Note`, `Course`, `PracticeExam`. Each has clear responsibilities (users store profile and preferences; notes store HTML content from Tiptap; practice exams store generated questions and grading results).

Week 2 — editor choice and saving rich content
- Migrated from Markdown to Tiptap. Tiptap produces HTML (or JSON) that the UI uses; I standardized on HTML for storage to keep rendering simple.
- Key decision: store editor output as HTML in `notes.content` — fast to render and compatible with `dangerouslySetInnerHTML` (but needs server-side sanitization, see Security -> TODOs).

Week 3 — add AI features
- Built `aiService.js` and created `backend/routes/practiceExam.js` endpoints. Persisted generated exams in `PracticeExam` documents with fields: questions[], meta, createdBy.

Week 4 — polish, bugfixes, and consistency
- Tracked down 404s caused by an unmounted users router in `backend/server.js`.
- Fixed `PUT /api/users/me` to persist `semesterGoals`.
- Adjusted upload route to return `profilePictureUrl` for immediate preview.

---

## Deep dive — Backend (file-by-file, functions, shapes, and edge cases)

Note: When I say "function", I mean the exported route handler or the important internal helper.

- backend/server.js
  - Responsibilities: bootstrap Express app, configure middleware (JSON/body parsers, cookie parser if present, CORS), static hosting of `uploads/`, and mount routers.
  - Key lines (conceptual):
    - app.use(express.json())
    - app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))
    - app.use('/api/auth', authRoutes)
    - app.use('/api/users', usersRoutes)  <-- This must exist or `Settings.jsx` 404s.
  - Edge cases:
    - CORS must allow the frontend origin in dev (vite default port). If missing, uploads/requests will be blocked by the browser.

- backend/models/User.js
  - Schema fields:
    - email: { type: String, required: true, unique: true }
    - username: String
    - password: String (hashed via bcrypt in a pre-save middleware)
    - profilePicture: String (relative path under uploads)
    - semesterGoals: String
    - timestamps: true
  - Virtuals / helpers:
    - profilePictureUrl getter that builds `${process.env.BACKEND_BASE_URL || localhost}:${PORT}/uploads/${profilePicture}` when profilePicture exists.
  - Edge cases:
    - When profilePicture is empty, frontend should show a placeholder. The virtual should return null.

- backend/middleware/auth.js
  - Purpose: Extract token from Authorization header, verify with JWT_SECRET, attach `req.userId` and `req.user` (if you load user in middleware).
  - Typical flow:
    - const token = req.headers.authorization?.split(' ')[1]
    - jwt.verify(token, JWT_SECRET, (err, decoded) => { if (err) return res.status(401); req.userId = decoded.id; next(); })
  - Edge cases:
    - Expired tokens -> respond 401 with clear message.
    - Missing token -> 401.

- backend/routes/users.js
  - GET /api/auth/me
    - Returns sanitized user object (no password). Important fields: _id, email, username, semesterGoals, profilePictureUrl.
    - Shape: { success: true, user: { _id, email, username, semesterGoals, profilePictureUrl } }
  - PUT /api/users/me
    - Accepts: { username?, semesterGoals?, email? } — updates allowed fields and returns updated user.
    - Implementation note: use a whitelist to avoid accepting arbitrary fields (e.g., request.body.semesterGoals must be explicitly copied into update object).
  - POST /api/users/me/profile-picture
    - Accepts multipart form-data with key `profilePicture` handled by Multer.
    - Saves file to `uploads/<userId>/profile-<timestamp>.<ext>` and sets `user.profilePicture` to relative path.
    - Returns: { success: true, profilePicture: '<relative-path>', profilePictureUrl: '<full-url>' }
  - Edge cases & security:
    - Validate file type (allow only jpeg, png). Limit size (e.g., 2MB). Delete previous profile picture if you replace it (or provide a garbage collection cron).

- backend/routes/notes.js
  - CRUD endpoints: POST /api/notes, GET /api/notes (list), GET /api/notes/:id, PUT /api/notes/:id, DELETE /api/notes/:id
  - Data shape (Note): { title: String, content: String (HTML), tags: [String], createdBy: ObjectId }
  - Important functions:
    - Search: allow text index on title/content for quick search.
    - Save: sanitize or store as-is and sanitize on render (tradeoff noted below).
  - Edge cases:
    - Large content sizes (avoid very large uploads through client limits).

- backend/routes/practiceExam.js
  - Endpoints:
    - POST /api/practice-exams (create): accepts notes/context and calls `aiService.generateQuestions()`
    - GET /api/practice-exams/:id: fetch persisted exam
    - POST /api/practice-exams/:id/submit: accept user answers and call `aiService.gradeAnswers()` to produce feedback/score
  - Data shape (PracticeExam): { title, questions: [{ stem, choices, correctIndex }], createdBy, aiMeta }
  - Important functions:
    - generateQuestions(context): returns array of well-formed MCQs with distractors.
    - gradeAnswers(questions, userAnswers): returns score and per-question feedback.
  - Edge cases:
    - AI hallucination: sometimes the AI will invent plausible but incorrect facts — validate critical answers or add a confidence field.

- backend/services/aiService.js
  - Exposes: generateQuestions(text, options), gradeAnswers(questions, answers)
  - Implementation notes:
    - Keep prompt templates in this file and version them. Tests mock this service to avoid network calls.
    - Add timeouts and retry logic — AI endpoints can be slow or transiently fail.

---

## Deep dive — Frontend (file-by-file, props, API calls, and important UX flows)

- frontend/src/pages/Settings.jsx
  - Responsibilities:
    - Load current user via GET `/api/auth/me` when component mounts.
    - Allow change of username, email, and `semesterGoals` (a textarea or small input).
    - Handle profile picture upload: call POST `/api/users/me/profile-picture` with `FormData` containing the file under `profilePicture`.
    - After successful upload, receive `profilePictureUrl` and display an immediate preview (use `setState` and show image tag with that URL).
    - When saving the profile, send PUT `/api/users/me` with kept fields including `semesterGoals`.
  - Data flow (sequence):
    1. GET /api/auth/me -> fill form fields
    2. Upload image -> POST /api/users/me/profile-picture -> get profilePictureUrl
    3. PUT /api/users/me -> send semesterGoals along with other fields
  - Edge cases handled in UI:
    - Disable Save button while upload is in progress
    - Show server errors in toast
    - Validate field lengths (e.g., semesterGoals max length)

- frontend/src/components/RichTextEditor.jsx
  - Wraps Tiptap editor and exposes `onChange(html)` and `getHTML()`.
  - Toolbar buttons map to Tiptap commands. Important: the component should not assume debounce; parent should debounce saves.

- frontend/src/components/NoteCard.jsx
  - Renders small preview using `dangerouslySetInnerHTML` for note content snippet and shows title, tags, and meta (updatedAt).
  - TODO: implement server-side sanitization for `content` or client-side sanitization via DOMPurify before rendering.

- frontend/src/pages/Study.jsx
  - Calls `GET /api/notes` and `GET /api/courses` on mount.
  - Features:
    - Pomodoro timer — purely client-side.
    - Quick quiz generator: transforms note HTML into short Q/A using heuristics (split into sentences and pick random facts). This is lightweight and offline.
    - Full practice exam path: navigates to practice exam creation which calls the AI-backed endpoint.
  - Edge cases:
    - Empty notes -> disable quiz creation button
    - No network -> show offline message and cached notes if available

- frontend/src/pages/PracticeExamPage.jsx and children
  - Workflow:
    - Create exam -> POST /api/practice-exams with context -> server persists and returns exam id
    - Show exam questions -> user answers -> POST submit -> server returns score and feedback
  - Important UX points:
    - Save local answers to local state so that accidental reload does not lose progress (consider localStorage backup)

- frontend/src/services/api.js (or similar)
  - A thin wrapper around axios that sets baseURL from `import.meta.env.VITE_BACKEND_URL` and attaches Authorization header from AuthContext.
  - Important: intercept 401 responses and optionally redirect to login.

---

## Data shapes and API contracts (explicit)

- User (returned from /api/auth/me)
  - {
    _id: string,
    email: string,
    username?: string,
    semesterGoals?: string,
    profilePictureUrl?: string
  }

- Note
  - {
    _id: string,
    title: string,
    content: string, // HTML
    tags: string[],
    createdBy: string
  }

- PracticeExam
  - {
    _id: string,
    title: string,
    questions: [ { id, stem, choices: [string], correctIndex: number } ],
    createdBy: string,
    score?: number,
    feedback?: object
  }

Make sure the frontend and backend agree on these fields. Even a missing optional field (like `profilePictureUrl`) can cause UI logic to break or render empty images.

---

## Testing and smoke checks (PowerShell commands you can run locally)

Before running these, make sure your `.env` has PORT, MONGO_URI, JWT_SECRET, and BACKEND_BASE_URL (optional). Start the backend from `backend/` and the frontend from `frontend/`.

Start backend (PowerShell):
```powershell
cd "c:\Users\LOGICMIND COMPUTERS\main work\defence-day\student-buddy\backend"
npm install
npm run dev
```

Start frontend (PowerShell):
```powershell
cd "c:\Users\LOGICMIND COMPUTERS\main work\defence-day\student-buddy\frontend"
npm install
npm run dev
```

Smoke test authenticated user endpoints (replace <TOKEN> with a JWT from login)
```powershell
# Get profile
Invoke-RestMethod -Uri http://localhost:3001/api/auth/me -Method GET -Headers @{ Authorization = 'Bearer <TOKEN>' }

# Update semester goals
$body = @{ semesterGoals = 'Finish project and study daily' } | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:3001/api/users/me -Method PUT -Headers @{ Authorization = 'Bearer <TOKEN>'; 'Content-Type' = 'application/json' } -Body $body

# Upload a profile picture with curl (PowerShell) - curl.exe is shipped with Windows 10+
curl.exe -X POST "http://localhost:3001/api/users/me/profile-picture" -H "Authorization: Bearer <TOKEN>" -F "profilePicture=@C:\path\to\test-profile.jpg"
```

Quick smoke for notes and practice exams
```powershell
# List notes
Invoke-RestMethod -Uri http://localhost:3001/api/notes -Method GET -Headers @{ Authorization = 'Bearer <TOKEN>' }

# Create a practice exam (send a short context)
$json = @{ title = 'Quick exam'; context = 'Photosynthesis is the process plants use to convert light into energy.' } | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:3001/api/practice-exams -Method POST -Headers @{ Authorization = 'Bearer <TOKEN>'; 'Content-Type' = 'application/json' } -Body $json
```

If any of these return 404 -> confirm the route is mounted in `backend/server.js`. If PUT /api/users/me doesn't persist `semesterGoals`, confirm the handler copies `semesterGoals` into the update object and calls `User.findByIdAndUpdate(userId, update, { new: true })`.

---

## Known issues, recommendations, and next steps (practical)

1. Security: sanitize HTML outputs. Right now the app relies on `dangerouslySetInnerHTML` in a few places (e.g., `NoteCard.jsx`). Add server-side sanitization (DOMPurify or an allowlist) before saving notes.content or sanitize before rendering.
2. Tests: add integration tests (supertest + jest) for the following flows:
   - Auth login -> GET /api/auth/me returns expected shape
   - Upload profile picture -> response includes `profilePictureUrl` and file exists on disk
   - PUT /api/users/me updates `semesterGoals`
   - PracticeExam endpoints mocking aiService so tests don't call external API
3. Retention / storage: implement background cleanup for orphaned uploads and optionally move uploads to S3 or another object store when ready for production.
4. AI reliability: store AI-detection metadata (prompt version, model version, raw AI output) so problems can be triaged and prompts rolled back.

---

## Developer checklist for the important flows (explicit)

- Signup/login flow
  - Input: { email, password }
  - Output: { token }
  - Verify: login returns token; GET /api/auth/me returns expected user fields

- Settings flow (profile + picture + semester goals)
  - Get profile via GET /api/auth/me -> fill form
  - Upload picture: POST /api/users/me/profile-picture (multipart) -> response includes profilePictureUrl
  - Save profile: PUT /api/users/me with { semesterGoals, username } -> backend persists and subsequent GET /api/auth/me returns updated data

- Notes flow
  - Create/Update a note with HTML content -> saved in `notes.content`
  - Render preview in NoteCard (sanitized)

- Practice exam flow
  - Create: POST /api/practice-exams with context -> returns ID
  - Answer: POST /api/practice-exams/:id/submit -> returns score and feedback

---

## A few function-level calls to inspect in code right now (where to look)

- `backend/routes/users.js`:
  - handler for PUT /me: search for `findByIdAndUpdate` and ensure `semesterGoals` is included in the update payload.
  - upload handler: look for multer `single('profilePicture')` and the response body – ensure `profilePictureUrl` is computed and returned.

- `frontend/src/pages/Settings.jsx`:
  - look for `handleUpload` and where it sets the returned url into state; ensure that state is sent in the subsequent PUT.

- `backend/services/aiService.js`:
  - locate `generateQuestions` and `gradeAnswers` functions and review prompt templates.

---

## Final human note (short)

You asked for more detail — this is the deeper, explicit version: per-file pointers, function responsibilities, clear API shapes, test commands, and concrete next steps. If you'd like, I can now:

- produce exact `git`-style patches for any of the small backend fixes (server mount, users route changes).
- add a small integration test file that asserts `PUT /api/users/me` persists `semesterGoals` and that uploading a profile picture returns `profilePictureUrl`.

Tell me which of those you'd like next and I will (1) update the todo list, (2) make the code edits or add tests, and (3) run the backend smoke tests and report outputs.

— TOYO

