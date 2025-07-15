from pydantic import BaseModel
from typing import Optional

class PostFilterRequest(BaseModel):
    subreddit: Optional[str] = None
    limit: Optional[int] = 100
    after: Optional[str] = None
    before: Optional[str] = None

class ExportRequest(BaseModel):
    format: str = 'csv'  # or 'json'
    subreddit: Optional[str] = None
    limit: Optional[int] = 100