"""
agents.py
Orchestrates full news pipeline
1. Fetch news
2. Filter news by category
3. Summarize filtered news
4. Save to db
"""

import logging
from ..fetcher.fetcher import Fetcher
from .filter import filter_articles_batch
from .summarizer import summarize_articles_batch
from ..db.db import init_db, save_articles_to_db

logging.basicConfig(level=logging.INFO)


# Main Pipeline
def run_pipeline():
    logging.info("Starting News Pipeline...")

    init_db()

    # 1. Fetch
    fetcher = Fetcher()
    articles = fetcher.fetch(limit=20)
    logging.info("Fetched %d articles", len(articles))
    
    # 2. Filter
    articles = filter_articles_batch(articles, threshold=0.5)
    logging.info("%d articles after filtering", len(articles))
    
    # 3. Summarize
    articles = summarize_articles_batch(articles, max_length=100)
    logging.info("%d articles after summarization", len(articles))
    
    # 4. Save to DB
    save_articles_to_db(articles)
    logging.info("Pipeline finished successfully.")