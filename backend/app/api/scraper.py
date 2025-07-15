from fastapi import APIRouter
from models.scraper import ScraperRequest
from core.scraper import RedditAutoScraper
from core.analyzer.analyzer import WordFrequencyAnalyzer

router = APIRouter()

@router.post("/scraper/run-once")
def run_scraper_once(req: ScraperRequest):
    num_posts = getattr(req, 'num_posts', 20)
    scraper = RedditAutoScraper(
        subreddit=req.subreddit,
        num_posts=num_posts
    )
    new_posts = scraper.run_scraping_job()

    # Trigger incremental analyzer after scraping
    analyzer = WordFrequencyAnalyzer()
    analyzer.analyze_word_frequencies(data_source='database', incremental=True, subreddit=req.subreddit)
    
    # Return summary including new posts count
    return {
        "status": "completed", 
        "subreddit": req.subreddit,
        "new_posts_count": len(new_posts) if new_posts else 0,
        "message": f"Scraped {len(new_posts) if new_posts else 0} new posts and updated word frequencies"
    }