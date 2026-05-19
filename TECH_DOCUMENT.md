# ANTS Trail — Technical Document

**App:** ANTS Trail  
**Tagline:** Where Trailblazers Are Built.  
**Powered by:** Nous Testree

---

## 1. Architecture Overview

```
┌─────────────────────┐        REST API         ┌──────────────────────┐
│   Frontend          │ ──────────────────────► │   Backend            │
│   React + Vite      │   Bearer JWT (HTTPS)    │   FastAPI (Python)   │
│   localhost:5173    │ ◄────────────────────── │   localhost:8000     │
└─────────────────────┘                         └──────────┬───────────┘
                                                            │ SQLAlchemy ORM
                                                 ┌──────────▼───────────┐
                                                 │   MySQL 8.0          │
                                                 │   nousqa_platform    │
                                                 │   localhost:3306     │
                                                 └──────────────────────┘
```

---

## 2. Frontend

### Stack

| Item | Technology | Version |
|---|---|---|
| Framework | React | 18.2.0 |
| Language | TypeScript | 6.0.3 |
| Build Tool | Vite | 5.0.12 |
| Routing | React Router DOM | 6.22.0 |
| HTTP Client | Axios | 1.6.7 |
| Styling | Tailwind CSS | 3.4.1 |
| CSS Utilities | clsx, tailwind-merge | 2.1.1 / 3.6.0 |

### Folder Structure

```
frontend/src/
├── pages/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── ProfileSelect.tsx
│   ├── RoadmapPage.tsx
│   ├── AdminDashboard.tsx
│   └── NotFound.tsx
├── components/
│   ├── Layout.tsx           # Sidebar + welcome header shell
│   ├── Navbar.tsx
│   ├── Sidebar.tsx
│   ├── ProtectedRoute.tsx   # Redirects unauthenticated users
│   ├── AdminRoute.tsx       # Restricts to admin role
│   ├── ProgressBar.tsx
│   └── ui/                  # Reusable primitives (Button, Card, Badge, etc.)
├── context/
│   └── AuthContext.tsx      # Global auth state via React Context
├── api.js                   # Axios instance with Bearer token interceptor
├── lib/
│   └── utils.ts             # Tailwind merge utility
├── App.tsx                  # Route definitions
└── main.tsx                 # Entry point
```

### Routing

| Path | Page | Access |
|---|---|---|
| `/` | Redirect → `/login` | Public |
| `/login` | LoginPage | Public |
| `/register` | RegisterPage | Public |
| `/select-profile` | ProfileSelect | Protected (learner) |
| `/roadmap` | RoadmapPage | Protected (learner) |
| `/admin` | AdminDashboard | Protected (admin only) |
| `*` | NotFound | — |

### Authentication Flow

- On login/register, the API returns a JWT token plus user metadata.
- Stored in `localStorage`: `token`, `role`, `user_id`, `full_name`.
- `AuthContext` hydrates state from localStorage on page load.
- `api.js` injects `Authorization: Bearer {token}` into every outgoing request via an Axios request interceptor.
- `ProtectedRoute` redirects to `/login` if no token is present.
- `AdminRoute` redirects if the user role is not `admin`.

### User State Shape

```ts
interface UserState {
  token: string;
  role: 'admin' | 'learner' | string;
  id: number;
  full_name: string;
}
```

---

## 3. Backend

### Stack

| Item | Technology |
|---|---|
| Framework | FastAPI |
| ASGI Server | Uvicorn (standard) |
| ORM | SQLAlchemy |
| Validation | Pydantic v2 (with email support) |
| Auth | python-jose (JWT, HS256) |
| Password Hashing | bcrypt |
| DB Driver | mysqlclient |
| Env Config | python-dotenv |

### Folder Structure

```
backend/
├── main.py                  # App entrypoint, middleware, route registration, DB init, seed
├── config.py                # Environment-based configuration
├── database.py              # SQLAlchemy engine, session factory, get_db() dependency
├── seed.py                  # Seeds admin user and modules from course_matrix.json
├── routes/
│   ├── auth.py              # POST /api/auth/login, /api/auth/register
│   ├── profile.py           # GET /api/profile/list, POST /api/profile/select
│   ├── roadmap.py           # Roadmap data endpoints
│   ├── progress.py          # Progress tracking endpoints
│   └── admin.py             # Admin dashboard endpoints
├── models/
│   ├── user.py              # User, UserRole
│   ├── profile.py           # Profile, UserProfile, ProfileState
│   ├── roadmap.py           # RoadmapModule, ProfileModule, ModuleType
│   └── progress.py          # ModuleProgressCurrent, ProgressEvents, AdminAuditLog
├── schemas/
│   ├── auth.py              # UserRegister, UserLogin, Token
│   ├── profile.py
│   ├── roadmap.py
│   └── progress.py
├── services/
│   ├── auth_service.py      # hash_password, verify_password, create_access_token, register_user
│   ├── roadmap_service.py
│   └── analytics_service.py
└── middleware/
    └── auth_middleware.py   # get_current_user(), admin_required() FastAPI dependencies
```

### Configuration (`config.py`)

| Variable | Default | Override |
|---|---|---|
| `DATABASE_URL` | `mysql+mysqldb://root:Nous@12345@localhost:3306/nousqa_platform` | `DATABASE_URL` env var |
| `SECRET_KEY` | (hardcoded dev key) | `SECRET_KEY` env var |
| `ALGORITHM` | `HS256` | — |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `480` (8 hours) | — |
| `SSO_ENABLED` | `false` | `SSO_ENABLED` env var |

### API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/profile/list` | Bearer | List all profiles |
| POST | `/api/profile/select` | Bearer | Assign profile to user |
| GET | `/api/roadmap/...` | Bearer | Fetch roadmap modules |
| POST | `/api/progress/...` | Bearer | Update module progress |
| GET | `/api/admin/dashboard` | Admin | Admin analytics |
| GET | `/api/health` | Public | Health check |

### Authentication

- **Token type:** JWT signed with HS256, expires in 8 hours.
- **Password storage:** bcrypt hashed, never stored plain.
- **Middleware (`auth_middleware.py`):**
  - `get_current_user()` — FastAPI dependency, validates Bearer token, returns user object. Raises `401` on failure.
  - `admin_required()` — Extends `get_current_user()`, raises `403` if role is not `admin`.
- **CORS:** Allowed origin `http://localhost:5173` (Vite dev server).

---

## 4. Database

**Engine:** MySQL 8.0  
**Database name:** `nousqa_platform`  
**ORM:** SQLAlchemy (declarative base, `pool_pre_ping=True`)

### Schema

#### `users`
| Column | Type | Constraints |
|---|---|---|
| id | Integer | PK, autoincrement |
| email | String(255) | Unique, not null |
| password_hash | String(255) | Not null |
| full_name | String(150) | Not null |
| role | Enum(`learner`, `admin`) | Default: `learner` |
| is_active | Boolean | Default: `true` |
| created_at | TIMESTAMP | Server default: now |
| updated_at | TIMESTAMP | Auto-update on change |

#### `profiles`
| Column | Type | Constraints |
|---|---|---|
| id | Integer | PK, autoincrement |
| profile_key | String(30) | Unique, not null |
| name | String(100) | Not null |
| description | Text | Nullable |
| default_duration_weeks_min | Integer | Not null |
| default_duration_weeks_max | Integer | Not null |
| sort_order | Integer | Default: 0 |

#### `user_profiles`
| Column | Type | Constraints |
|---|---|---|
| id | Integer | PK, autoincrement |
| user_id | Integer | FK → users.id |
| profile_id | Integer | FK → profiles.id |
| current_state | Enum(`active`, `completed`, `overdue`, `paused`) | Default: `active` |
| start_date | Date | Not null |
| target_end_date | Date | Not null |
| completed_at | TIMESTAMP | Nullable |
| created_at / updated_at | TIMESTAMP | Auto-managed |

#### `roadmap_modules`
| Column | Type | Constraints |
|---|---|---|
| id | Integer | PK, autoincrement |
| course_id | String(60) | Unique, not null |
| title | String(200) | Not null |
| category | String(50) | Not null |
| mandatory | Boolean | Default: false |
| resource_name | String(200) | Nullable |
| platform | String(100) | Nullable |
| resource_link | String(500) | Not null |
| estimated_time | String(30) | Nullable |
| module_type | Enum(`course`, `project`) | Default: `course` |

#### `profile_modules`
| Column | Type | Constraints |
|---|---|---|
| id | Integer | PK, autoincrement |
| profile_id | Integer | FK → profiles.id |
| module_id | Integer | FK → roadmap_modules.id |
| sequence_order | SmallInteger | Default: 0 |

#### `module_progress_current`
| Column | Type | Constraints |
|---|---|---|
| user_id | Integer | PK, FK → users.id |
| module_id | Integer | PK, FK → roadmap_modules.id |
| progress_state | Enum(`not_started`, `in_progress`, `completed`, `not_applicable`) | Default: `not_started` |
| percentage | SmallInteger | Default: 0 |
| updated_at | TIMESTAMP | Auto-update on change |

#### `progress_events` (audit log)
| Column | Type | Constraints |
|---|---|---|
| id | Integer | PK, autoincrement |
| user_id | Integer | FK → users.id |
| module_id | Integer | FK → roadmap_modules.id |
| event_type | Enum(`START`, `PROGRESS_UPDATE`, `COMPLETE`, `TIME_LOG`, `RESET`) | Not null |
| old_progress_state | String(20) | Nullable |
| new_progress_state | String(20) | Nullable |
| percentage | SmallInteger | Nullable |
| duration_minutes | SmallInteger | Nullable |
| event_metadata | JSON | Nullable |
| created_at | TIMESTAMP | Server default: now |

#### `admin_audit_log`
| Column | Type | Constraints |
|---|---|---|
| id | Integer | PK, autoincrement |
| admin_id | Integer | FK → users.id |
| action | String(100) | Not null |
| entity_type | String(50) | Nullable |
| entity_id | Integer | Nullable |
| details | JSON | Nullable |
| created_at | TIMESTAMP | Server default: now |

---

## 5. Docker / Deployment

**File:** `docker-compose.yml`

| Service | Image / Build | Port | Notes |
|---|---|---|---|
| `db` | `mysql:8.0` | 3306 | Persistent volume `mysql_data` |
| `backend` | `./backend/Dockerfile` | 8000 | Depends on `db` |
| `frontend` | `./frontend/Dockerfile` | 5173 | Depends on `backend` |

**Run everything:**
```bash
docker-compose up --build
```

---

## 6. Local Development Setup

### Prerequisites
- Python 3.13+
- Node.js 18+
- MySQL 8.0 running locally

### Backend
```powershell
cd backend
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

### Frontend
```powershell
cd frontend
npm install
npm run dev
```

### Database
```sql
CREATE DATABASE nousqa_platform;
```
Tables are auto-created by SQLAlchemy on first backend startup. Seed data (admin user + modules) is loaded from `course_matrix.json` automatically.

---

## 7. Security Notes

- JWT secret key must be rotated via `SECRET_KEY` env var in production.
- MySQL password must be changed from the default in production.
- CORS is locked to `http://localhost:5173`; update `allow_origins` in `main.py` for production domains.
- SSO integration is stubbed via the `SSO_ENABLED` flag in `config.py`.
