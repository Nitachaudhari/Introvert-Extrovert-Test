# Psychometric Assessment Management System

Existing React/Vite and Express/Mongoose application for staff-only patient and assessment-record management.

## Current functionality

- Staff sign-in with role-aware API authentication.
- Authenticated patient registration, search, filtering, profile updates, and assessment history.
- Consent is required when registering a patient; clinical notes are excluded from patient list responses.
- Authenticated dashboard and assessment-session metadata views.
- Scoring, questionnaire delivery, classification, and PDF reporting remain disabled pending rights clearance and independent clinical/scoring verification.

This software is not a diagnostic tool and is not certified as HIPAA-compliant. Do not enter real clinical information until the deployment has undergone appropriate privacy, security, legal, and clinical review.

## Stack and deployment

- Frontend: React 18, Vite, Tailwind CSS, React Router, Axios
- Backend: Node.js, Express, Mongoose
- Database: Existing MongoDB Atlas configuration
- Hosting: Existing Netlify frontend and Render backend configuration

## Local setup

1. Copy `backend/.env.example` to `backend/.env` and set `MONGODB_URI`, `FRONTEND_URL`, and a unique `JWT_SECRET` of at least 32 characters.
2. Set one-time `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` values in `backend/.env`. Use a strong password of at least 12 characters.
3. From `backend`, run `npm install`, then `npm run create-admin`. Remove the bootstrap credentials from the environment after the account is created.
4. Start the API with `npm run dev`.
5. Copy `frontend/.env.example` to `frontend/.env`, set `VITE_API_URL`, then run `npm install` and `npm run dev`.

The backend does not create a default account or expose public registration. Patient, dashboard, and assessment-record routes require a valid bearer token.

## API

- `POST /api/auth/login` — staff sign-in
- `GET /api/auth/me` — current account
- `GET /api/patients` — authenticated patient search/list
- `POST /api/patients` — authenticated patient registration
- `GET /api/patients/:id` — clinician/admin patient profile and assessment history
- `PATCH /api/patients/:id` — clinician/admin patient update
- `GET /api/assessments` — authenticated assessment-session metadata
- `GET /api/dashboard/summary` — authenticated operational counts and activity
- `GET /api/health`, `/api/db-health`, `/api/test-connection` — system diagnostics

## Validation

Run backend validation tests from `backend` with `npm test`; build the frontend from `frontend` with `npm run build`.

Existing untracked source-material and scoring files are intentionally not modified by the infrastructure changes.
