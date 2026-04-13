"""Compatibility wrapper for the FastAPI backend.

Run this app from the backend directory with:
    uvicorn main:app --reload --port 8003
"""

from app.main import app
