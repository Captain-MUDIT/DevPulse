"""
models.py
This file handles all AI models used in the project.
It includes:
1. Summarization (LLMs)
2. Embeddings for filtering/search
3. Zero-shot classifier for article categorization   
"""

from transformers import pipeline
# from langchain_huggingface import HuggingFacePipeline
# from langchain_openai import ChatOpenAI, OpenAIEmbeddings
import os

# 1.Summarization Model
def load_summarizer(model_choice: str = "huggingface"):
    """
    Loads a summarization LLM pipeline.

    Args:
        model_choice (str): "huggingface" or "openai".
    
    Returns:
        summarizer object
    """
    
    if model_choice == "huggingface":
        model_id = "sshleifer/distilbart-cnn-12-6"
        summarizer = pipeline("summarization", model=model_id, device_map="auto")
        return summarizer
    
    # elif model_choice=="openai":
    #     return ChatOpenAI(model="gpt-4o-mini")
    
    else:
        raise ValueError(f"Unsupported model choice: {model_choice}")
    
# 2.Embedding Model
def load_embeddings(model_choice: str = "huggingface"):
    """
    Load embedding model for similarity search and filtering.

    Args:
        model_choice (str): "huggingface" or "openai".
        
    Returns:
        embeddings object.
    """
    
    # if model_choice == "huggingface":
    #     model_id = "sentence-transformers/all-MiniLM-L6-v2"
    #     embedder = pipeline.from_model_id(
    #         model_id=model_id,
    #         task = "embedding"
    #     )
    #     return embedder
    if model_choice == "huggingface":
        from sentence_transformers import SentenceTransformer
        model_id = "all-MiniLM-L6-v2"
        embedder = SentenceTransformer(model_id)
        return embedder
    
    # elif model_choice == "openai":
    #     return OpenAIEmbeddings(model = "text-embedding-3-small")
    
    else:
        raise ValueError("Invalid model choice. Use 'huggingface' or 'openai'.")

# 3. Zero-shot Classifier
_zero_shot_classifier = None
def load_zero_shot_classifier():
    """
    Loads a Hugging Face zero-shot-classifier pipeline.

    Returns:
        A pipeline object that can classify text with arbitary labels.
    """
    global _zero_shot_classifier
    if _zero_shot_classifier is None:
        _zero_shot_classifier = pipeline(
            "zero-shot-classification",
            model = "facebook/bart-large-mnli",
            device_map = "auto"
        )
    return _zero_shot_classifier
   
    
# 4.Helper: Load Both
def load_models(llm_choice: str = "huggingface", emb_choice: str = "huggingface"):
    """
    Load both summarizer and embedding model.

    Args:
        llm_choice (str): "huggingface" or "openai"
        emb_choice (str): "huggingface" or "openai"
        
    Returns:
        dict: {"summarizer": ..., "embeddings": ..., "classifier": ...}
    """
    
    summarizer = load_summarizer(model_choice=llm_choice)
    embeddings = load_embeddings(model_choice=emb_choice)
    classifier  = load_zero_shot_classifier()
    return {
        "summarizer": summarizer, 
        "embeddings": embeddings,
        "classifier": classifier
        }