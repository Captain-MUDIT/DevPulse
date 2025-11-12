"""
sync_to_supabase.py
Copies all rows from local sqlite articles.db
To supabase postgreSQL database.
"""

import sqlite3
import psycopg2
from psycopg2.extras import execute_values
import os 
from dotenv import load_dotenv
import logging

logger = logging.getLogger(__name__)

load_dotenv()
SUPABASE_DB_URL = os.getenv("SUPABASE_DB_URL")

#Local SQLite db path
SQLITE_DB_PATH = os.path.join(os.path.dirname(__file__), "src", "db", "articles.db")

def fetch_from_sqlite():
    """Fetch all articles from sqlite database"""
    try:
        conn = sqlite3.connect(SQLITE_DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM articles;")
        rows = [dict(row) for row in cursor.fetchall()]
        conn.close()
        logger.info(f"Fetched {len(rows)} from local sql db.")
        return rows
    except Exception as e:
        logger.exception("Error fetching from SQLite:")
        raise

def insert_into_supabase(rows):
    """Insert articles into supabase (PostgreSQL) database."""
    if not rows:
        logger.warning("No rows found in local DB.Nothing to upload.")
        return 
    
    columns = [
        "id", "title", "link", "text", "published",
        "source", "categories", "summary"
    ]
    
    insert_query = f"""
        INSERT INTO articles ({', '.join(columns)})
        VALUES %s
        ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            link = EXCLUDED.link,
            text = EXCLUDED.text,
            published = EXCLUDED.published,
            source = EXCLUDED.source,
            categories = EXCLUDED.categories,
            summary = EXCLUDED.summary;
    """
    data = [tuple(row.get(col) for col in columns) for row in rows]
    
    logger.info(f"Uploading {len(data)} articles to Supabase...")
    
    try:
        with psycopg2.connect(SUPABASE_DB_URL) as conn:
            with conn.cursor() as cur:
                execute_values(cur, insert_query, data)
                conn.commit()
        logger.info("Successfully synced data into Supabase.")
    except Exception as e:
        logger.exception("Error inserting into Supabase:")
        raise
    
def clear_local_db():
    """Delete all rows from articles.db"""
    try:
        conn = sqlite3.connect(SQLITE_DB_PATH)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM articles;")
        conn.commit()
        conn.close()
        logger.info("🧹 Cleared local SQLite database after sync.")
    except Exception:
        logger.exception("Error clearing local database:")
        raise

    
def main():
    logger.info("Sync Started.")
    try:
        rows = fetch_from_sqlite()
        if insert_into_supabase(rows):
            clear_local_db()
        logger.info("Sync complete.")
    except Exception:
        logger.exception("Sync failed due to an error.")
        
if __name__ == "__main__":
    if not logging.getLogger().hasHandlers():
        logging.basicConfig(level = logging.INFO)
    main()