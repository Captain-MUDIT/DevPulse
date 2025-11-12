# backend/src/api/main.py

# from fastapi import FastAPI, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# import sqlite3
# from pydantic import BaseModel
# from typing import List, Optional
# import os

# app = FastAPI(title="DevPulse API")

# # Allow CORS for your frontend
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=[
#         "http://localhost:5173",
#         "https://devpulse.vercel.app"
#     ],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# DB_PATH = os.path.join(os.path.dirname(__file__), "..", "db", "articles.db")
# DB_PATH = os.path.abspath(DB_PATH)

# try:
#     conn = sqlite3.connect(DB_PATH)
#     print("Database connection successful!")
#     conn.close()
# except Exception as e:
#     print("Error connecting to DB:", e)


# # Pydantic model for Article
# class Article(BaseModel):
#     id: str
#     title: str
#     link: str
#     text: str
#     published: str
#     source: Optional[str] = None
#     categories: Optional[str] = None
#     summary: Optional[str] = None

# # Helper function to fetch articles
# def fetch_articles(limit: int = 20):
#     conn = sqlite3.connect(DB_PATH)
#     cursor = conn.cursor()
#     cursor.row_factory = sqlite3.Row
#     try:
#         cursor.execute(
#             f"SELECT * FROM articles ORDER BY published DESC LIMIT ?;", (limit,)
#         )
#         rows = cursor.fetchall()
#         articles = [dict(row) for row in rows]
#         return articles
#     finally:
#         conn.close()

# # GET /articles endpoint
# @app.get("/articles", response_model=List[Article])
# def get_articles(limit: int = 20):
#     articles = fetch_articles(limit)
#     if not articles:
#         raise HTTPException(status_code=404, detail="No articles found")
#     return articles

# # Root endpoint for testing
# @app.get("/")
# def root():
#     return {"message": "DevPulse API is running!"}



# backend/src/api/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Union
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Initialize logging
logger = logging.getLogger(__name__)

app = FastAPI(title="DevPulse API (Supabase)")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://devpulse.vercel.app",
        "https://devpulse-sigma.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection URL
DATABASE_URL = os.getenv("SUPABASE_DB_URL")

def get_connection():
    """Connect to Supabase PostgreSQL"""
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)

# Pydantic model
class Article(BaseModel):
    id: str
    title: str
    link: str
    text: str
    published: str
    source: Optional[str] = None
    categories: Optional[Union[str, List[str]]] = None
    summary: Optional[str] = None

@app.get("/")
def root():
    return {"message": "DevPulse API connected to Supabase PostgreSQL"}

@app.get("/articles", response_model=List[Article])
def get_articles(limit: int = 20):
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM articles ORDER BY published DESC LIMIT %s;", (limit,))
                articles = cur.fetchall()
        if not articles:
            raise HTTPException(status_code=404, detail="No articles found")
        return articles
    except Exception as e:
        logger.exception("Database error while fetching articles:")
        raise HTTPException(status_code=500, detail="Database error")
