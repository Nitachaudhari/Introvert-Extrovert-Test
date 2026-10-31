# Psychometric Assessment Management System

A secure, professional, web-based management platform for psychological assessments and psychometric workflows.

> **Phase 1: Complete Technical Setup and Account Connection**
> *Status: Environment Setup & Infrastructure Integration*

---

## Architecture Overview

```
psychometric-assessment-system/
├── frontend/             # React.js + Vite + Tailwind CSS SPA
│   ├── public/           # Static assets and SPA routing rules (_redirects)
│   └── src/
│       ├── assets/       # Media and static icons
│       ├── components/   # Reusable UI components
│       ├── hooks/        # Custom React hooks (system health monitoring)
│       ├── layouts/      # Layout wrappers
│       ├── pages/        # Route pages (Landing, Connection Status)
│       └── services/     # API service layer (Axios client)
│
├── backend/              # Node.js + Express REST API
│   ├── src/
│   │   ├── config/       # Database and environment configurations
│   │   ├── controllers/  # API route handlers
│   │   ├── middleware/   # CORS, error handling, validation
│   │   ├── models/       # Mongoose data schemas (Phase 2+)
│   │   ├── routes/       # API route definitions
│   │   ├── services/     # Business logic layer
│   │   └── utils/        # Helper functions
│   └── server.js         # Express server entry point
│
├── .gitignore            # Security exclusions (.env, node_modules)
└── README.md             # Project documentation
```

---

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router DOM, Axios, Lucide Icons
- **Backend**: Node.js, Express.js, Mongoose, Dotenv, CORS
- **Database**: MongoDB Atlas (Cloud)
- **Deployment**:
  - Source Control: GitHub
  - Backend API: Render
  - Frontend SPA: Netlify

---

## Health & Diagnostic Endpoints

- `GET /api/health` - Backend server status, runtime environment, timestamp
- `GET /api/db-health` - Live MongoDB connectivity status & database name
- `GET /api/test-connection` - Comprehensive end-to-end integration test

