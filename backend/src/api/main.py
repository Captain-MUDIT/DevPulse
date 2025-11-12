# # backend/src/api/main.py
# from fastapi import FastAPI, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# from typing import List, Optional, Union
# import psycopg2
# from psycopg2.extras import RealDictCursor
# import os
# from dotenv import load_dotenv
# import logging

# # Load environment variables
# load_dotenv()

# # Initialize logging
# logger = logging.getLogger(__name__)

# app = FastAPI(title="DevPulse API (Supabase)")

# # CORS setup
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=[
#         "http://localhost:5173",
#         "https://devpulse.vercel.app",
#         "https://devpulse-sigma.vercel.app"
#     ],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Database connection URL
# DATABASE_URL = os.getenv("SUPABASE_DB_URL")

# def get_connection():
#     """Connect to Supabase PostgreSQL"""
#     return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)

# # Pydantic model
# class Article(BaseModel):
#     id: str
#     title: str
#     link: str
#     text: str
#     published: str
#     source: Optional[str] = None
#     categories: Optional[Union[str, List[str]]] = None
#     summary: Optional[str] = None

# @app.get("/")
# def root():
#     return {"message": "DevPulse API connected to Supabase PostgreSQL"}

# @app.get("/articles", response_model=List[Article])
# def get_articles(limit: int = 20):
#     try:
#         with get_connection() as conn:
#             with conn.cursor() as cur:
#                 cur.execute("SELECT * FROM articles ORDER BY published DESC LIMIT %s;", (limit,))
#                 articles = cur.fetchall()
#         if not articles:
#             raise HTTPException(status_code=404, detail="No articles found")
#         return articles
#     except Exception as e:
#         logger.exception("Database error while fetching articles:")
#         raise HTTPException(status_code=500, detail="Database error")


# backend/src/api/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from supabase import create_client, Client
import os
from dotenv import load_dotenv
import logging

# ---------------------------------------------------------------------
# Load environment variables
# ---------------------------------------------------------------------
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Validate env setup
if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables")

# Initialize Supabase client (via HTTPS)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# ---------------------------------------------------------------------
# FastAPI App Setup
# ---------------------------------------------------------------------
app = FastAPI(title="DevPulse API (Supabase HTTPS)")

# Allow your frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://devpulse.vercel.app",
        "https://devpulse-sigma.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class Article(BaseModel):
    id: str
    title: str
    link: str
    text: str
    published: str
    source: Optional[str] = None
    categories: Optional[str] = None
    summary: Optional[str] = None


# Routes
@app.get("/")
def root():
    return {"message": "✅ DevPulse API connected to Supabase via HTTPS"}

@app.get("/articles", response_model=List[Article])
def get_articles(limit: int = 20, page: int = 1):
    """
    Paginated article fetch from Supabase.
    Example: /articles?page=2&limit=20
    """
    try:
        start = (page - 1) * limit
        end = start + limit - 1  # Supabase uses inclusive range
        logger.info(f"Fetching articles page={page}, limit={limit} (range {start}-{end})")

        response = (
            supabase.table("articles")
            .select("*")
            .order("published", desc=True)
            .range(start, end)
            .execute()
        )

        if not response.data:
            raise HTTPException(status_code=404, detail="No articles found")

        return response.data

    except Exception as e:
        logger.error("Error fetching paginated articles: %s", e)
        raise HTTPException(status_code=500, detail="Database error")
