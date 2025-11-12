"""   
filter.py 
This module filters raw news/articles based on categories using zero-shot-classifier
Input : list of article dicts(common schema)
Output : same list with 'categories' field populated
"""

# from transformers import pipeline
from ..models import load_zero_shot_classifier
import logging
import threading

# Initialse looging
logger = logging.getLogger(__name__)

# Lock for thread-safe model access
_classifier_lock = threading.Lock()


# Categories
CANDIDATE_LABELS = [
    # Core AI/Tech
    "Artificial Intelligence",
    "Machine Learning",
    "Technology",
    "Software Development",
    "Hardware",
    
    # Research & Innovation
    "Scientific Research",
    "Innovation",
    "Patent",
    "Breakthrough",
    
    # Business & Startups
    "Startups",
    "Funding",
    "Business",
    "Venture Capital",
    "Entrepreneurship",
    
    # Industry & Policy
    "Industry",
    "Regulation",
    "Policy",
    "Corporate Strategy",
    
    # Society & Future Trends
    "Education",
    "Sustainability",
    "Future Trends"
]

CATEGORY_MAP = {
    # Tech
    "Artificial Intelligence": "Tech",
    "Machine Learning": "Tech",
    "Technology": "Tech",
    "Software Development": "Tech",
    "Hardware": "Tech",
    "Innovation": "Tech",
    "Future Trends": "Tech",
    "Industry": "Tech",
    
    # Papers / Research
    "Scientific Research": "Papers",
    "Education": "Papers",
    "Breakthrough": "Papers",
    
    # Patents
    "Patent": "Patents",
    
    # Business
    "Startups": "Business",
    "Funding": "Business",
    "Business": "Business",
    "Venture Capital": "Business",
    "Entrepreneurship": "Business",
    "Corporate Strategy": "Business",
    "Regulation": "Business",
    "Policy": "Business",
    "Sustainability": "Business"
}


def filter_articles_batch(articles, threshold: float = 0.5, candidate_labels = CANDIDATE_LABELS, batch_size: int = 8):
    """
    Filters a batch of articles and assigns categories using batch processing for better performance.

    Args:
        articles (list): List of articles dicts (should have 'text' field)
        threshold (float): Minimum confidence to accept a category.
        candidate_labels(list): category labels to classify against
        batch_size (int): Number of articles to process in each batch
    
    Returns 
        List: filtered articles with 'categories' field populated 
    """
    
    classifier = load_zero_shot_classifier()
    logger.info("Filtering %d articles using zero-shot classifier (batch_size=%d)...", len(articles), batch_size)
    
    filtered_articles = []
    
    # Process articles in batches for better performance
    for i in range(0, len(articles), batch_size):
        batch = articles[i:i + batch_size]
        texts = []
        batch_articles = []
        
        # Prepare batch
        for art in batch:
            text = art.get("text", "")
            if text and len(text.strip()) > 50:  # Skip very short texts
                texts.append(text[:1000])  # Limit text length for classification
                batch_articles.append(art)
        
        if not texts:
            continue
        
        try:
            # Process batch at once for GPU efficiency
            # The pipeline will handle batching internally
            with _classifier_lock:
                # Process all texts in the batch at once
                results = classifier(texts, candidate_labels=candidate_labels)
            
            # Handle both single result and batch results
            if not isinstance(results, list):
                results = [results]
            
            # Process results
            for result, art in zip(results, batch_articles):
                try:
                    selected_labels = [
                        label for label, score in zip(result["labels"], result["scores"])
                        if score >= threshold
                    ]
                    
                    #Map categories into 4 lables
                    mapped_categories = {CATEGORY_MAP.get(label) for label in selected_labels if label in CATEGORY_MAP} 
                    
                    mapped_categories = [cat for cat in mapped_categories if cat]
                    
                    art["categories"] = mapped_categories
                    
                    if mapped_categories:
                        filtered_articles.append(art)
                except Exception as e:
                    logger.error("Failed to process classification result for article '%s': %s", art.get("title", ""), e)
                    
        except Exception as e:
            logger.error("Error in batch classification: %s", e)
            # Fallback to individual processing
            for art in batch_articles:
                try:
                    text = art.get("text", "")[:1000]
                    result = classifier(text, candidate_labels=candidate_labels)
                    selected_labels = [
                        label for label, score in zip(result["labels"], result["scores"])
                        if score >= threshold
                    ]
                    art["categories"] = selected_labels
                    if selected_labels:
                        filtered_articles.append(art)
                except Exception as e2:
                    logger.error("Failed to classify article '%s': %s", art.get("title", ""), e2)
            
    logger.info("Filtering complete. %d articles passed threshold %.2f", len(filtered_articles), threshold)
    return filtered_articles
    
    