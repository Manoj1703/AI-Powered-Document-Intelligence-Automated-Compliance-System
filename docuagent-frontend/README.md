# DocuAgent Frontend (React + Vite)

## Stack
- React 18
- Vite 5
- Plain CSS

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

## Environment (`docuagent-frontend/.env`)

```env
VITE_API_BASE_URL=http://127.0.0.1:8003
VITE_TURNSTILE_SITE_KEY=
```

- `VITE_API_BASE_URL` defaults to `http://localhost:8003` if unset.
- `VITE_TURNSTILE_SITE_KEY` enables captcha widget rendering on login.

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
