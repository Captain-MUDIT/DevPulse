"""
This package handles database operations for news pipeline,
including initialistion and saving articles.
"""

from .db import init_db, save_articles_to_db

__all__ = ["init_db", "save_articles_to_db"]