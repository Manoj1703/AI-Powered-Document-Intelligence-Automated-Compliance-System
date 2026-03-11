# DocuAgent Frontend (React + Vite)

## Stack
- React 18
- Vite 7
- Plain CSS

## What Users Can Do

- log in securely
- upload documents
- view AI-generated summaries and risk insights
- filter documents
- inspect detailed document analysis
- manage users and roles when signed in as admin

## Run
1. Install Node.js 18+.
2. Install deps:
   ```bash
   npm install
   ```
3. Start dev server:
   ```bash
   npm run dev
   ```

For local use, no frontend env file is required if the backend runs on `http://localhost:8003`.

## Environment (`docuagent-frontend/.env`)

```env
VITE_API_BASE_URL=http://127.0.0.1:8003
VITE_TURNSTILE_SITE_KEY=
```

- `VITE_API_BASE_URL` defaults to `http://localhost:8003` if unset.
- `VITE_TURNSTILE_SITE_KEY` is optional and enables captcha on login.

## Tests

```bash
npm run test:run
```

Test suite includes:
- Login captcha validation behavior
- Document insights modal behavior/accessibility
- Documents filter behavior

## E2E (Playwright)

```bash
npm run e2e
```

E2E suite uses mocked API routes for stable browser tests:
- Login flow with mocked auth/data responses
- Open/close document insights modal flow
