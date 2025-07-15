# Data Miner: Reddit Scraper & Analyzer

A full-stack, modern Reddit data mining platform for scraping, analyzing, and exploring subreddit content and word frequencies in real time.

---

## Overview
- **Backend:** FastAPI (Python) with PostgreSQL/SQLite for scraping, analysis, and API endpoints.
- **Frontend:** React (Vite + TypeScript + Material-UI) for a beautiful, interactive UI.
- **Database:** All data is stored in a relational DB—no CSV/JSON file outputs.
- **Live Analysis:** Incremental word frequency analysis and subreddit-filtered exploration.

---

## Quick Start

### 1. Backend (API)
```bash
cd backend/app
pip install -r requirements.txt
uvicorn main:app --reload
```

### 2. Frontend (UI)
```bash
cd ui
npm install
npm run dev
```

---

## Main Features
- **Scrape any subreddit** (specify subreddit and number of posts)
- **Incremental word frequency analysis** after every scrape
- **Subreddit-filtered top words** in the UI
- **Live, interactive dashboard** (React + Material-UI)
- **API-driven**: All features accessible via REST endpoints

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

## UI Highlights
- **Subreddit filter dropdown** (populated live from DB)
- **Top words table** (updates after every scrape/analysis)
- **Scrape controls** (choose subreddit, post count, run analysis)
- **Incremental analysis button**

---

## More Info
- [Backend README](backend/app/core/README.md)
- [Frontend README](ui/README.md)
- [Scraper README](backend/app/core/scraper/README.md)
- [Analyzer README](backend/app/core/analyzer/README.md)

---

## License
MIT License. Modernized and maintained by your team. 