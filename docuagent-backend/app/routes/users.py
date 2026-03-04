from __future__ import annotations

from fastapi import APIRouter, Depends

try:
    from app.auth import require_admin
    from app.database import get_users_collection
except ModuleNotFoundError as exc:
    if exc.name not in {"app", "app.auth", "app.database"}:
        raise
    from auth import require_admin
    from database import get_users_collection


router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("")
def list_users(_admin: dict = Depends(require_admin)):
    users = get_users_collection()
    docs = users.find({}, {"password_hash": 0}).sort("email", 1)
    return [
        {
            "id": str(user.get("_id")),
            "username": user.get("username_display") or user.get("username"),
            "email": user.get("email"),
            "role": user.get("role", "user"),
        }
        for user in docs
    ]
