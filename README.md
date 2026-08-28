# BuildLoop

BuildLoop is a circular economy marketplace platform connecting construction material buyers, sellers, recyclers, and material vendors. It enables users to list reusable construction materials, discover nearby recycled resources on interactive maps, chat in real-time, and track waste reduction transactions.

---

## 🛠️ Environment Variables & Replacement Guide

To configure BuildLoop for local development or production deployment, copy `.env.example` to `.env` (or set environment variables in your cloud provider dashboard).

Below is the complete reference guide explaining every API key, secret key, account ID, and credential, where to find/obtain it, and where in the code it must be replaced.

### 🔑 Configuration Summary Table

| Environment Variable | Where Used / File Location | Description & Purpose | How / Where to Obtain |
| :--- | :--- | :--- | :--- |
| **`DATABASE_URL`** | `backend/.env`<br>`backend/app/core/config.py` | Connection string for database | **Local Dev:** `sqlite:///./buildloop.db`<br>**Production:** Provided by Render PostgreSQL, Supabase, Neon, or Railway (`postgresql://user:password@host:5432/dbname`) |
| **`SECRET_KEY`** | `backend/.env`<br>`backend/app/core/config.py` | Cryptographic secret key used to sign and verify JWT authentication tokens | Generate using `openssl rand -hex 32` or `python3 -c "import secrets; print(secrets.token_hex(32))"` |
| **`ALGORITHM`** | `backend/.env`<br>`backend/app/core/config.py` | Encryption algorithm for JWT tokens (default: `HS256`) | Standard JWT signing algorithm value (`HS256`) |
| **`ACCESS_TOKEN_EXPIRE_MINUTES`** | `backend/.env`<br>`backend/app/core/config.py` | Token validity duration in minutes | Set to desired integer (e.g. `10080` for 7 days, or `15` with refresh tokens) |
| **`GOOGLE_CLIENT_ID`** | `backend/.env`<br>`backend/app/core/config.py` | Google OAuth Client ID for "Continue with Google" authentication | Google Cloud Console -> **APIs & Services** -> **Credentials** -> **OAuth 2.0 Client IDs** |
| **`GOOGLE_CLIENT_SECRET`** | `backend/.env`<br>`backend/app/core/config.py` | Google OAuth Client Secret for backend authentication verification | Google Cloud Console -> **APIs & Services** -> **Credentials** -> Client Secret |
| **`GOOGLE_MAPS_API_KEY`** | `backend/.env`<br>`backend/app/core/config.py` | Google Maps API key for backend geocoding & address validation | Google Cloud Console -> **APIs & Services** -> **Credentials** -> Enable **Geocoding API** & **Places API** |
| **`CLOUDINARY_CLOUD_NAME`** | `backend/.env`<br>`backend/app/core/config.py` | Cloudinary Cloud Name for uploading and managing material images | Cloudinary Dashboard -> **Account Details** -> **Cloud Name** |
| **`CLOUDINARY_API_KEY`** | `backend/.env`<br>`backend/app/core/config.py` | Cloudinary API Key for authenticating backend media uploads | Cloudinary Dashboard -> **Account Details** -> **API Key** |
| **`CLOUDINARY_API_SECRET`** | `backend/.env`<br>`backend/app/core/config.py` | Cloudinary API Secret for signing upload payloads | Cloudinary Dashboard -> **Account Details** -> **API Secret** |
| **`RESEND_API_KEY`** | `backend/.env`<br>`backend/app/core/config.py` | Resend API Key for sending transactional verification & password reset emails | Resend Dashboard -> **API Keys** -> Create API Key |
| **`SENTRY_DSN`** | `backend/.env`<br>`backend/app/core/config.py` | Sentry DSN URL for backend error and performance monitoring | Sentry.io -> **Project Settings** -> **Client Keys (DSN)** |
| **`FRONTEND_URL`** | `backend/.env`<br>`backend/app/core/config.py` | Allowed origin URL for CORS configuration | **Local Dev:** `http://localhost:3000`<br>**Production:** `https://buildloop.com` (or your domain) |
| **`VITE_API_URL`** | `frontend-web/.env`<br>`frontend-web/src/services/api.js` | Base URL endpoint for backend REST API requests | **Local Dev:** `http://localhost:8000` (or proxy `/api/v1`)<br>**Production:** `https://api.buildloop.com` |
| **`VITE_GOOGLE_MAPS_API_KEY`** | `frontend-web/.env`<br>`frontend-web/src/components/Map/MapView.jsx` | Frontend Google Maps JavaScript API key for interactive map components | Google Cloud Console -> Enable **Maps JavaScript API** (Set HTTP Referrer restriction e.g., `https://buildloop.com/*`) |

---

### 📝 Detailed Replacement Instructions

#### 1. Backend Secrets (`backend/.env` & `backend/app/core/config.py`)
1. Create or open `backend/.env`.
2. Replace `SECRET_KEY` with a strong random string generated in your terminal:
   ```bash
   python3 -c "import secrets; print(secrets.token_hex(32))"
   ```
3. Update `DATABASE_URL` when connecting to production PostgreSQL:
   ```env
   DATABASE_URL=postgresql://username:password@hostname:5432/buildloop_db
   ```

#### 2. Google OAuth Integration
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Navigate to **APIs & Services > Credentials**.
3. Create an **OAuth 2.0 Client ID** for a Web Application.
4. Add Authorized JavaScript origins:
   - `http://localhost:3000` (Development)
   - `https://buildloop.com` (Production)
5. Add Authorized redirect URIs:
   - `http://localhost:8000/api/v1/auth/google/callback`
   - `https://api.buildloop.com/api/v1/auth/google/callback`
6. Copy the **Client ID** and **Client Secret** into `backend/.env` as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

#### 3. Google Maps API Keys
1. In [Google Cloud Console](https://console.cloud.google.com/), enable the following APIs:
   - **Maps JavaScript API**
   - **Places API**
   - **Geocoding API**
2. Create two API Keys:
   - **Backend Key (`GOOGLE_MAPS_API_KEY`)**: Restrict to server IP addresses.
   - **Frontend Key (`VITE_GOOGLE_MAPS_API_KEY`)**: Restrict to Website HTTP Referrers (`http://localhost:3000/*` and `https://buildloop.com/*`).

#### 4. Image Uploads with Cloudinary
1. Create a free account at [Cloudinary](https://cloudinary.com/).
2. From the Dashboard, copy **Cloud Name**, **API Key**, and **API Secret**.
3. Add these values to `backend/.env`:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

---

## 🚀 Getting Started & Local Development

### Project Structure
```
PRJ-52/
├── backend/            # FastAPI backend server
│   ├── app/
│   │   ├── core/       # Configuration, Security, Dependencies
│   │   ├── db/         # Database engine & session setup
│   │   ├── models/     # SQLAlchemy database models
│   │   ├── routers/    # API endpoints (auth, listings, chat, search)
│   │   ├── schemas/    # Pydantic schemas
│   │   └── utils/      # Utility helpers
│   ├── tests/          # Pytest test suite
│   ├── .env.example
│   └── requirements.txt
├── frontend-web/       # React + Vite frontend application
│   ├── src/
│   │   ├── components/ # Shared UI components (Maps, Navbar, etc.)
│   │   ├── features/   # Feature views (Listings, Chat, Auth)
│   │   └── services/   # Centralized API service layer
│   ├── .env.example
│   └── package.json
├── docs/               # Documentation & Roadmap
│   └── ROADMAP.md
├── .env.example        # Root environment template
└── README.md
```

### 1. Backend Setup
```bash
# Navigate to backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Create .env file from template
cp .env.example .env

# Run development server
uvicorn app.main:app --reload --port 8000
```
API Documentation will be accessible at: `http://localhost:8000/docs`

### 2. Running Backend Tests
```bash
# Run pytest from repository root
PYTHONPATH=backend python3 -m pytest backend/tests/
```

### 3. Frontend Setup
```bash
# Navigate to frontend
cd frontend-web

# Install node dependencies
npm install

# Create .env file from template
cp .env.example .env

# Start Vite dev server
npm run dev
```
Frontend web application will be accessible at: `http://localhost:3000`

---

## 🗺️ BuildLoop Ideology & Complete Phase 1 → 14 Roadmap

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

### Phase Details Overview

1. **PHASE 1 — Production Foundation**: Repository structure cleanup, `.env` management, error handling structure, and API versioning (`/api/v1`).
2. **PHASE 2 — PostgreSQL Database**: Transitioning from development SQLite to production PostgreSQL database with Alembic migrations and database indexing.
3. **PHASE 3 — Production Authentication**: Secure email/password registration, password hashing with `bcrypt`, JWT access and refresh token rotation.
4. **PHASE 4 — Google OAuth**: Account sign-in & sign-up using "Continue with Google" and account linking for existing email accounts.
5. **PHASE 5 — Google Maps**: Interactive listing location drop-pin, geocoding, radius search, and vendor radar.
6. **PHASE 6 — Image/File Storage**: Media uploads for listings and waste items via Cloudinary with client/server validation.
7. **PHASE 7 — Production API & Configuration**: Production CORS policies, role-based authorization (Buyer, Seller, Recycler, Admin), and server rate limiting.
8. **PHASE 8 — Frontend Production Integration**: Centralized API service (`services/api.js`), global `AuthContext`, and responsive map & chat UI views.
9. **PHASE 9 — Backend Deployment**: Host FastAPI backend service on cloud platforms (Render, Railway) with SSL and automated GitHub deployment.
10. **PHASE 10 — Production Database Deployment**: Managed PostgreSQL deployment with automated backups, retention, and schema migrations.
11. **PHASE 11 — Frontend Deployment**: React SPA deployment on Vercel/Netlify with routing fallback handling.
12. **PHASE 12 — Domain + HTTPS**: Custom domain routing (`buildloop.in` and `api.buildloop.in`) with Cloudflare DNS management.
13. **PHASE 13 — Real User Testing**: End-to-end verification of buyer, seller, and recycler workflows across mobile & desktop devices.
14. **PHASE 14 — Security + Monitoring**: Sentry error tracking, API rate limits, database access restrictions, content moderation, and admin analytics dashboard.

*(For full roadmap details, see [`docs/ROADMAP.md`](docs/ROADMAP.md)).*
