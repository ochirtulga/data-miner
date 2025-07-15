# Backend: Reddit Data Miner API

This is the backend for the Data Miner project—a FastAPI-based service for scraping Reddit, analyzing word frequencies, and serving data to the React frontend.

---

## Quick Start
```bash
cd app
pip install -r requirements.txt
uvicorn main:app --reload
```

---

## Main Features
- **Scrape any subreddit** (specify subreddit and number of posts)
- **Incremental word frequency analysis** after every scrape
- **Subreddit-filtered top words** via API
- **Database-only storage** (PostgreSQL/SQLite)
- **REST API** for all features

---

## Key API Endpoints
- `POST /scraper/run-once` — Scrape a subreddit (with post count)
- `GET /analyzer` — Get top words (optionally filtered by subreddit)
- `GET /analyzer/subreddits` — List all scraped subreddits
- `POST /analyzer/incremental` — Run incremental analysis
- `GET /db/stats` — Database stats

---

## Database Schema (Highlights)
- `scraped_posts`: All Reddit posts
- `word_frequencies`: Word counts per (word, subreddit)
- `scraped_subreddits`: All subreddits ever scraped
- `scraping_sessions`: Scraping session metadata

---

## Development Notes
- All logs are written to `app/core/utils/data/logs/` (excluded from git)
- For deeper backend details, see [core/README.md](app/core/README.md)
- The backend is designed to be API-first and stateless

---

## Connecting to the Frontend
- The React frontend (in `../ui/`) communicates with this API for all data and actions
- CORS is enabled for local development

---

## License
MIT License. Modernized and maintained by your team. 