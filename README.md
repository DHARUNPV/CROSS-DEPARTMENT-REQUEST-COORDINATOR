# CROSS-DEPARTMENT-REQUEST-COORDINATOR

A full-stack MERN web application that simulates a **digital government service portal** for citizens to submit complaints and document applications, with automatic coordination between departments.

## Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, React Router, Axios
- **Backend:** Node.js, Express.js, PDFKit
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT

## Prerequisites

- Node.js 18+
- MongoDB running locally (or connection string in `.env`)

## Quick Start

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:3000` (API proxied to `http://localhost:5000`).

## Roles

- **Citizen**: Register + login, submit complaints/documents, track status, download certificate when available.
- **Officer**: Login using pre-fed officer credentials, see department tasks, approve/reject, generate certificate.
- **Admin**: Admin dashboard + analytics (if enabled).
