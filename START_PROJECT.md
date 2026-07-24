# Schedular Startup Guide

Welcome to the **Schedular** project! This guide provides step-by-step instructions to get your local environment set up, configure your services, and run both the Python FastAPI backend and the Next.js React frontend.

---

## 📋 Prerequisites

Ensure you have the following installed on your machine:
1. **Node.js** (v18 or higher) and **npm**
2. **Python** (v3.10 or higher)
3. **uv** (A fast Python package installer and resolver. Install via `pip install uv` if not present)
4. **PostgreSQL** (running locally on port `5432` with a database named `timetable`)

---

## 🛠️ Configuration & Setup

### 1. Database Setup
Make sure PostgreSQL is running on your system. You must create a database named `timetable` if it does not already exist.

For example, via `psql`:
```sql
CREATE DATABASE timetable;
```

### 2. Environment Variables

#### Backend Configuration (`backend/.env`)
Create or edit the `backend/.env` file in the `backend/` directory. You can copy the template from `backend/.env.example`:

```bash
# Example backend/.env
APP_ENV=development
APP_PORT=8000
DATABASE_URL=postgresql://<username>:<password>@localhost:5432/timetable
JWT_SECRET=local-development-secret-change-before-production
JWT_EXPIRES_IN_HOURS=168
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:5173
```
*Note: Make sure to replace `<username>` and `<password>` with your PostgreSQL credentials.*

#### Frontend Configuration (`frontend-next/.env.local`)
Create or edit the `frontend-next/.env.local` file inside the `frontend-next/` directory:

```bash
# Example frontend-next/.env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

---

## 🚀 Running the Project

Convenient root-level commands are provided in the main `package.json` to make running the project easier.

### Step 1: Install Dependencies
Run the following commands in the root directory:

```bash
# Install backend dependencies (uses uv sync)
npm run backend:install

# Install frontend dependencies (npm install in frontend-next)
npm run frontend:install
```

### Step 2: Run Database Migrations
Run migrations to set up the tables in your PostgreSQL database:

```bash
npm run backend:migrate
```

### Step 3: Start Development Servers
Start both backend and frontend development servers.

```bash
# In Terminal 1: Start the Backend API
npm run backend:dev

# In Terminal 2: Start the Frontend App
npm run frontend:dev
```

---

## 🔗 Useful URLs & Endpoints

Once the servers are running, you can access the following services:

| Service | URL | Description |
| :--- | :--- | :--- |
| **Frontend Web App** | [http://localhost:3001](http://localhost:3001) | Next.js visual interface |
| **Backend API** | [http://localhost:8000/api/v1](http://localhost:8000/api/v1) | Main REST API base |
| **Interactive API Docs** | [http://localhost:8000/docs](http://localhost:8000/docs) | Swagger UI for exploring/testing endpoints |
| **Health Check** | [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health) | Endpoint showing backend & DB health status |

---

## 🔍 Troubleshooting & Verification

- **Verifying Backend Health**: You can run `curl http://localhost:8000/api/v1/health` or open it in your browser. It should return a success JSON indicating the service status is `"ok"`.
- **Database Connection Failure**: Check that your `DATABASE_URL` matches your local database credentials and that the database `timetable` exists.
- **Port Conflict**: If port `8000` or `3001` is already in use, you can modify the ports in `backend/.env` or run Next.js on a different port using the `-p` parameter in `frontend-next/package.json`.
