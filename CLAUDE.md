# ANTS Trail — CLAUDE.md

## Project Overview

**ANTS Trail** (Automated New-hire Training System) is a full-stack learning management platform built for Nous Information Technology. It onboards new hires by assigning them a structured learning roadmap of 110 courses and projects, letting them track progress, and giving admins a live dashboard to monitor cohort advancement.

Key capabilities:
- Role-based access: `learner` and `admin`
- Learning profiles (learning paths) assigned to users on first login
- Module-level progress tracking with a slider UI (explicit submit to save)
- Smart scheduling — modules have estimated times, start dates, and early-start support
- Admin dashboard: sprint matrix, CSV export, risk flags, nudge, drill-down per learner
- Authentication: email/password (JWT) + optional Microsoft Azure AD SSO
- Domain restriction: only `@nousinfo.com` emails can register

---

## Tech Stack

### Frontend
| Layer | Technology | Version |
|---|---|---|
| Framework | React | 18.2.0 |
| Language | TypeScript | 6.0.3 |
| Build tool | Vite | 5.0.12 |
| Routing | React Router DOM | 6.22.0 |
| HTTP client | Axios | 1.6.7 |
| Styling | Tailwind CSS | 3.4.1 |
| CSS utilities | clsx + tailwind-merge | — |
| UI primitives | shadcn/ui-style components | (inlined in `src/components/ui/`) |

### Backend
| Layer | Technology |
|---|---|
| Framework | FastAPI |
| ASGI server | Uvicorn[standard] |
| ORM | SQLAlchemy |
| Validation | Pydantic v2 (with email support) |
| Auth | python-jose[cryptography] (JWT HS256) + bcrypt |
| DB driver | mysqlclient |
| Config | python-dotenv |
| HTTP client | httpx (Azure AD SSO calls) |

### Database
- **MySQL 8.0**, database name: `nousqa_platform`
- Schema is **code-first** — SQLAlchemy models auto-create tables on startup
- Seed data (admin user + all 110 modules) loaded from `backend/course_matrix.json` via `backend/seed.py`

### Infrastructure
- **Docker Compose** — three services: `db` (MySQL), `backend` (FastAPI), `frontend` (Vite)
- No Kubernetes or cloud-specific config in repo at this time

---

## Architecture Notes

### Folder Structure

```
ANTS_Prod/
├── frontend/
│   ├── src/
│   │   ├── pages/          # Full-page route components
│   │   ├── components/     # Shared UI components
│   │   │   └── ui/         # Primitive building blocks (button, card, badge…)
│   │   ├── context/        # React Context providers (AuthContext)
│   │   ├── lib/            # Utilities (cn() Tailwind merge helper)
│   │   ├── api.js          # Axios instance with Bearer token interceptor
│   │   ├── App.tsx         # Route definitions
│   │   └── main.tsx        # Entry point
│   ├── vite.config.js      # Dev proxy: /api → http://127.0.0.1:8000
│   └── tailwind.config.js
│
├── backend/
│   ├── main.py             # FastAPI app, CORS middleware, router registration
│   ├── config.py           # Settings from .env
│   ├── database.py         # SQLAlchemy engine + get_db() dependency
│   ├── seed.py             # Seeds admin + modules on startup
│   ├── models/             # SQLAlchemy ORM models
│   ├── routes/             # FastAPI route handlers (thin — delegate to services)
│   ├── schemas/            # Pydantic request/response models
│   ├── services/           # Business logic
│   └── middleware/         # auth_middleware.py: get_current_user, admin_required
│
├── docker-compose.yml
├── TECH_DOCUMENT.md        # Detailed technical reference
├── ANTS_Database_Design.docx
└── ANTS_TRAIL_TECH_FLOWS V.1.html
```

### Request Flow

```
Browser → Vite dev proxy (/api/*) → FastAPI (port 8000)
                                         ↓
                                   auth_middleware (JWT decode)
                                         ↓
                                   routes/ (validate input via Pydantic)
                                         ↓
                                   services/ (business logic)
                                         ↓
                                   models/ via SQLAlchemy → MySQL
```

### Auth Flow

1. User logs in → backend returns JWT (HS256, 8-hour expiry)
2. Frontend stores `token`, `role`, `user_id`, `full_name` in `localStorage`
3. `api.js` Axios interceptor injects `Authorization: Bearer {token}` on every request
4. `ProtectedRoute` redirects unauthenticated users to `/login`
5. `AdminRoute` gates admin-only pages by checking `role === 'admin'`

### Key Routes (frontend)

| Path | Component | Access |
|---|---|---|
| `/login` | LoginPage | Public |
| `/register` | RegisterPage | Public |
| `/select-profile` | ProfileSelect | Learner |
| `/roadmap` | RoadmapPage | Learner |
| `/admin` | AdminDashboard | Admin |
| `/programme-overview` | ProgrammeOverview | — |
| `/sso/callback` | SSOCallback | Public |

### Key API Endpoints (backend)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register (validates @nousinfo.com) |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/sso/login` | Public | Initiate Azure AD SSO |
| GET | `/api/auth/sso/callback` | Public | Azure AD OAuth2 callback |
| GET | `/api/profile/list` | Public | List learning profiles |
| POST | `/api/profile/select` | Bearer | Assign profile to user |
| GET | `/api/roadmap/…` | Bearer | Fetch user roadmap modules |
| POST | `/api/progress/…` | Bearer | Update module progress |
| GET | `/api/admin/dashboard` | Admin | Admin analytics |
| GET | `/api/health` | Public | Health check |

---

## Coding Conventions

### Frontend (TypeScript / React)

- **Page components**: `PascalCase` with a `Page` suffix — `LoginPage.tsx`, `RoadmapPage.tsx`
- **Shared components**: `PascalCase` — `Sidebar.tsx`, `ProgressBar.tsx`, `ProtectedRoute.tsx`
- **UI primitives** (`src/components/ui/`): `kebab-case` filenames — `button.tsx`, `dropdown-menu.tsx`
- **Context files**: `PascalCase` — `AuthContext.tsx`
- **Variables and functions**: `camelCase` — `handleSubmit`, `setEmail`, `isValidNousEmail()`
- **Types/Interfaces**: `PascalCase` — `UserState`, `AuthContextType`
- Use `cn()` from `src/lib/utils.ts` for all Tailwind class merging — never raw string concatenation
- Axios calls go through the shared `api.js` instance, never raw `fetch` or a second Axios instance

### Backend (Python / FastAPI)

- **Models**: `PascalCase` classes — `User`, `Profile`, `RoadmapModule`
- **DB table names**: `snake_case` — `users`, `user_profiles`, `roadmap_modules`
- **Functions**: `snake_case` — `get_user_by_email()`, `verify_password()`, `hash_password()`
- **Constants**: `UPPER_SNAKE_CASE` — `SECRET_KEY`, `ALLOWED_DOMAIN`, `ACCESS_TOKEN_EXPIRE_MINUTES`
- **Enums**: `PascalCase` class, lowercase values — `UserRole.learner`, `UserRole.admin`
- **Pydantic schemas**: `PascalCase` — `UserRegister`, `Token`, `ProfileOut`
- **API paths**: `kebab-case` — `/api/auth/sso/login`, not `/api/auth/ssoLogin`
- Routes stay thin — business logic lives in `services/`, not in route handlers
- Always use the `get_db()` dependency for DB sessions; never create a session manually outside it

---

## Commands to Know

### Local Development (without Docker)

**Backend**
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
# Copy and fill in .env
copy .env.example .env
python -m uvicorn main:app --reload --port 8000
```

**Frontend**
```powershell
cd frontend
npm install
npm run dev          # http://localhost:5173
```

**Seed the database** (run after backend is up and DB is created)
```powershell
cd backend
python seed.py
```

### Docker (recommended for full-stack)

```bash
# Build and start all three services
docker-compose up --build

# Stop everything
docker-compose down

# Wipe DB volume too
docker-compose down -v
```

Services after startup:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API docs (Swagger): http://localhost:8000/docs
- MySQL: localhost:3306

### Frontend Scripts

```bash
npm run dev       # Vite dev server with HMR
npm run build     # Production build → dist/
npm run preview   # Serve the production build locally
```

---

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in:

| Variable | Example | Notes |
|---|---|---|
| `DATABASE_URL` | `mysql+mysqldb://root:password@localhost:3306/nousqa_platform` | Use `@db:3306` inside Docker |
| `SECRET_KEY` | `(strong random string)` | Change before any non-local deployment |
| `ALLOWED_EMAIL_DOMAIN` | `nousinfo.com` | Domain whitelist for registration |
| `SSO_ENABLED` | `false` | Set `true` + fill Azure vars to enable SSO |
| `AZURE_TENANT_ID` | `xxxxxxxx-…` | Azure AD tenant |
| `AZURE_CLIENT_ID` | `xxxxxxxx-…` | Azure AD app registration |
| `AZURE_CLIENT_SECRET` | `…` | Azure AD client secret |
| `AZURE_REDIRECT_URI` | `http://localhost:8000/api/auth/sso/callback` | Must match Azure app registration |
| `FRONTEND_URL` | `http://localhost:5173` | Used for post-SSO redirect |

The frontend has no `.env` file — the Vite dev proxy in `vite.config.js` forwards `/api/*` to `http://127.0.0.1:8000`.

---

## What to Avoid

- **Do not touch `backend/seed.py` data** without coordinating with the team — it seeds the canonical 110-module course matrix. Changes here affect all environments.
- **Do not hardcode credentials** anywhere. The Docker Compose defaults (`password`, `change-me-in-production`) are for local dev only and must be overridden in any shared or production environment.
- **Do not bypass `ProtectedRoute`/`AdminRoute`** with direct navigation — all sensitive pages must stay behind these guards.
- **Do not add a second Axios instance** in the frontend. All API calls must go through `src/api.js` so the Bearer token interceptor applies uniformly.
- **Do not write raw SQL** in route handlers or services. Use SQLAlchemy ORM models and `get_db()`.
- **Do not store secrets in localStorage beyond what's already there** (`token`, `role`, `user_id`, `full_name`). Extend the auth schema or use a backend session if more state is needed.
- **Do not skip Pydantic schemas** for new endpoints. Every request and response body must be typed with a schema in `backend/schemas/`.
- **`ANTS_Database_Design.docx` and `ANTS_TRAIL_TECH_FLOWS V.1.html`** are reference documents — do not edit them; update `TECH_DOCUMENT.md` instead.
- **SQLAlchemy auto-creates tables on startup** — there are no migration scripts currently. Any destructive schema change (drop column, rename table) must be handled manually or by adding an Alembic migration.

---

## Team Preferences

### Commit Messages
- Use **imperative mood**: `feat: add progress slider submit button`, `fix: prevent sidebar flash on unauthenticated load`
- Prefix with type: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `style:`
- Reference the area: `feat(admin): add CSV export to dashboard`
- Keep the subject line under 72 characters

### PR Conventions
- Branch naming: `feature/<short-description>` or `fix/<short-description>` (e.g., `feature/smart-scheduling`)
- PRs should target `main`
- Include a short description of what changed and why
- UI changes: include a screenshot or recording

### General
- Dark aurora theme is intentional — do not replace with a light theme without explicit agreement
- The progress slider has a **locked minimum** to prevent regression — do not remove the floor constraint
- Progress requires an explicit **Submit** action to persist; do not auto-save on slider drag
- Registration is restricted to `@nousinfo.com` emails by `ALLOWED_EMAIL_DOMAIN` — this is a hard business requirement, not a bug
