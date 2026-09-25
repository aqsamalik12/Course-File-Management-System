# University Course File Management System (CFMS)
**Institution:** University of Education, Attock Campus  
**Architecture:** Separated Frontend & Backend with Supabase (Cloud PostgreSQL)

---

## 📁 Project Architecture

```
university-course-file-management-system/
├── backend/                  # Standalone Express REST API Server
│   ├── config/               # Supabase client, logger, and DB configurations
│   ├── controllers/          # Controllers (Auth, Users, Courses, Files, etc.)
│   ├── middlewares/          # Auth, Error handling, and File upload middlewares
│   ├── models/               # TypeScript interfaces for all system entities
│   ├── routes/               # Express REST API endpoints
│   ├── services/             # Supabase cloud data access layer
│   ├── utils/                # In-memory store and initial seed utilities
│   ├── uploads/              # Local storage for uploaded files and syllabi
│   ├── server.ts             # Backend entry point (Port 5000)
│   ├── supabase_schema.sql   # Supabase SQL initialization script
│   ├── test-all-apis.ts      # Automated test suite (13/13 passing)
│   ├── package.json          # Backend dependencies
│   ├── tsconfig.json         # Backend TypeScript config
│   └── .env                  # Backend Supabase & JWT configuration
│
├── frontend/                 # Standalone React 19 + Vite + Tailwind CSS SPA
│   ├── src/                  # React components, modules, context, and styles
│   ├── public/               # Public assets and icons
│   ├── index.html            # Single Page Application HTML entry
│   ├── vite.config.ts        # Vite dev server with proxy to backend (Port 5173)
│   ├── package.json          # Frontend dependencies
│   └── tsconfig.json         # Frontend TypeScript config
│
├── package.json              # Root orchestration scripts
└── README.md                 # Project documentation
```

---

## 🚀 Running the Project

### Option 1: Run Both Frontend & Backend Together (Recommended)
From the root project directory, run:

```powershell
npm run dev
```

This will automatically launch:
- **Backend API:** `http://localhost:5000`
- **Frontend SPA:** `http://localhost:5173` (with live HMR and API proxy)

---

### Option 2: Run Separately in Individual Terminals

#### Terminal 1 — Backend:
```powershell
cd backend
npm run dev
```
*(Backend runs on `http://localhost:5000`)*

#### Terminal 2 — Frontend:
```powershell
cd frontend
npm run dev
```
*(Frontend runs on `http://localhost:5173` and forwards `/api` calls to port 5000)*

---

## 🔑 Demo Login Accounts

| Role | Email | Password | Name / Designation |
| :--- | :--- | :--- | :--- |
| **System Admin / Dean** | `admin@ue.edu.pk` | `admin123` | Prof. Dr. Muhammad Aslam |
| **Head of Department (HOD)** | `hod.cs@ue.edu.pk` | `hod123` | Dr. Sarah Ahmad |
| **Regular Teacher** | `tariq.mahmood@ue.edu.pk` | `teacher123` | Dr. Tariq Mahmood |
| **Visiting Teacher** | `bilal.visiting@ue.edu.pk` | `visiting123` | Engr. Bilal Khan |

---

## ☁️ Supabase Cloud Database Setup (One-Time)

1. Open your **[Supabase Project Dashboard](https://supabase.com/dashboard/project/sfjvhqpozgavcvqspxyo)**.
2. Go to **SQL Editor** (`https://supabase.com/dashboard/project/sfjvhqpozgavcvqspxyo/sql`).
3. Open `backend/supabase_schema.sql` (or copy its content).
4. Paste into the SQL editor and click **Run**.
5. All 16 tables and initial university seed records are instantly created!
