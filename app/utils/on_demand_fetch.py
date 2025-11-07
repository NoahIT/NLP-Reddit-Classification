"""
On-Demand Fetcher

This module handles short-lived, user-initiated data fetching.
It is separate from the long-running collector.
"""
import praw
import datetime
from typing import List, Dict, Any

from app import config
from app.nlp import analyzer
from app.database import db_manager

def get_temp_reddit_instance() -> praw.Reddit:
    """
    Initializes a temporary, read-only PRAW instance.
    """
    try:
        reddit = praw.Reddit(
            client_id=config.REDDIT_CLIENT_ID,
            client_secret=config.REDDIT_CLIENT_SECRET,
            user_agent=config.REDDIT_USER_AGENT,
        )
        _ = reddit.user.me() 
        return reddit
    except Exception as e:
        print(f"Failed to create temp PRAW instance: {e}")
        return None

def _format_post_for_db(post: praw.models.Submission) -> Dict[str, Any]:
    """
    Internal helper to format a PRAW Post object and analyze it.
    """
    data = {}
    data['id'] = post.id
    data['content'] = post.title + " " + post.selftext
    data['url'] = f"https://www.reddit.com{post.permalink}"
    data['item_type'] = 'post'
    data['subreddit'] = str(post.subreddit).lower()
    data['author'] = str(post.author) if post.author else "[deleted]"
    data['created_utc'] = datetime.datetime.fromtimestamp(post.created_utc)
    
    # Perform sentiment analysis
    sentiment = analyzer.analyze_sentiment(data['content'])
    data['sentiment_label'] = sentiment['label']
    data['sentiment_score'] = sentiment['score']
    
    return data

def fetch_subreddit_posts(subreddit_name: str, limit: int = 50) -> Dict[str, Any]:
    """
    Fetches the 'hot' posts from a specific subreddit,
    analyzes them, and stores them in the DB.
    """
    print(f"Starting on-demand fetch for r/{subreddit_name}...")
    reddit = get_temp_reddit_instance()
    if not reddit:
        return {"status": "error", "message": "Failed to connect to Reddit API"}
        
    try:
        subreddit = reddit.subreddit(subreddit_name)
        data_batch = []
        for post in subreddit.hot(limit=limit):
            if not post.stickied: # Skip pinned posts
                formatted_post = _format_post_for_db(post)
                data_batch.append(formatted_post)
        
        if data_batch:
            db_manager.insert_batch_data(data_batch)
            
        print(f"On-demand fetch complete. Added {len(data_batch)} posts.")
        return {
            "status": "success", 
            "message": f"Fetched and stored {len(data_batch)} posts from r/{subreddit_name}"
        }

    except Exception as e:
        print(f"Error during on-demand fetch: {e}")
        return {"status": "error", "message": str(e)}

def fetch_random_posts(limit_per_sub: int = 10, num_subs: int = 10) -> Dict[str, Any]:
    """
    Fetches posts from random subreddits.
    """
    print("Starting on-demand fetch for random subreddits...")
    reddit = get_temp_reddit_instance()
    if not reddit:
        return {"status": "error", "message": "Failed to connect to Reddit API"}

    try:
        data_batch = []
        random_subs = [sub.display_name for sub in reddit.subreddits.random_n(num_subs)]
        
        for sub_name in random_subs:
            try:
                subreddit = reddit.subreddit(sub_name)
                for post in subreddit.hot(limit=limit_per_sub):
                    if not post.stickied:
                        formatted_post = _format_post_for_db(post)
                        data_batch.append(formatted_post)
            except Exception:
                continue # Skip if subreddit is private/banned

        if data_batch:
            db_manager.insert_batch_data(data_batch)
            
        print(f"Random fetch complete. Added {len(data_batch)} posts.")
        return {
            "status": "success", 
            "message": f"Fetched and stored {len(data_batch)} posts from {len(random_subs)} subreddits"
        }
    except Exception as e:
        print(f"Error during random fetch: {e}")
        return {"status": "error", "message": str(e)}