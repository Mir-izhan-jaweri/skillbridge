# SkillBridge — AI-powered skill-to-opportunity matchmaker

Built for the **Alibaba Cloud AI Hackathon 2026** (Bano Qabil / Alkhidmat Foundation).

Users submit skills (typed or resume upload) → AI recommends matching freelance/job
opportunities → identifies skill gaps → recommends courses → shows market demand insights.

## Stack

| Layer | Choice |
|---|---|
| Frontend | React 19 (Vite), Tailwind CSS, Framer Motion, React Router |
| 3D (hero only, lazy-loaded) | React Three Fiber + drei |
| Backend | Python, Flask, Flask-JWT-Extended, Flask-Limiter, Flask-Cors |
| Database | SQLAlchemy + Flask-Migrate (SQLite locally, PostgreSQL in production) |
| AI | Alibaba Cloud Qwen (DashScope-compatible) with deterministic offline mock |
| Auth | JWT access + refresh (httpOnly cookie), bcrypt hashing |

## Quick start

### Backend

```bash
cd backend
python -m venv .venv
# Linux/macOS: source .venv/bin/activate  |  Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # adjust if needed; AI_MOCK=true by default
flask db upgrade              # or: python -m flask db upgrade (FLASK_APP=run.py)
python seed.py                # creates skills, opportunities, courses, demo users
python run.py                 # serves http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev                   # serves http://localhost:5173
```

### Demo accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@skillbridge.dev | Admin@123 |
| User | demo@skillbridge.dev | Demo@123 |

## Configuration

All secrets live in `backend/.env` (never committed). Key variables:

- `DATABASE_URL` — defaults to SQLite; set `postgresql+psycopg://user:pass@host:5432/skillbridge` for Postgres.
- `ALIBABA_CLOUD_API_KEY`, `QWEN_MODEL`, `QWEN_BASE_URL` — live AI integration.
- `AI_MOCK=true` — deterministic offline mode (default); falls back automatically if the API call fails.
- `FRONTEND_ORIGIN` — CORS allow-list (comma separated).
- `JWT_SECRET_KEY`, `SECRET_KEY` — change in production.

Frontend: `frontend/.env` with `VITE_API_URL` (defaults to `http://localhost:5000/api`).

## API overview

```
POST /api/auth/signup | /login | /logout | /refresh
GET|PUT /api/profile
POST /api/skills/analyze        # JSON {skills|text} or multipart resume file
GET  /api/opportunities         # ?type=&search=&skill= (+match scores when authed)
POST /api/opportunities/:id/save
GET  /api/courses               # ?skill=&search=
POST /api/courses/:id/enroll
GET  /api/insights/demand       # ?period=
GET  /api/admin/users | DELETE /api/admin/users/:id | GET /api/admin/analytics
CRUD /api/admin/opportunities | /api/admin/courses   (admin only)
GET  /api/health
```

Errors always use `{ "error": { "code", "message" } }`. Auth endpoints and AI calls are
rate-limited; refresh tokens are httpOnly cookies; access tokens live in memory only.

## Production

- **Frontend:** `npm run build` → deploy `dist/` to Vercel/Netlify; set `VITE_API_URL`.
- **Backend:** `backend/Dockerfile` → Render/Railway; set env vars in the dashboard
  (`DATABASE_URL`, `JWT_SECRET_KEY`, `ALIBABA_CLOUD_API_KEY`, `FRONTEND_ORIGIN`,
  `AI_MOCK=false`, `JWT_COOKIE_SECURE=true`).
- **Database:** managed PostgreSQL (Render/Supabase).

## Structure

```
skillbridge/
├── backend/
│   ├── app/
│   │   ├── ai/            # isolated Qwen client + prompts + offline mock
│   │   ├── middleware/    # auth guards, validators, error shape
│   │   ├── models/        # SQLAlchemy models
│   │   ├── routes/        # blueprints (auth, profile, skills, opps, courses, insights, admin)
│   │   └── services/      # matching, resume parsing, seeding
│   ├── migrations/        # Alembic via Flask-Migrate
│   └── run.py
└── frontend/
    └── src/
        ├── components/    # reusable UI kit (Button, Card, Modal, Toast, …)
        ├── context/       # Auth, Theme, Toast providers
        ├── hooks/         # useAuth, useFetch
        ├── layouts/       # AuthLayout, DashboardLayout
        ├── pages/         # Landing, Login, Signup, Dashboard, Opportunities, Courses, Profile, Admin
        └── services/      # axios instance + token refresh
```
