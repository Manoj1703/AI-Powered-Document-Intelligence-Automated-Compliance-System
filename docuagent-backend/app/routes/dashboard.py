from fastapi import APIRouter

# Import collection accessor with fallback for alternate execution paths.
try:
    from app.database import get_collection
except ModuleNotFoundError:
    from database import get_collection

# Dashboard endpoints are grouped under /api/dashboard.
router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


# Helper to count documents by risk level.
# Supports both legacy top-level and nested analysis structure.
def _count_by_level(collection, level: str) -> int:
    return collection.count_documents(
        {
            "$or": [
                {"overall_risk_level": level},
                {"analysis.overall_risk_level": level},
            ]
        }
    )


@router.get("/stats")
def get_dashboard_stats():
    # Fetch MongoDB collection once for all dashboard queries.
    collection = get_collection()

    # Overall document count.
    total_documents = collection.count_documents({})

    # Risk distribution counts used by dashboard charts/cards.
    high_risk = _count_by_level(collection, "High")
    medium_risk = _count_by_level(collection, "Medium")
    low_risk = _count_by_level(collection, "Low")

    return {
        "total_documents": total_documents,
        "risk_breakdown": {"high": high_risk, "medium": medium_risk, "low": low_risk},
    }
