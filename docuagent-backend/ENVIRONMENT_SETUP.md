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

The frontend does not require a local env file for standard use because it defaults to the current browser host on port `8003` when `VITE_API_BASE_URL` is unset.

```env
VITE_API_BASE_URL=http://<current-browser-host>:8003
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

For production deployment, set a real `JWT_SECRET`.
If you deploy the frontend and backend on the same host, the frontend can usually talk to the backend without a custom `VITE_API_BASE_URL`.
Turnstile is optional and can be enabled by setting both `VITE_TURNSTILE_SITE_KEY` in the frontend and `TURNSTILE_SECRET_KEY` in the backend.
If a deployed frontend bundle still contains `http://localhost:8003`, the app rewrites that loopback URL to the current browser host automatically.
For a single-port deployment, run `npm run build` in `docuagent-frontend` and serve the built `dist` folder from the backend on port `8003`.
