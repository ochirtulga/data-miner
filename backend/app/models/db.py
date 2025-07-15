from pydantic import BaseModel
from typing import Optional

class DBActionRequest(BaseModel):
    subreddit: Optional[str] = None
    older_than_days: Optional[int] = None