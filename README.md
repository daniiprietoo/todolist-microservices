# Todo List Microservices Architecture

A full-stack Todo List application using a microservices architecture. The backend is split into multiple services (API Gateway, Users Service, Todos Service), each built with Node.js, Express, TypeScript, Drizzle ORM, and PostgreSQL. The frontend is a modern React app using Vite, TypeScript, Tailwind CSS, and Shadcn UI.

## Tech Stack

- **Frontend**: React, Vite, TypeScript, Tailwind CSS, Shadcn UI
- **API Gateway**: Node.js, Express, TypeScript, http-proxy-middleware
- **Users Service**: Node.js, Express, TypeScript, Drizzle ORM, PostgreSQL
- **Todos Service**: Node.js, Express, TypeScript, Drizzle ORM, PostgreSQL
- **Database**: PostgreSQL (each service can use its own DB or share one)
- **API Documentation**: Swagger UI (per service)

## Project Structure

```
todo-list-microservices/
  api-gateway/      # API Gateway (routes requests to services)
  users-service/    # User management microservice
  todos-service/    # Todo/task management microservice
  frontend/         # React app (Vite, Tailwind CSS, Shadcn UI)
  package.json      # Monorepo scripts
```

## Diagram

![image](https://github.com/user-attachments/assets/0da5ef26-c6ff-4252-9bae-cc70a1dbd020)

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
- PostgreSQL database (can be shared or separate for each service)

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd todo-list-microservices
```

### 2. Install dependencies (monorepo)

```bash
npm install
```

### 3. Configure environment variables

- Copy `.env.example` (if available) or create `.env` files in each service directory (`api-gateway/`, `users-service/`, `todos-service/`).
- Set the following variables as needed:
  - **API Gateway**: `FRONTEND_URL`, `USERS_SERVICE_URL`, `TODOS_SERVICE_URL`
  - **Users Service**: `DATABASE_URL`, `FRONTEND_URL`
  - **Todos Service**: `DATABASE_URL`, `FRONTEND_URL`, `USERS_SERVICE_URL`

Example for `api-gateway/.env`:

```
FRONTEND_URL=http://localhost:5173
USERS_SERVICE_URL=http://localhost:4001
TODOS_SERVICE_URL=http://localhost:4002
```

### 4. Run database migrations

For each service that uses a database (users-service, todos-service):

```bash
cd users-service
npx drizzle-kit push:pg
cd ../todos-service
npx drizzle-kit push:pg
cd ..
```

### 5. Start the development servers

From the root directory:

```bash
npm run dev
```

- This will start all services concurrently:
  - **Frontend**: [http://localhost:5173](http://localhost:5173)
  - **API Gateway**: [http://localhost:3000](http://localhost:3000)
  - **Users Service**: [http://localhost:4001](http://localhost:4001)
  - **Todos Service**: [http://localhost:4002](http://localhost:4002)
- The frontend is configured to proxy API requests (`/api`) to the API Gateway.

### 6. Open the app

Visit [http://localhost:5173](http://localhost:5173) in your browser.

## Scripts

- `npm run dev` — Start all services in development mode (monorepo)
- `npm run dev:frontend` — Start frontend only
- `npm run dev:api-gateway` — Start API Gateway only
- `npm run dev:users-service` — Start Users Service only
- `npm run dev:todos-service` — Start Todos Service only

## API Documentation

- **Users Service Swagger UI**: [http://localhost:4001/docs](http://localhost:4001/docs)
- **Todos Service Swagger UI**: [http://localhost:4002/docs](http://localhost:4002/docs)

## Notes

- Each service can be developed, tested, and deployed independently.
- The API Gateway abstracts the backend services from the frontend and handles cross-cutting concerns (CORS, rate limiting, etc).
- The system is designed for extensibility—new services can be added and integrated via the API Gateway.
