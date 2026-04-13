# AI Doc Analyser and Compliance Detector

GitHub link: [AI Doc Analyser and Compliance Detector](https://github.com/Manoj1703/AI-Powered-Document-Intelligence-Automated-Compliance-System)

## What This Project Does

This project is a document intelligence app for:

- uploading legal or business documents
- extracting text and document details
- generating AI summaries
- detecting risk, compliance issues, obligations, and key clauses
- managing users with admin and super-admin access

## Project Structure

- `docuagent-backend`: FastAPI backend, MongoDB integration, auth, document analysis APIs
- `docuagent-frontend`: React frontend for login, upload, dashboard, documents, users, and analytics

## Quick Start

To run the project locally, a user only needs to add these values in `docuagent-backend/.env`:

```env
MONGO_URI=<your-mongodb-uri>
OPENAI_API_KEY=<your-openai-key>
```

Then start the backend. FastAPI serves the checked-in frontend bundle from the same `uvicorn` process.

## Run Locally

Single-command run:

```bash
cd docuagent-backend
uvicorn main:app --reload --port 8003
```

Open the app at:

```text
http://localhost:5173
```

## Important Notes

- The frontend defaults to the current browser host on port `8003`, so no frontend env file is required for normal local use or single-host deployments.
- `docuagent-frontend/dist` is checked in and FastAPI serves it directly, so no separate frontend build step is needed for local runs.
- If you deploy with Docker, `docker compose up --build` serves the current UI from the same `8003` port. MongoDB stays internal to the Docker network and does not need a public host port.
- In local development, the backend uses a built-in dev JWT secret if `JWT_SECRET` is not set.
- For production, set a real `JWT_SECRET`.

## Main Features

- secure login and role-based access
- document upload and AI-powered analysis
- risk level classification
- clause, obligation, and compliance issue extraction
- document detail modal with structured insights
- dashboard, analytics, and activity views
- unit tests and browser smoke tests

See [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) for optional configuration details.
