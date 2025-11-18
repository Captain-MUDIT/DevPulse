# Dev Pulse

<a href="https://devpulse-sigma.vercel.app" target="_blank">👉 Live Demo</a>

AI-powered news aggregation platform for tech enthusiasts, founders, and developers. Automatically collects, categorizes, and summarizes articles from 40+ RSS feeds using state-of-the-art NLP models.

[![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://python.org)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg)](https://fastapi.tiangolo.com)

## Features

- 🤖 **AI-Powered Classification** - Zero-shot learning automatically categorizes articles into Business, Tech, Papers, and Patents
- 📝 **Smart Summarization** - BART-large-CNN model generates concise 60-100 word summaries
- 🔍 **Advanced Search & Filter** - Real-time search across titles, summaries, and content
- ⚡ **Parallel Processing** - Multi-threaded pipeline processes 30+ articles in under 15 seconds
- 🌐 **Modern UI** - Responsive React interface with smooth animations and dark mode support
- 📊 **40+ RSS Feeds** - Aggregates from TechCrunch, arXiv, The Verge, Wired, and more

## Architecture

The system follows a multi-stage pipeline architecture:

```
RSS Feeds → Fetcher → Filter (Zero-shot) → Summarizer (BART) → Database → API → Frontend
```

1. **Fetcher**: Parallel fetching with full content extraction from 40+ sources
2. **Filter**: Zero-shot classification assigns categories based on content
3. **Summarizer**: BART-large-CNN generates concise summaries
4. **Storage**: SQLite for development, PostgreSQL (Supabase) for production
5. **API**: FastAPI serves articles with pagination and filtering
6. **Frontend**: React app with real-time search and category filters

## Tech Stack

**Backend:** Python 3.11, PyTorch, Transformers (Hugging Face), FastAPI, SQLAlchemy, BeautifulSoup4, Feedparser  
**Frontend:** React 19, Vite, Framer Motion, Lucide Icons  
**Database:** SQLite (dev), PostgreSQL/Supabase (prod)  
**AI Models:** BART-large-CNN (summarization), BART-large-mnli (classification)

## Quick Start

### Backend

```bash
cd backend
python -m venv myenv
myenv\Scripts\activate
pip install -r requirements.txt

# Create .env with Supabase credentials
python main.py --pipeline parallel
python sync_to_supabase.py

cd src/api
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend/DevPulse
npm install
npm run dev
```

## Configuration

Configure RSS feeds in `backend/src/config/feeds.json`. Environment variables needed:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`
- `VITE_API_URL` (frontend)

## Project Structure

```
dev_pulse/
│
├── backend/
│   ├── main.py                      # Pipeline entry point (sequential/parallel modes)
│   ├── sync_to_supabase.py          # Sync SQLite → Supabase
│   ├── requirements.txt             # Python dependencies
│   │
│   └── src/
│       ├── models.py                # AI model loaders (BART, zero-shot)
│       │
│       ├── agents/
│       │   ├── agents.py            # Pipeline orchestration
│       │   ├── filter.py            # Zero-shot classification
│       │   ├── summarizer.py        # BART summarization
│       │   └── parallel_pipeline.py # Multi-threaded processing
│       │
│       ├── api/
│       │   ├── main.py              # FastAPI server
│       │   └── requirements_render.txt
│       │
│       ├── config/
│       │   └── feeds.json           # RSS feed URLs (40+ sources)
│       │
│       ├── db/
│       │   ├── db.py                # Database operations
│       │   ├── articles.db          # SQLite database (local)
│       │   └── view_articles.py     # DB viewer utility
│       │
│       └── fetcher/
│           └── fetcher.py           # RSS fetcher with content extraction
│
└── frontend/DevPulse/
    ├── package.json                 # Node dependencies
    ├── vite.config.js               # Vite configuration
    ├── index.html
    │
    └── src/
        ├── App.jsx                  # Main application component
        ├── main.jsx                 # React entry point
        │
        ├── components/
        │   ├── Header.jsx           # Navigation header
        │   ├── Hero.jsx             # Hero section
        │   ├── NewsGrid.jsx         # Article grid layout
        │   ├── NewsCard.jsx         # Individual article card
        │   ├── ArticleModal.jsx     # Article detail modal
        │   └── Footer.jsx
        │
        ├── context/
        │   └── ThemeContext.jsx     # Dark/light mode
        │
        ├── api/
        │   └── articles.js          # API client functions
        │
        └── styles/
            └── App.css              # Global styles
```

## License

MIT
