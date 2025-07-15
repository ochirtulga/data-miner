from pydantic import BaseModel
from typing import Optional

class AnalyzerRequest(BaseModel):
    data_source: str = 'both'  # 'files', 'database', or 'both'
    top_n: int = 50
    search: Optional[str] = None
    word: Optional[str] = None