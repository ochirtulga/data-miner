from fastapi import APIRouter
from core.utils.database import DatabaseManager
from core.utils.config import Config

router = APIRouter()

@router.get("/data/posts")
def list_posts(subreddit: str = None, limit: int = 100):
    db = DatabaseManager()
    posts = db.get_posts_for_analysis(limit=limit)
    if subreddit:
        posts = [p for p in posts if p['subreddit'].lower() == subreddit.lower()]
    return posts