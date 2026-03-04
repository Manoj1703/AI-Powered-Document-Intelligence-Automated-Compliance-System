# This file starts the backend server.
# It creates the FastAPI app and connects all route files.
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

import os
import traceback

# Import API route modules.
# Fallback import supports running in different project structures.
try:
    from app.auth import ensure_admin_user
    from app.database import DatabaseUnavailableError
    from app.routes import auth, dashboard, documents, upload, users
except ModuleNotFoundError as exc:
    # Only use fallback when package-style import is unavailable.
    if exc.name not in {"app", "app.routes", "app.auth", "app.database"}:
        raise
    from auth import ensure_admin_user
    from database import DatabaseUnavailableError
    from routes import auth, dashboard, documents, upload, users


def _cors_origins() -> list[str]:
    raw = str(os.getenv("CORS_ORIGINS") or "").strip()
    if raw:
        return [item.strip() for item in raw.split(",") if item.strip()]
    return [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]


def _cors_origin_regex() -> str:
    # Allow local dev frontends even when Vite auto-switches ports (5174, 5175, etc.).
    return r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$"


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Ensure the unique admin account exists if configured via env.
    try:
      ensure_admin_user()
    except Exception as exc:
      # Allow API process to start even when DB is temporarily unreachable.
      print(f"[startup-warning] ensure_admin_user skipped: {exc}")
    yield


# Basic app details shown in API docs.
app = FastAPI(title="DocuAgent Backend", version="1.0.0", lifespan=lifespan)

# Allow local frontend apps during development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins(),
    allow_origin_regex=_cors_origin_regex(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Healthcheck API: confirms backend is running.
@app.get("/")
def healthcheck():
    return {"status": "ok", "service": "DocuAgent Backend"}


@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "same-origin")
    response.headers.setdefault("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
    return response


@app.exception_handler(Exception)
async def global_exception_handler(_request: Request, exc: Exception):
    if isinstance(exc, DatabaseUnavailableError):
        return JSONResponse(
            status_code=503,
            content={"error": "Database unavailable. Please check internet/DNS and MongoDB connectivity."},
        )

    # If SHOW_TRACEBACK=true, include full traceback in error response.
    show_trace = os.getenv("SHOW_TRACEBACK", "false").lower() == "true"
    content = {"error": str(exc)}
    if show_trace:
        content["trace"] = traceback.format_exc()
    return JSONResponse(status_code=500, content=content)


# Attach all routers to this app.
# These routers are defined in separate files in the routes/ directory.
app.include_router(upload.router)
app.include_router(documents.router)
app.include_router(dashboard.router)
app.include_router(auth.router)
app.include_router(users.router)
