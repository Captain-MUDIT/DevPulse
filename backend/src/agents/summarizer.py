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


def summarize_articles_batch(articles, max_length = 100, min_length = 30, llm_choice: str = "huggingface"):
    """
    Summarizes a batch of articles with improved text handling.

    Args:
        articles (list): list of article dicts
        max_length (int): Max tokens/words in summary.
        min_length (int): Min tokens/words in summary.
        llm_choice (str): "huggingface" or "openai"

    Returns:
        list: articles with summary field filled
    """
    summarizer = load_summarizer(model_choice=llm_choice)
    logger.info("Summarizing %d articles using %s...", len(articles), llm_choice)

    # Prepare texts for batch processing
    texts_to_summarize = []
    articles_to_process = []  # Keep track of which articles need processing
    
    for art in articles:
        text = art.get("text", "")
        if not text or len(text.strip()) < 100:
            art["summary"] = ""
            continue  # Skip articles with no content, we'll add them back later
        
        # Truncate text to avoid token limits (BART models have 1024 token limit)
        # Rough estimate: 1 token ≈ 4 characters, so 4000 chars ≈ 1000 tokens
        max_input_length = 4000
        if len(text) > max_input_length:
            # Try to truncate at sentence boundary
            truncated = text[:max_input_length]
            last_period = truncated.rfind('.')
            if last_period > max_input_length * 0.8:  # If we found a period in last 20%
                text = truncated[:last_period + 1]
            else:
                text = truncated
        
        texts_to_summarize.append(text)
        articles_to_process.append(art)
    
    # Process in batches for GPU efficiency
    batch_size = 4  # Process 4 articles at a time
    for i in range(0, len(texts_to_summarize), batch_size):
        batch_texts = texts_to_summarize[i:i + batch_size]
        batch_articles = articles_to_process[i:i + batch_size]
        
        try:
            if llm_choice == "huggingface":
                # Process batch at once - pipeline handles GPU batching
                results = summarizer(
                    batch_texts, 
                    max_length=max_length,
                    min_length=min_length,
                    do_sample=False  # Deterministic summaries
                )
                
                # Handle results (can be list of dicts or list of lists)
                if not isinstance(results, list):
                    results = [results]
                
                # Process each result
                for result, art in zip(results, batch_articles):
                    # Handle both possible keys
                    if isinstance(result, list) and len(result) > 0:
                        if "summary_text" in result[0]:
                            summary = result[0]["summary_text"]
                        else:
                            summary = result[0].get("generated_text", "")
                    elif isinstance(result, dict):
                        summary = result.get("summary_text", result.get("generated_text", ""))
                    else:
                        summary = str(result) if result else ""
                    
                    # Clean up summary
                    if summary:
                        summary = summary.strip()
                        summary = ' '.join(summary.split())
                    
                    art["summary"] = summary
                    
            elif llm_choice == "openai":
                # OpenAI processing (sequential for now)
                for text, art in zip(batch_texts, batch_articles):
                    try:
                        response = summarizer(text)
                        summary = response.content if hasattr(response, "content") else str(response)
                        if summary:
                            summary = summary.strip()
                            summary = ' '.join(summary.split())
                        art["summary"] = summary
                    except Exception as e:
                        logger.error("Failed to summarise article '%s': %s", art.get("title", ""), e)
                        art["summary"] = ""
            else:
                raise ValueError("Invalid llm choice. Use 'huggingface' or 'openai'.")
                
        except Exception as e:
            logger.error("Error in batch summarization: %s", e)
            # Fallback to individual processing
            for text, art in zip(batch_texts, batch_articles):
                try:
                    result = summarizer(
                        text,
                        max_length=max_length,
                        min_length=min_length,
                        do_sample=False
                    )
                    if isinstance(result, list) and len(result) > 0:
                        summary = result[0].get("summary_text", result[0].get("generated_text", ""))
                    else:
                        summary = ""
                    art["summary"] = summary.strip() if summary else ""
                except Exception as e2:
                    logger.error("Failed to summarise article '%s': %s", art.get("title", ""), e2)
                    art["summary"] = ""
            
    # Return all articles (both processed and skipped ones)
    logger.info("Summarization complete")
    return articles
