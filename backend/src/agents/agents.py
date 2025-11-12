"""
agents.py
Orchestrates the news processing pipeline, offering both sequential and parallel execution modes.
"""

import logging
from ..fetcher.fetcher import Fetcher
from .filter import filter_articles_batch
from .summarizer import summarize_articles_batch
from ..db.db import init_db, save_articles_to_db
from .parallel_pipeline import run_parallel_pipeline as run_parallel_pipeline_impl

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


def run_sequential_pipeline():
    """
    Runs the news processing pipeline sequentially.
    1. Fetch news
    2. Filter news by category
    3. Summarize filtered news
    4. Save to db
    """
    logging.info("Starting SEQUENTIAL News Pipeline...")

    init_db()

    # 1. Fetch
    fetcher = Fetcher()
    articles = fetcher.fetch(limit=30)
    logging.info("Fetched %d articles", len(articles))
    
    if not articles:
        logging.info("No articles fetched. Pipeline finished.")
        return

    # 2. Filter
    filtered_articles = filter_articles_batch(articles, threshold=0.5)
    logging.info("%d articles after filtering", len(filtered_articles))

    if not filtered_articles:
        logging.info("No articles passed the filter. Pipeline finished.")
        return

    # 3. Summarize
    summarized_articles = summarize_articles_batch(filtered_articles, max_length=150)
    logging.info("%d articles after summarization", len(summarized_articles))

    # 4. Save to DB
    if summarized_articles:
        save_articles_to_db(summarized_articles)
    
    logging.info("SEQUENTIAL Pipeline finished successfully.")


def run_parallel_pipeline(
    fetch_limit: int = 30,
    num_filter_workers: int = 5,
    num_summarizer_workers: int = 2
):
    """
    Runs the news processing pipeline in parallel using threads and queues.
    """
    run_parallel_pipeline_impl(
        fetch_limit=fetch_limit,
        num_filter_workers=num_filter_workers,
        num_summarizer_workers=num_summarizer_workers
    )