# Environment Setup

## Minimum Local Setup

The backend only needs these values for normal local use:

```env
MONGO_URI=<your-mongodb-uri>
OPENAI_API_KEY=<your-openai-key>
```

Put them in:

```text
docuagent-backend/.env
```

The frontend does not require a local env file for standard use because it already defaults to:

```env
VITE_API_BASE_URL=http://localhost:8003
```

## Optional Local Variables

Only add these if you actually need the related feature:

```env
JWT_SECRET=<long-random-secret>
TURNSTILE_SECRET_KEY=<cloudflare-turnstile-secret-key>
API_BASE_URL=<custom-openai-compatible-base-url>
OPENAI_BASE_URL=<custom-openai-compatible-base-url>
OPENAI_MODEL=gpt-4o-mini
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

## Local Run Commands

Backend:

```bash
cd docuagent-backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8003
```

Frontend:

```bash
cd docuagent-frontend
npm install
npm run dev
```

## Default Local Addresses

- frontend: `http://localhost:5173`
- backend: `http://localhost:8003`

## Production Note

For production deployment, set a real `JWT_SECRET`. The built-in fallback is only for local development convenience.
