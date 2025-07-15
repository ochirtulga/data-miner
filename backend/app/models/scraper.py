from pydantic import BaseModel
from typing import Optional

class ScraperRequest(BaseModel):
    subreddit: str
    num_posts: Optional[int] = 20