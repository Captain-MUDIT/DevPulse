"""
fetcher.py
"""
import feedparser
import json
import os
import hashlib
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class Fetcher:
    def __init__(self):
        """
        Initialises the Fetcher Agent.
        Loads feed urls from src/config/feed.json
        """
        # Get base directory from src
        base_dir = os.path.dirname(os.path.dirname(__file__))
        self.config_path = os.path.join(base_dir, "config", "feeds.json")

        # load feeds
        self.feeds = self._load_feed()
        
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
    
    def fetch(self, limit:int = 50):
        """
        Fetches articles from all feeds.
        Returns a list of dicts with consistent schemas:
        {
            "id": str, "title":str, "link": str,
            "published": str, "source": str,
            "text": str, "categories": list, "summary": str
        }
        limit -> no. of articles per feed.
        """
        articles = []
        for feed_url in self.feeds:
            try:
                parsed_feed = feedparser.parse(feed_url)
                source_title = parsed_feed.feed.get("title", "Unknown Source")
                for entry in parsed_feed.entries[:limit]:
                    # Generate uuid from title + link.
                    uid = hashlib.md5((entry.get("title", "") + entry.get("link", "")).encode()).hexdigest()
                    article = {
                        "id": uid, 
                        "title": entry.get("title", "No Title"),
                        "link": entry.get("link", ""),
                        "published": entry.get("published", entry.get("updated", datetime.now().isoformat())),
                        "source": source_title,
                        "text": entry.get("summary", "No content"),         # full text fall back
                        "categories": [],                                   # by filter.py
                        "summary": "",                                      # by summarizer.py
                    }
                    articles.append(article)
                    
            except Exception as e:
                logging.error(f"[ERROR] Failed to parse {feed_url}: {e}")
        
        return articles