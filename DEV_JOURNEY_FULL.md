
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
# Replace <TOKEN> with a real JWT from login
Invoke-RestMethod -Uri http://localhost:3001/api/auth/me -Method GET -Headers @{ Authorization = 'Bearer <TOKEN>' }

# Update profile (semester goals)
$body = @{ semesterGoals = 'Finish project and study daily' } | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:3001/api/users/me -Method PUT -Headers @{ Authorization = 'Bearer <TOKEN>'; 'Content-Type' = 'application/json' } -Body $body

# Upload profile picture (PowerShell multipart example)
# Use a tool (like Postman) or curl for multipart in Windows; PowerShell's Invoke-RestMethod has limitations for multipart.
```

Where I used ChatGPT and why (short and honest)
- I used ChatGPT for small, pointed questions — about prompt templates and a code-review nudge when I couldn't see why a field wasn't persisting. Roughly 5% of my problem solving used ChatGPT; most was reading docs and tinkering.

What I failed at and learned
- I tried Markdown-first editing; it slowed me down. Switching to Tiptap made the product feel polished faster.
- I left out a field in a handler — a silly mistake that made me appreciate integration tests.

If you want patches or timestamps
- I can produce exact patches for the small fixes I described (server mount, include semesterGoals, return profilePictureUrl). I can also add timestamped micro-logs for each edit.

Final little human note
- I wrote this as TOYO because you asked me to be human-first. I built this with coffee, a few frustrated sighs, tutorial videos, and tiny moments of triumph when the app actually saved a profile picture and showed it immediately. That's the joy of building: small wins.

— TOYO

