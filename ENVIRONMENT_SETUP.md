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

## Deployment

### Backend on Render

This repo now includes a root [`render.yaml`](./render.yaml) blueprint for the FastAPI backend.

Important production env values:

```env
APP_ENV=production
COOKIE_SECURE=true
COOKIE_SAMESITE=none
CORS_ORIGINS=https://<your-vercel-app>.vercel.app
MONGO_URI=<your-mongodb-uri>
JWT_SECRET=<long-random-secret>
```

Optional backend production env values:

```env
TURNSTILE_SECRET_KEY=<cloudflare-turnstile-secret-key>
OPENAI_API_KEY=<your-openai-key>
```

### Frontend on Vercel

Deploy the `docuagent-frontend` folder as the Vercel project root.

Required frontend env values:

```env
VITE_API_BASE_URL=https://<your-render-backend>.onrender.com
```

Optional frontend env values:

```env
VITE_TURNSTILE_SITE_KEY=<cloudflare-turnstile-site-key>
```

### Deployment Order

1. Deploy backend to Render first and copy its public URL.
2. Set `VITE_API_BASE_URL` in Vercel to the Render backend URL.
3. Deploy frontend to Vercel and copy its public URL.
4. Update backend `CORS_ORIGINS` to the Vercel frontend URL.
5. If using Turnstile, add both production domains in Cloudflare:
   - frontend domain (`*.vercel.app` or custom domain)
   - backend domain (`*.onrender.com` or custom domain)
