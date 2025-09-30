"""
db.py
Handles database initialisation and saving of articles
"""
import sqlite3
import os
import logging
import json
import hashlib

# DB helper function
DB_PATH = os.path.join(os.path.dirname(__file__), "articles.db")

def init_db():
    """Initialize SQLite DB and create table if not exists."""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""              
        CREATE TABLE IF NOT EXISTS articles(
            id TEXT PRIMARY KEY,
            title TEXT,
            link TEXT,
            text TEXT,
            published TEXT,
            source TEXT,
            categories TEXT,
            summary TEXT
        )
    """)
    conn.commit()
    conn.close()
    logging.info("Database initialised at %s", DB_PATH)
    
    
def _generate_id(article):
    """Generate uid from link_published if not provided."""
    base = (article.get("link", "") + article.get("published", "")).encode("utf-8")
    return hashlib.md5(base).hexdigest()

def save_articles_to_db(articles):
    """Insert articles into the DB, ignoring duplicates."""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    for art in articles:
        try:
            art_id = art.get("id") or _generate_id(art)
            
            categories = art.get("categories", [])
            if isinstance(categories, (list, dict)):
                categories = json.dumps(categories)
            elif categories == None:
                categories = "[]"
                
            c.execute(""" 
                INSERT OR IGNORE INTO articles
                (id, title, link, text, published, source, categories, summary)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,(
            art_id,
            art.get("title"),
            art.get("link"),
            art.get("text"),
            art.get("published"),
            art.get("source"),
            categories,
            art.get("summary"),
        ))
            
        except Exception as e:
            logging.error("Failed to save article '%s':%s", art.get("title"), e)
    
    conn.commit()
    conn.close()
    logging.info("Saved %d articles to DB", len(articles))
    
    