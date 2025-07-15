from pydantic import BaseModel
from typing import Optional, List

class ScraperRequest(BaseModel):
    subreddit: str
    output_dir: Optional[str] = None
    db_path: Optional[str] = None

class AnalyzerRequest(BaseModel):
    data_source: str = 'both'
    top_n: int = 50
    search: Optional[str] = None
    word: Optional[str] = None

class DBActionRequest(BaseModel):
    subreddit: Optional[str] = None
    older_than_days: Optional[int] = None

class PostFilterRequest(BaseModel):
    subreddit: Optional[str] = None
    limit: Optional[int] = 100
    after: Optional[str] = None
    before: Optional[str] = None

class ExportRequest(BaseModel):
    format: str = 'csv'  # or 'json'
    subreddit: Optional[str] = None
    limit: Optional[int] = 100 