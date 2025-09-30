"""   
filter.py 
This module filters raw news/articles based on categories using zero-shot-classifier
Input : list of article dicts(common schema)
Output : same list with 'categories' field populated
"""

# from transformers import pipeline
from ..models import load_zero_shot_classifier
import logging

# Initialse looging
logger = logging.getLogger(__name__)


# Categories
CANDIDATE_LABELS = ["AI", "Startups","Funding","Technology", "Research", "Business", "Patent"]


def filter_articles_batch(articles, threshold: float = 0.5, candidate_labels = CANDIDATE_LABELS):
    """
    Filters a batch of articles and assigns.

    Args:
        articles (list): List of articles dicts (should have 'text' field)
        threshold (float): Minimum confidence to accept a category.
        candidate_labels(list): category labels to classify against
    
    Returns 
        List: filtered articles with 'categories' field populated 
    """
    
    
    classifier = load_zero_shot_classifier()
    logger.info("Filtering %d articles using zero-shot classifier...", len(articles))
    
    filtered_articles = []
    
    for art in articles:
        text = art.get("text", "")
        if not text:
            continue
        
        try:
            # zero shot classification
            result = classifier(text, candidate_labels = candidate_labels)
            
            #select labels above threshold
            selected_labels = [
                label for label, score in zip(result["labels"], result["scores"])
                if score>=threshold
            ]            
            art["categories"] = selected_labels
            
            if selected_labels:
                filtered_articles.append(art)
        
        except Exception as e:
            logger.error("Failed to classify article '%s': %s", art.get("title",""), e)
            
    logger.info("Filtering complete. %d articles passed threshold %.2f", len(filtered_articles), threshold)
    return filtered_articles
    
    