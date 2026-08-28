# BuildLoop — Complete Phase 1 → 14 Roadmap

```
PHASE 1   Production Foundation
    ↓
PHASE 2   PostgreSQL Database
    ↓
PHASE 3   Production Authentication
    ↓
PHASE 4   Google OAuth
    ↓
PHASE 5   Google Maps
    ↓
PHASE 6   Image/File Storage
    ↓
PHASE 7   Production API & Configuration
    ↓
PHASE 8   Frontend Production Integration
    ↓
PHASE 9   Backend Deployment
    ↓
PHASE 10  Production Database Deployment
    ↓
PHASE 11  Frontend Deployment
    ↓
PHASE 12  Domain + HTTPS
    ↓
PHASE 13  Real User Testing
    ↓
PHASE 14  Security + Monitoring
    ↓
🚀 LIVE BUILDLOOP
```

---

# PHASE 1 — Production Foundation

### Goal
Clean and prepare the existing codebase before adding cloud services.

### 1.1 Repository Structure
Establish:
```
PRJ-52/
├── backend/
├── frontend-web/
├── docs/
├── .gitignore
├── README.md
└── .env.example
```

Ensure these are ignored in `.gitignore`:
`.env`, `.env.local`, `.env.production`, `venv/`, `__pycache__/`, `*.db`, `node_modules/`

### 1.2 Environment Configuration
Separate Development, Testing, and Production environments.

Backend `.env`:
```env
DATABASE_URL=
SECRET_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_MAPS_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
FRONTEND_URL=
```

Frontend `.env`:
```env
VITE_API_URL=
VITE_GOOGLE_MAPS_API_KEY=
```

### 1.3 Configuration Architecture
Extend `Settings` in FastAPI (`backend/app/core/config.py`):
```
Settings
├── Database
├── JWT
├── Google OAuth
├── Maps
├── Cloudinary
├── Email
├── CORS
└── Application
```

### 1.4 Error Handling & Logging
Consistent error responses across all APIs:
`400` Bad Request, `401` Unauthorized, `403` Forbidden, `404` Not Found, `409` Conflict, `422` Validation Error, `429` Rate Limited, `500` Server Error.

### 1.5 API Versioning
Maintain `/api/v1` namespace for all endpoints (e.g. `/api/v1/auth/login`, `/api/v1/listings`, `/api/v1/vendors`).

---

# PHASE 2 — PostgreSQL Database

### Goal
Move BuildLoop from development SQLite to production PostgreSQL (e.g., Render PostgreSQL, Supabase, Neon, AWS RDS).

### Key steps:
- Alembic database migrations (`alembic revision --autogenerate`, `alembic upgrade head`).
- Production schema verification: `users`, `user_auth_accounts`, `refresh_tokens`, `categories`, `listings`, `listing_images`, `locations`, `vendors`, `vendor_services`, `conversations`, `messages`, `transactions`, `notifications`.
- Geographical indexing for coordinates (`locations.latitude`, `locations.longitude`).
- Automatic backups and retention policies.

---

# PHASE 3 — Production Authentication

### Goal
Secure, production-grade authentication with email/password and token management.

- Passwords hashed using `bcrypt`.
- Short-lived Access Tokens (15 min) + Long-lived Refresh Tokens (30-90 days).
- Token rotation and invalidation on logout (`POST /auth/logout`).
- Password reset and Email verification flows.

---

# PHASE 4 — Google OAuth

### Goal
Enable "Continue with Google" sign-in and account linking.

- Google Cloud Console OAuth setup with Client ID and Client Secret.
- Account linking for existing email accounts with verified Google emails.

---

# PHASE 5 — Google Maps

### Goal
Location-aware marketplace features.

- Enable Maps JavaScript API, Places API, and Geocoding API in Google Cloud Console.
- HTTP referrer restricted API keys (`https://buildloop.com/*`).
- Interactive location picker for sellers dropping listing pins.
- Nearby vendor radar & radius search.

---

# PHASE 6 — Image / File Storage

### Goal
Cloud-hosted media storage with Cloudinary for listing photos and waste uploads.

- Direct client/server upload to Cloudinary.
- Auto-resizing, thumbnail generation, and optimization.
- Image reordering and deletion support.

---

# PHASE 7 — Production API & Configuration

- Strict CORS configuration (no wildcard `*` origins in production).
- Role-based authorization (`BUYER`, `SELLER`, `RECYCLER`, `ADMIN`).
- Server-side rate limiting and request validation.

---

# PHASE 8 — Frontend Production Integration

- Centralized `services/api.js` module.
- `AuthContext` for session state management (`/auth/me`).
- Protected vs Public route routing.
- Responsive Google Maps & chat UI components.

---

# PHASE 9 — Backend Deployment

- Host FastAPI on Render / Railway / AWS.
- Automated CI/CD deployments from GitHub.
- Health check endpoint (`GET /health`).

---

# PHASE 10 — Production Database Deployment

- Connected Render PostgreSQL database.
- Production Alembic migration execution.
- System seed data (categories, default configurations).

---

# PHASE 11 — Frontend Deployment

- Deploy React/Vite SPA on Vercel / Netlify.
- SPA URL rewrite rules for clean client routing.

---

# PHASE 12 — Custom Domain + HTTPS

- Custom domain routing (`buildloop.in` & `api.buildloop.in`).
- Cloudflare DNS management & SSL/TLS enforcement.

---

# PHASE 13 — Real User Testing

- Comprehensive E2E user verification across mobile & desktop.
- Verification of auth, seller creation, maps search, chat, and transaction workflows.

---

# PHASE 14 — Security, Monitoring & Launch

- Sentry exception tracking for backend & frontend.
- Rate-limiting protection on sensitive routes (`/login`, `/register`, `/search`).
- Admin dashboard (`/admin`) for content moderation and analytics.
