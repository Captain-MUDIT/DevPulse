"""
summarizer.py
This module summarizes articles/news into concise summarises (60-100 words).
Input : List of articles dicts(must have 'text')
Output : same list with 'summary' field populated
"""

import logging
from ..models import load_summarizer

# Initialises logging
logger = logging.getLogger(__name__)


def summarize_articles_batch(articles, max_length = 100, llm_choice: str = "huggingface"):
    """
    Summarizes a batch of articles

    Args:
        articles (list): list of article dicts
        max_length (int): Max tokens/words in summary.
        llm_choice (str): "huggingface" or "openai.

    Returns:
        list: articles with summary field filled
    """
    summarizer = load_summarizer(model_choice=llm_choice)
    logger.info("Summarizing %d articles using %s...", len(articles), llm_choice)

    summarized_articles = []
    
    for art in articles:
        text = art.get("text", "")
        if not text:
            art["summary"] = ""
            summarized_articles.append(art)
            continue
        
        try:
            if llm_choice=="huggingface":
                result = summarizer(text, max_length=max_length)
                # Handle both possible keys
                if isinstance(result, list) and "summary_text" in result[0]:
                    summary = result[0]["summary_text"]
                else:
                    summary = result[0].get("generated_text", "")
                    
            elif llm_choice == "openai":
                response = summarizer(text)
                summary = response.content if hasattr(response, "content") else str(response)
            
            else:
                raise ValueError("Invalid llm choice. Use 'huggingface' or 'openai'.")
            
            
            art["summary"] = summary
            summarized_articles.append(art)
            
        except Exception as e:
            logger.error("Failed to summarise article '%s':%s", art.get("title",""), e)
            art["summary"]=""
            summarized_articles.append(art)
            
    logger.info("Summarization complete")
    return summarized_articles
