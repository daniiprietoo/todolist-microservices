# Todo List Layered Architecture

A full-stack Todo List application using a layered architecture. The backend is built with Node.js, Express, TypeScript, Drizzle ORM, and PostgreSQL. The frontend is a modern React app using Vite, TypeScript, Tailwind CSS, and Shadcn UI.

## Tech Stack

- **Frontend**: React, Vite, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Node.js, Express, TypeScript, Drizzle ORM, PostgreSQL
- **Database**: PostgreSQL
- **API Documentation**: Swagger UI

## Project Structure

```
todo-list-layered/
  backend/    # Express API, Drizzle ORM, PostgreSQL models, migrations
  frontend/   # React app (Vite, Tailwind CSS, Shadcn UI)
  package.json  # Monorepo scripts
```

## Diagram

![image](https://github.com/user-attachments/assets/27d566d6-da50-4115-8958-676a0eb4cca5)

## Explanation

### Frontend

- React App: user interface
- API Layer (Axios): handle HTTP requests to the backend

### Proxy /api/

- Vite proxies all requests starting with /api to the backend, abstracting the backend from the frontend. Also allows to make API calls wihout CORS issues.

### Backend

- **Express Server**: main app, receives HTTP requests, applies middleware and routes request to correct handlers
- **Routes**: define API endpoints and map them to controllers
- **Controllers**: handle incoming requests, validate inputs, call services, and return responses
- **Services**: contain business logic, process data and coordinate controllers and repositories
- **Repositories**: handle database operations, interact with the database, abstracting the database from the services
- **Drizzle ORM**: provides a type-safe way to interact with the database
- **PostgreSQL**: database

- **Uses**:
  - represents middleware and utilities that the Express server uses globally.
  - **Logging**: records important events, errors, and requests for debugging and monitoring.
  - **Error Handling**: catches and processes errors that occur during request handling, ensuring consistent error responses.
  - **Rate-Limiting**: prevents abuse by limiting how many requests a client can make in a certain period.

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL database

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd todo-list-layered
```

### 2. Install dependencies (monorepo)

```bash
npm install
```

### 3. Configure environment variables

- Copy `.env.example` to `.env` in `backend/` and set your `DATABASE_URL` and `FRONTEND_URL`.

### 4. Run database migrations

```bash
cd backend
npx drizzle-kit push:pg
```

### 5. Start the development servers

From the root directory:

```bash
npm run dev
```

- This will start both the backend (on port 4000) and the frontend (on port 5173 by default).
- The frontend is configured to proxy API requests (`/api`) to the backend.

### 6. Open the app

Visit [http://localhost:5173](http://localhost:5173) in your browser.

## Scripts

- `npm run dev` — Start both backend and frontend in development mode (monorepo)
- `npm run dev:backend` — Start backend only
- `npm run dev:frontend` — Start frontend only

## API Documentation

- Swagger UI is available at [http://localhost:4000/api/docs](http://localhost:4000/api/docs) when the backend is running.
