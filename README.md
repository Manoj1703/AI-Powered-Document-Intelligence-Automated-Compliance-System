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

Then start the whole app with one command from the project root.

## Run Locally

```bash
python app.py
```

Or on Windows:

```bash
.\start-docuagent.cmd
```

Or, if your shell allows npm scripts:

```bash
npm run dev
```

All of these start both:

- backend on `http://localhost:8003`
- frontend on `http://localhost:5173`

If you only want one side:

- `python app.py backend`
- `python app.py frontend`
- `.\start-docuagent.cmd backend`
- `.\start-docuagent.cmd frontend`

Open the app at:

```text
http://localhost:5173
```

## Important Notes

- The frontend already defaults to `http://localhost:8003`, so no frontend env file is required for normal local use.
- In local development, the backend uses a built-in dev JWT secret if `JWT_SECRET` is not set.
- For production, set a real `JWT_SECRET`.
- Turnstile captcha is optional. If you do not set it, login still works locally.

## Main Features

- secure login and role-based access
- document upload and AI-powered analysis
- risk level classification
- clause, obligation, and compliance issue extraction
- document detail modal with structured insights
- dashboard, analytics, and activity views
- unit tests and browser smoke tests

See [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) for optional configuration details.
