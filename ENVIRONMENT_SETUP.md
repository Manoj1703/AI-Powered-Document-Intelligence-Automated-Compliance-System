# Environment Setup

This project uses separate env files for frontend and backend.

## Frontend (`docuagent-frontend/.env`)

Required:

```env
VITE_API_BASE_URL=http://localhost:8003
```

Optional (Captcha):

```env
VITE_TURNSTILE_SITE_KEY=<cloudflare-turnstile-site-key>
```

Notes:
- Do not put secret keys in frontend env.
- `VITE_` variables are exposed to the browser by design.

## Backend (`docuagent-backend/.env`)

Required:

```env
MONGO_URI=<mongo-uri>
JWT_SECRET=<long-random-secret>
```

Recommended:

```env
APP_ENV=development
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Optional (Captcha verification):

```env
TURNSTILE_SECRET_KEY=<cloudflare-turnstile-secret-key>
```

Behavior:
- If `TURNSTILE_SECRET_KEY` is set, login requires valid Turnstile token.
- If unset, backend skips captcha verification.

## Captcha Wiring Checklist

1. Create Turnstile widget in Cloudflare.
2. Add hostnames: `localhost`, `127.0.0.1`.
3. Set frontend `VITE_TURNSTILE_SITE_KEY`.
4. Set backend `TURNSTILE_SECRET_KEY`.
5. Restart both servers.

## Common Mistakes

- Putting keys in `.env.example` only (app does not load it automatically).
- Swapping site key and secret key.
- Not restarting dev servers after env updates.
- Missing hostname entries in Cloudflare widget config.
