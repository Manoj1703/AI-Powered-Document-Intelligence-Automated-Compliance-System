from __future__ import annotations

# Standard libraries used for time, file handling, and temp storage.
import datetime as dt
import os
import tempfile
# Third-party libraries for web framework, HTTP requests, and database errors.
from pathlib import Path

import requests
from fastapi import APIRouter, File, HTTPException, UploadFile
from openai import APIConnectionError, APIStatusError, AuthenticationError, RateLimitError
from pymongo.errors import PyMongoError

# Import DB, AI, and extractor helpers.
# Fallback import supports alternate run mode.
try:
    from app.database import get_collection
    from app.services.ai_service import analyze_document
    from app.services.extractors import ALLOWED_EXTENSIONS, extract_text_by_extension
except ModuleNotFoundError as exc:
    if exc.name not in {
        "app",
        "app.database",
        "app.services",
        "app.services.ai_service",
        "app.services.extractors",
    }:
        raise
    from database import get_collection
    from services.ai_service import analyze_document
    from services.extractors import ALLOWED_EXTENSIONS, extract_text_by_extension

# Upload APIs are available under /api.
router = APIRouter(prefix="/api", tags=["documents"])


# Upload endpoint:
# 1) Validate file type
# 2) Extract text
# 3) Run AI analysis
# 4) Save result in MongoDB
@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    collection = get_collection()

    # Check file extension.
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )

    tmp_path = None
    try:
        # Save uploaded file as temporary file for text extraction.
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        # Extract plain text from document.
        text = extract_text_by_extension(tmp_path, suffix)
        if not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from file.")

        # Analyze extracted text using AI service.
        try:
            analysis_result = analyze_document(text)
        except ValueError as exc:
            raise HTTPException(status_code=500, detail=str(exc)) from exc
        except AuthenticationError as exc:
            raise HTTPException(status_code=401, detail=f"OpenAI authentication failed: {exc}") from exc
        except RateLimitError as exc:
            raise HTTPException(status_code=429, detail=f"OpenAI quota/rate limit error: {exc}") from exc
        except APIConnectionError as exc:
            raise HTTPException(status_code=502, detail=f"OpenAI connection error: {exc}") from exc
        except APIStatusError as exc:
            raise HTTPException(status_code=502, detail=f"OpenAI API error (status {exc.status_code}): {exc}") from exc

        # Build document record with timestamps.
        now_utc = dt.datetime.now(dt.timezone.utc)
        document_data = {
            "filename": file.filename,
            "content_length": len(text),
            "analysis": analysis_result,
            "uploaded_at": now_utc,
            "created_at": now_utc,
        }

        # Save to MongoDB.
        try:
            inserted = collection.insert_one(document_data)
        except PyMongoError as exc:
            raise HTTPException(status_code=500, detail=f"Database write failed: {exc}") from exc

        # Optional Teams alert after successful processing.
        webhook_url = os.getenv("TEAMS_WEBHOOK_URL")
        if webhook_url:
            try:
                requests.post(
                    webhook_url,
                    json={"text": f"New document processed: {file.filename}"},
                    timeout=10,
                )
            except requests.RequestException:
                pass

        # Return final API response.
        return {
            "message": "Document processed successfully",
            "document_id": str(inserted.inserted_id),
            "filename": file.filename,
            "title": analysis_result.get("title", "Unknown"),
            "document_type": analysis_result.get("document_type", "Unknown"),
            "author": analysis_result.get("author", "Unknown"),
            "date": analysis_result.get("date", ""),
            "summary": analysis_result.get("summary", ""),
            "detailed_summary": analysis_result.get("detailed_summary", ""),
            "key_clauses": analysis_result.get("key_clauses", []),
            "obligations": analysis_result.get("obligations", []),
            "risks": analysis_result.get("risks", []),
            "risk_types": analysis_result.get("risk_types", []),
            "compliance_issues": analysis_result.get("compliance_issues", []),
            "metadata": analysis_result.get("metadata", {}),
            "overall_risk_level": analysis_result.get("overall_risk_level", "Unknown"),
        }
    finally:
        # Remove temporary file to keep storage clean.
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)
