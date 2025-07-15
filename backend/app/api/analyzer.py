from fastapi import APIRouter, Body, Query
from models.analyzer import AnalyzerRequest
from core.analyzer.analyzer import WordFrequencyAnalyzer
from core.utils.database import DatabaseManager
from core.utils.config import Config
from fastapi.responses import JSONResponse

router = APIRouter()

@router.get("/analyzer")
def get_top_words(top_n: int = Query(10, description="Number of top words to return"), subreddit: str = Query(None, description="Subreddit to filter by")):
    """Get top words from the word_frequencies table, optionally filtered by subreddit"""
    db = DatabaseManager()
    try:
        words = db.get_top_words(top_n=top_n, subreddit=subreddit)
        return {"words": words, "total": len(words)}
    except Exception as e:
        return JSONResponse(
            status_code=500, 
            content={"detail": f"Error retrieving top words: {str(e)}"}
        )

@router.post("/analyzer/run")
def run_analyzer(req: AnalyzerRequest):
    analyzer = WordFrequencyAnalyzer()
    result = analyzer.analyze_word_frequencies(data_source=req.data_source, incremental=False)
    return {"status": "completed", "result": result}

@router.post("/analyzer/run-full")
def run_full_analyzer(
    data_source: str = Body('both'),
    output_dir: str = Body('data/analyzed'),
    top_n: int = Body(50),
    search: str = Body(None),
    word_details: str = Body(None),
    incremental: bool = Body(False)
):
    analyzer = WordFrequencyAnalyzer()
    summary = {}
    # Analyze word frequencies
    frequencies = analyzer.analyze_word_frequencies(data_source=data_source, incremental=incremental)
    if not frequencies:
        return JSONResponse(status_code=400, content={"detail": "No data found to analyze. Make sure you have scraped some Reddit data first."})
    summary['total_unique_words'] = len(frequencies)
    summary['total_word_occurrences'] = sum(frequencies.values())
    summary['top_words'] = analyzer.word_analyzer.word_frequencies.most_common(top_n)
    # Handle search
    if search:
        summary['search_pattern'] = search
        summary['search_matches'] = analyzer.search_words(search)
    # Handle word details
    if word_details:
        summary['word_details'] = analyzer.get_word_details(word_details.lower())
    # Generate report
    summary['report_file'] = 'Saved to database'
    return {"status": "completed", "summary": summary}


@router.get("/analyzer/subreddits")
def list_subreddits():
    db = DatabaseManager()
    try:
        subreddits = db.list_scraped_subreddits()
        return {"subreddits": subreddits}
    except Exception as e:
        return JSONResponse(status_code=500, content={"detail": f"Error retrieving subreddits: {str(e)}"})

@router.post("/analyzer/incremental")
def run_incremental_analyzer():
    analyzer = WordFrequencyAnalyzer()
    analyzer.analyze_word_frequencies(data_source='database', incremental=True)
    return {"status": "completed"}