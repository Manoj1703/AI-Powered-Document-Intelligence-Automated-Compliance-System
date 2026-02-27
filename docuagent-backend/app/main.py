# This file starts the backend server.
# It creates the FastAPI app and connects all route files.
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

import os
import traceback

# Import API route modules.
# Fallback import supports running in different project structures.
try:
    from app.routes import dashboard, documents, upload
except ModuleNotFoundError:
    from routes import dashboard, documents, upload

# Basic app details shown in API docs.
app = FastAPI(title="DocuAgent Backend", version="1.0.0")

# Allow local frontend apps during development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Healthcheck API: confirms backend is running.
@app.get("/")
def healthcheck():
    return {"status": "ok", "service": "DocuAgent Backend"}


@app.exception_handler(Exception)
async def global_exception_handler(_request: Request, exc: Exception):
    # If SHOW_TRACEBACK=true, include full traceback in error response.
    show_trace = os.getenv("SHOW_TRACEBACK", "true").lower() == "true"
    content = {"error": str(exc)}
    if show_trace:
        content["trace"] = traceback.format_exc()
    return JSONResponse(status_code=500, content=content)


# Attach all routers to this app.
# These routers are defined in separate files in the routes/ directory.
app.include_router(upload.router)
app.include_router(documents.router)
app.include_router(dashboard.router)
