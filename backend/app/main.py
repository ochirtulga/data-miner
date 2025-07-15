from fastapi import FastAPI
from api.scraper import router as scraper_router
from api.analyzer import router as analyzer_router
from api.db import router as db_router
from api.data import router as data_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Reddit Scraper & Analyzer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify your frontend URL, e.g. ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scraper_router)
app.include_router(analyzer_router)
app.include_router(db_router)
app.include_router(data_router)

@app.get("/health")
def health_check():
    return {"status": "ok"}