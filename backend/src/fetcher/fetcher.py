"""
fetcher.py
Enhanced with full article content extraction and parallel fetching
"""
import feedparser
import json
import os
import hashlib
from datetime import datetime
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Dict, Optional
import requests
from bs4 import BeautifulSoup
import time

logger = logging.getLogger(__name__)

class Fetcher:
    def __init__(self, extract_full_content: bool = True, max_workers: int = 10):
        """
        Initialises the Fetcher Agent.
        Loads feed urls from src/config/feed.json
        
        Args:
            extract_full_content: If True, fetches full article content from URLs
            max_workers: Number of parallel workers for fetching
        """
        # Get base directory from src
        base_dir = os.path.dirname(os.path.dirname(__file__))
        self.config_path = os.path.join(base_dir, "config", "feeds.json")

        # load feeds
        self.feeds = self._load_feed()
        self.extract_full_content = extract_full_content
        self.max_workers = max_workers
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        
    def _load_feed(self):
        """
        Loads feed urls from feeds.json
        Returns a list of urls
        If file doesn't exists, creates an empty one.
        """
        try:
            if not os.path.exists(self.config_path):
                with open(self.config_path, "w") as f:
                    json.dump({"feeds": []}, f, indent = 2)
                return []
            
            with open(self.config_path, "r") as f:
                data = json.load(f)
                return data.get("feeds", [])
        except Exception as e:
            logger.error(f"[ERROR] Could not load feeds.json: {e}")
            return []
        
    def _save_feeds(self):
        """
        Saves the updated feeds list back into feeds.json
        """
        try:
            with open(self.config_path, "w") as f:
                json.dump({"feeds": self.feeds}, f, indent=2)
        except Exception as e:
            logger.error(f"[ERROR] Could not save feeds.json: {e}")
            
    def add_feed(self, url:str):
        """
        Adds a new feed URL  if not already present.
        Updates feeds.json automatically.
        """
        
        if url not in self.feeds:
            self.feeds.append(url)
            self._save_feeds()
            logger.info(f"[INFO] Feed added: {url}")
        else:
            logger.info(f"[INFO] feed already exists: {url}")
    
    def _extract_full_content(self, url: str, timeout: int = 10) -> Optional[str]:
        """
        Extracts full article content from URL.
        Falls back to RSS summary if extraction fails.
        
        Args:
            url: Article URL
            timeout: Request timeout in seconds
            
        Returns:
            Full article text or None
        """
        if not url:
            return None
            
        try:
            response = self.session.get(url, timeout=timeout, allow_redirects=True)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Remove script and style elements
            for script in soup(["script", "style", "nav", "header", "footer", "aside"]):
                script.decompose()
            
            # Try to find main content (common patterns)
            content_selectors = [
                'article',
                '[role="main"]',
                '.article-content',
                '.post-content',
                '.entry-content',
                'main',
                '.content'
            ]
            
            text = None
            for selector in content_selectors:
                content = soup.select_one(selector)
                if content:
                    text = content.get_text(separator=' ', strip=True)
                    if len(text) > 200:  # Ensure we got substantial content
                        break
            
            # Fallback: get all paragraphs
            if not text or len(text) < 200:
                paragraphs = soup.find_all('p')
                text = ' '.join([p.get_text(strip=True) for p in paragraphs])
            
            # Clean up text
            if text:
                # Remove excessive whitespace
                text = ' '.join(text.split())
                # Limit length to avoid token issues (keep first 5000 chars)
                if len(text) > 5000:
                    text = text[:5000] + "..."
            
            return text if text and len(text) > 100 else None
            
        except Exception as e:
            logger.debug(f"Failed to extract content from {url}: {e}")
            return None
    
    def _fetch_single_feed(self, feed_url: str, limit: int) -> List[Dict]:
        """
        Fetches articles from a single RSS feed.
        
        Args:
            feed_url: RSS feed URL
            limit: Maximum articles per feed
            
        Returns:
            List of article dictionaries
        """
        articles = []
        try:
            parsed_feed = feedparser.parse(feed_url)
            source_title = parsed_feed.feed.get("title", "Unknown Source")
            
            for entry in parsed_feed.entries[:limit]:
                # Generate uuid from title + link
                uid = hashlib.md5((entry.get("title", "") + entry.get("link", "")).encode()).hexdigest()
                
                # Get text from RSS summary first
                rss_text = entry.get("summary", entry.get("description", ""))
                
                # Extract full content if enabled
                full_text = None
                if self.extract_full_content and entry.get("link"):
                    full_text = self._extract_full_content(entry.get("link"))
                    time.sleep(0.5)  # Rate limiting
                
                # Use full text if available, otherwise use RSS summary
                article_text = full_text if full_text else rss_text
                
                article = {
                    "id": uid, 
                    "title": entry.get("title", "No Title"),
                    "link": entry.get("link", ""),
                    "published": entry.get("published", entry.get("updated", datetime.now().isoformat())),
                    "source": source_title,
                    "text": article_text or "No content",
                    "categories": [],
                    "summary": "",
                }
                articles.append(article)
                
        except Exception as e:
            logger.error(f"[ERROR] Failed to parse {feed_url}: {e}")
        
        return articles
    
    def fetch(self, limit: int = 50, parallel: bool = True):
        """
        Fetches articles from all feeds with optional parallel processing.
        
        Args:
            limit: Number of articles per feed
            parallel: If True, fetch feeds in parallel
            
        Returns:
            List of article dictionaries with consistent schema
        """
        articles = []
        
        if parallel and len(self.feeds) > 1:
            # Parallel fetching
            with ThreadPoolExecutor(max_workers=min(self.max_workers, len(self.feeds))) as executor:
                future_to_feed = {
                    executor.submit(self._fetch_single_feed, feed_url, limit): feed_url 
                    for feed_url in self.feeds
                }
                
                for future in as_completed(future_to_feed):
                    feed_url = future_to_feed[future]
                    try:
                        feed_articles = future.result()
                        articles.extend(feed_articles)
                        logger.info(f"Fetched {len(feed_articles)} articles from {feed_url}")
                    except Exception as e:
                        logger.error(f"Error fetching {feed_url}: {e}")
        else:
            # Sequential fetching (original behavior)
            for feed_url in self.feeds:
                feed_articles = self._fetch_single_feed(feed_url, limit)
                articles.extend(feed_articles)
                logger.info(f"Fetched {len(feed_articles)} articles from {feed_url}")
        
        logger.info(f"Total articles fetched: {len(articles)}")
        return articles