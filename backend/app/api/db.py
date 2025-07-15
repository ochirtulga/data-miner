from fastapi import APIRouter
from core.utils.database import DatabaseManager

router = APIRouter()

@router.get("/db/stats")
def db_stats():
    db = DatabaseManager()
    stats = db.get_database_stats()
    return stats