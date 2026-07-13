# Expense Tracker (Trackage)

A full-stack expense tracking app with group expense splitting, JWT authentication, and balance calculation between group members.

- **Backend**: Spring Boot 3 (Java 21), PostgreSQL, Flyway, JWT auth, email OTP verification
- **Frontend**: React 19 + TypeScript, Vite, Tailwind CSS, React Query
- **Deployment**: Single Docker image — the backend serves both the API and the built frontend on one port

## Features

- Signup/login with email OTP verification and password reset
- Expense groups with members
- Expense entries with categories
- Balance/settlement calculation between group members
- Transaction history

## Project structure

```
expense-tracker/
├── trackage-backend/     # Spring Boot API (Java 21, Maven)
├── trackage-frontend/    # React + Vite SPA
├── docker-compose.yml    # Postgres + bundled app, for running everything at once
├── Dockerfile            # Builds frontend + backend into a single jar/image
└── .env.example          # Env vars used by docker-compose.yml
```

## Prerequisites

- [Docker](https://www.docker.com/) + Docker Compose (recommended, easiest path), **or**
- For running services individually without Docker:
  - Java 21+ and Maven
  - Node.js 20+
  - PostgreSQL 16

## Option A: Run everything with Docker Compose (recommended)

This builds the frontend, bundles it into the backend jar, and runs it alongside Postgres — no local Java/Node/Postgres setup needed.

1. Copy the root env file and adjust values if needed:
   ```bash
   cp .env.example .env
   ```
   The defaults work out of the box for local dev. `OTP_MODE=console` means signup/reset OTP codes are printed to the backend log instead of emailed, so no SMTP setup is required.

2. Build and start:
   ```bash
   docker compose up --build
   ```

3. Open the app at [http://localhost:8080](http://localhost:8080).

Postgres data persists in the `pgdata` Docker volume across restarts.

## Option B: Run backend and frontend separately (local dev with hot reload)

Useful if you're actively developing and want Vite's dev server with HMR.

### 1. Start Postgres

Either use the Postgres service from `docker-compose.yml`:
```bash
docker compose up postgres
```
(it publishes on host port `5433` to avoid clashing with a local Postgres on `5432`)

or point at your own local Postgres instance — just make sure a database matching `POSTGRES_DB` (default `ExpenseTracking`) exists.

### 2. Backend

```bash
cd trackage-backend
```

Set the required environment variables (or export them in your shell) — at minimum:

| Variable | Description | Example |
|---|---|---|
| `SPRING_DATASOURCE_URL` | JDBC URL to Postgres | `jdbc:postgresql://localhost:5433/ExpenseTracking` |
| `SPRING_DATASOURCE_USERNAME` | Postgres user | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | Postgres password | matches `docker-compose.yml` |
| `JWT_SECRET` | Secret for signing JWTs (required, no default) | `openssl rand -base64 32` |
| `CORS_ALLOWED_ORIGIN` | Frontend origin, needed since frontend runs on a separate port in this mode | `http://localhost:5173` |
| `OTP_MODE` | `console` to log OTPs instead of emailing (no SMTP needed) | `console` |

Run the backend:
```bash
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`.

### 3. Frontend

```bash
cd trackage-frontend
cp .env.example .env
npm install
npm run dev
```

The `.env` sets `VITE_API_BASE_URL=http://localhost:8080` so the frontend knows where to reach the backend. The dev server runs at `http://localhost:5173`.

## Email OTP (optional)

By default `OTP_MODE=console` logs signup/password-reset codes to the backend console — no email account needed. To actually send emails, set `OTP_MODE=smtp` and provide `SMTP_USERNAME`/`SMTP_PASSWORD` (for Gmail, generate an App Password under Google Account → Security → 2-Step Verification → App Passwords, not your normal login password).

## API docs

With the backend running, Swagger UI (via springdoc-openapi) is available at `http://localhost:8080/swagger-ui.html`.
