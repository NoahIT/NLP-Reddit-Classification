from dataclasses import dataclass
from typing import Optional
from datetime import datetime

@dataclass
class RedditItem:
    id: str
    item_type: str
    subreddit: str
    author: str
    content: str
    url: str
    created_utc: datetime
    sentiment_label: Optional[str] = None
    sentiment_score: Optional[float] = None
    score: int = 0
    num_comments: int = 0

    def to_dict(self):
        return {
            "id": self.id,
            "item_type": self.item_type,
            "subreddit": self.subreddit,
            "author": self.author,
            "content": self.content,
            "url": self.url,
            "created_utc": self.created_utc.isoformat() if self.created_utc else None,
            "sentiment_label": self.sentiment_label,
            "sentiment_score": self.sentiment_score,
            "score": self.score,
            "num_comments": self.num_comments
        }
