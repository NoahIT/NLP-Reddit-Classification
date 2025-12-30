import re
from nltk.sentiment.vader import SentimentIntensityAnalyzer as NLTKSentimentIntensityAnalyzer
from typing import Dict
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SentimentAnalyzer:
    def __init__(self):
        try:
            self.analyzer = NLTKSentimentIntensityAnalyzer()
        except LookupError:
            logger.error("VADER lexicon not found. Please run: python -m nltk.downloader vader_lexicon")
            raise

    def clean_text(self, text: str) -> str:
        text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
        text = re.sub(r'\/u\/\w+', '', text, flags=re.MULTILINE)
        text = re.sub(r'\/r\/\w+', '', text, flags=re.MULTILINE)
        text = " ".join(text.split())
        return text.strip()

    def classify_sentiment(self, compound_score: float) -> str:
        if compound_score >= 0.05:
            return 'positive'
        elif compound_score <= -0.05:
            return 'negative'
        else:
            return 'neutral'

    def analyze_sentiment(self, text: str) -> Dict[str, float | str]:
        if not text:
            return {
                "label": "neutral",
                "score": 0.0
            }
            
        cleaned_text = self.clean_text(text)
        scores = self.analyzer.polarity_scores(cleaned_text)
        compound_score = scores['compound']
        label = self.classify_sentiment(compound_score)
        
        return {
            "label": label,
            "score": compound_score
        }

analyzer = SentimentAnalyzer()