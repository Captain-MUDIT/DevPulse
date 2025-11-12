"""
parallel_pipeline.py
Orchestrates a parallel news processing pipeline using queues and threads.
"""

import logging
from queue import Queue, Empty
from threading import Thread
from typing import List, Dict, Optional

from ..fetcher.fetcher import Fetcher
from .filter import filter_articles_batch
from .summarizer import summarize_articles_batch
from ..db.db import init_db, save_articles_to_db

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(threadName)s - %(message)s')

# Sentinel value to signal the end of the queue
STOP_SIGNAL = object()

def fetcher_worker(fetch_queue: Queue, limit: int = 10):
    """
    Worker to fetch articles and put them into a queue.
    """
    logging.info("Fetcher worker started.")
    fetcher = Fetcher()
    articles = fetcher.fetch(limit=limit, parallel=True)
    for article in articles:
        fetch_queue.put(article)
    fetch_queue.put(STOP_SIGNAL)  # Signal that fetching is done
    logging.info(f"Fetcher worker finished. Fetched {len(articles)} articles.")

def filter_worker(fetch_queue: Queue, summarize_queue: Queue, threshold: float = 0.5):
    """
    Worker to filter articles from a queue and put them into another queue.
    """
    logging.info("Filter worker started.")
    while True:
        try:
            # Use a timeout to avoid blocking indefinitely
            article = fetch_queue.get(timeout=1)
            if article is STOP_SIGNAL:
                summarize_queue.put(STOP_SIGNAL)  # Pass the signal on
                break

            # We process one article at a time here, but the batching is in the function
            filtered_articles = filter_articles_batch([article], threshold=threshold)
            if filtered_articles:
                summarize_queue.put(filtered_articles[0])
        except Empty:
            continue
        except Exception as e:
            logging.error(f"Error in filter worker: {e}")
    logging.info("Filter worker finished.")

def summarizer_worker(summarize_queue: Queue, db_queue: Queue, max_length: int = 150):
    """
    Worker to summarize articles from a queue and put them into another queue.
    """
    logging.info("Summarizer worker started.")
    while True:
        try:
            article = summarize_queue.get(timeout=1)
            if article is STOP_SIGNAL:
                db_queue.put(STOP_SIGNAL)  # Pass the signal on
                break
            
            summarized_articles = summarize_articles_batch([article], max_length=max_length)
            if summarized_articles:
                db_queue.put(summarized_articles[0])
        except Empty:
            continue
        except Exception as e:
            logging.error(f"Error in summarizer worker: {e}")
    logging.info("Summarizer worker finished.")

def db_writer_worker(db_queue: Queue):
    """
    Worker to save all articles from a queue to the database in a single batch at the end.
    """
    logging.info("DB writer worker started.")
    articles_to_save = []
    while True:
        try:
            article = db_queue.get(timeout=1)
            if article is STOP_SIGNAL:
                if articles_to_save:
                    save_articles_to_db(articles_to_save)
                    logging.info(f"Saved a final batch of {len(articles_to_save)} articles to DB.")
                break
            articles_to_save.append(article)
        except Empty:
            continue
        except Exception as e:
            logging.error(f"Error in DB writer worker: {e}")
    logging.info("DB writer worker finished.")


def run_parallel_pipeline(
    fetch_limit: int = 25,
    num_filter_workers: int = 5,
    num_summarizer_workers: int = 2
):
    """
    Runs the parallel news processing pipeline.
    """
    logging.info("Starting PARALLEL News Pipeline...")

    init_db()

    fetch_queue = Queue()
    summarize_queue = Queue()
    db_queue = Queue()

    # Start the workers
    fetcher = Thread(target=fetcher_worker, args=(fetch_queue, fetch_limit), name="Fetcher")
    
    filter_workers = [
        Thread(target=filter_worker, args=(fetch_queue, summarize_queue), name=f"Filterer-{i+1}")
        for i in range(num_filter_workers)
    ]
    
    summarizer_workers = [
        Thread(target=summarizer_worker, args=(summarize_queue, db_queue), name=f"Summarizer-{i+1}")
        for i in range(num_summarizer_workers)
    ]

    db_writer = Thread(target=db_writer_worker, args=(db_queue,), name="DB-Writer")

    # Start all threads
    fetcher.start()
    for w in filter_workers:
        w.start()
    for w in summarizer_workers:
        w.start()
    db_writer.start()

    # Wait for all threads to complete
    fetcher.join()
    for w in filter_workers:
        w.join()
    for w in summarizer_workers:
        w.join()
    db_writer.join()

    logging.info("PARALLEL Pipeline finished successfully.")
