"""
Sentiment Analysis Module

This module uses NLTK's VADER (Valence Aware Dictionary and
sEntiment Reasoner) to perform sentiment analysis on text.
"""

import re
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from typing import Dict

try:
    analyzer = SentimentIntensityAnalyzer()
except LookupError:
    print("VADER lexicon not found. Please run: python -m nltk.downloader vader_lexicon")
    raise

def clean_text(text: str) -> str:
    """
    Performs basic text preprocessing.
    VADER is robust to raw text, but removing URLs and extra
    whitespace can improve consistency.
    """

    text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)

    text = re.sub(r'\/u\/\w+', '', text, flags=re.MULTILINE)

    text = re.sub(r'\/r\/\w+', '', text, flags=re.MULTILINE)

    text = " ".join(text.split())
    return text.strip()

def classify_sentiment(compound_score: float) -> str:
    """
    Classifies a VADER compound score into a simple category.

    Args:
        compound_score: A float between -1.0 and 1.0.

    Returns:
        A string label: 'positive', 'negative', or 'neutral'.
    """
    if compound_score >= 0.05:
        return 'positive'
    elif compound_score <= -0.05:
        return 'negative'
    else:
        return 'neutral'

def analyze_sentiment(text: str) -> Dict[str, float | str]:
    """
    Analyzes the sentiment of a given piece of text.

    Args:
        text: The raw text string to analyze.

    Returns:
        A dictionary containing the sentiment label ('positive',
        'negative', 'neutral') and the raw VADER compound score.
    """
    if not text:
        return {
            "label": "neutral",
            "score": 0.0
        }
        
    cleaned_text = clean_text(text)

    scores = analyzer.polarity_scores(cleaned_text)
    
    compound_score = scores['compound']
    
    label = classify_sentiment(compound_score)
    
    return {
        "label": label,
        "score": compound_score
    }

if __name__ == "__main__":
    test_texts = [
        "I love this! It's amazing. 😊",
        "This is the worst thing ever. I hate it!!! 😡",
        "I don't know, it's just okay. Not bad.",
        "The market is crashing, this is a disaster for /r/wallstreetbets",
        "Check out my post at https://www.reddit.com"
    ]
    
    print("--- VADER Sentiment Analyzer Test ---")
    for text in test_texts:
        sentiment = analyze_sentiment(text)
        print(f"\nText: {text}")
        print(f"Sentiment: {sentiment['label']} (Score: {sentiment['score']})")