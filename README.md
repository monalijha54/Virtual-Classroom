# Classly — Virtual Classroom V1

A college-project-ready virtual classroom built with **React + TypeScript + Tailwind CSS + Supabase + Jitsi Meet**.

## V1 features

### Teacher
- Separate teacher login / signup
- Secure teacher-role claim using an access code stored only in the database
- Create classrooms and share a 6-character class code
- Post announcements
- Upload PDF/JPG/PNG notes (private Supabase Storage)
- Create MCQ quizzes with marks and duration
- Publish/unpublish quizzes
- View every student's quiz result and class average
- Start/end an embedded Jitsi live class

### Student
- Separate student login / signup
- Join classroom using class code
- Read announcements
- View/download notes using signed links
- Join live classes
- Take timed MCQ quizzes
- Automatic server-side grading
- See score, percentage, and answer review after submission

## Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Supabase Auth
- Supabase PostgreSQL + Row Level Security
- Supabase Storage
- Jitsi Meet IFrame API
- React Router
- Vercel / Netlify compatible

---

## 1. Create a Supabase project

Create a new project at Supabase.

For the easiest college demo, go to **Authentication → Providers → Email** and turn off **Confirm email**. You can leave email confirmation enabled if you want, but teachers must sign in after confirmation and enter the teacher access code on their first teacher login.

## 2. Run the database setup

Open **Supabase → SQL Editor → New query**.

Copy the entire contents of:

```text
supabase/schema.sql
```

and run it once on a new project.

### Teacher access code

The default teacher code is:

```text
COLLEGE2026
```

Change it before running the SQL by editing this line in `supabase/schema.sql`:

```sql
digest('COLLEGE2026', 'sha256')
```

Students never need this code.

## 3. Add environment variables

Copy:

```text
.env.example
```

to:

```text
.env.local
```

Then add the values shown in your Supabase project's **Connect** panel:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

Use the publishable/anon browser key — **never put a Supabase service-role key in this website**.

## 4. Install and run

```bash
npm install
npm run dev
```

Open the local URL shown by Vite, normally:

```text
http://localhost:5173
```

## 5. Build for production

```bash
npm run build
```

The production site is generated in `dist/`.

## Demo flow

### Teacher
1. Open `/teacher/login`.
2. Create a teacher account.
3. Enter the teacher access code.
4. Create a classroom.
5. Copy its class code.
6. Upload notes.
7. Create and publish a quiz.
8. Start a live class.

### Student
1. Open `/student/login` in another browser/incognito window.
2. Create a student account.
3. Join using the teacher's class code.
4. Open notes and announcements.
5. Take the quiz.
6. View the automatic result.
7. Join the live class.

Then return to the teacher account and open **Quiz → Results** to see the student's score.

## Important V1 design decisions

- Quizzes are MCQ-only to keep the first version manageable.
- Correct quiz answers are not fetched directly into the student browser before submission.
- `submit_quiz()` grades the answers in PostgreSQL and stores the result.
- Notes are in a private Storage bucket; the app generates temporary signed URLs when someone opens a file.
- Data access is protected using Supabase Row Level Security rather than frontend-only checks.
- Video calling is embedded with Jitsi instead of building WebRTC/signalling/TURN infrastructure from scratch.

## Suggested future scope (do not add before the college V1 is finished)

- Assignments and submissions
- Attendance
- Class chat
- Recorded lectures
- Calendar
- Notifications
- Descriptive questions/manual grading
- AI quiz generation
- Advanced analytics

## Deployment

### Vercel
1. Push this project to GitHub.
2. Import the repository into Vercel.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` under project environment variables.
4. Build command: `npm run build`.
5. Output directory: `dist`.

### Netlify
The same Vite project works on Netlify. Set the same environment variables and use `npm run build` with `dist` as the publish directory.

## Notes

The public `meet.jit.si` deployment is convenient for this academic V1. For a production learning platform, evaluate Jitsi's hosted/self-hosted options, meeting moderation, authentication, privacy requirements, and scaling separately.
