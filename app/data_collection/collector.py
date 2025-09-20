"""
Data Collection Module

This module handles connecting to the Reddit API via PRAW
and fetching new posts and comments. It uses the NLP analyzer
to process text and the DB manager to store results.
"""

import praw
import time
import datetime
from typing import List, Dict, Any
from prawcore.exceptions import PrawcoreException

from app import config
from app.nlp import analyzer
from app.database import db_manager

def get_reddit_instance() -> praw.Reddit:
    """
    Initializes and returns a read-only PRAW Reddit instance
    using credentials from the config module.
    """
    try:
        reddit = praw.Reddit(
            client_id=config.REDDIT_CLIENT_ID,
            client_secret=config.REDDIT_CLIENT_SECRET,
            user_agent=config.REDDIT_USER_AGENT,
            # read_only=True # if no refresh_token
        )

        print(f"PRAW instance created. Read-only: {reddit.read_only}")
        _ = reddit.user.me()
        print("Reddit API connection successful.")
        return reddit
    except Exception as e:
        print(f"Failed to initialize PRAW: {e}")
        print("Please check your REDDIT_ environment variables in .env")
        raise

def _format_data(item: Any, item_type: str) -> Dict[str, Any]:
    """
    Internal helper to format a PRAW Post or Comment object
    into our standardized database dictionary.
    """
    data = {}
    if item_type == 'post':
        data['id'] = item.id
        data['content'] = item.title 
        data['url'] = f"https://www.reddit.com{item.permalink}"
    elif item_type == 'comment':
        data['id'] = item.id
        data['content'] = item.body
        data['url'] = f"https://www.reddit.com{item.permalink}"
    else:
        return None

    data['item_type'] = item_type
    data['subreddit'] = str(item.subreddit).lower()
    data['author'] = str(item.author) if item.author else "[deleted]"
    data['created_utc'] = datetime.datetime.fromtimestamp(item.created_utc)
    
    sentiment = analyzer.analyze_sentiment(data['content'])
    data['sentiment_label'] = sentiment['label']
    data['sentiment_score'] = sentiment['score']
    
    return data

def process_stream(reddit: praw.Reddit, 
                   subreddit_name: str, 
                   item_type: str = 'comment', 
                   batch_size: int = 50):
    """
    Starts a real-time stream for a subreddit (posts or comments).

    This function will run indefinitely.

    Args:
        reddit: An initialized PRAW instance.
        subreddit_name: The name of the subreddit to stream (e.g., 'python').
        item_type: 'comment' or 'post'.
        batch_size: Number of items to collect before a batch DB insert.
    """
    print(f"Starting {item_type} stream for r/{subreddit_name}...")
    subreddit = reddit.subreddit(subreddit_name)
    data_batch = []
    
    stream_func = None
    if item_type == 'comment':
        stream_func = subreddit.stream.comments
    elif item_type == 'post':
        stream_func = subreddit.stream.submissions
    else:
        raise ValueError("item_type must be 'comment' or 'post'")

    while True:
        try:
            for item in stream_func(skip_existing=True):
                try:
                    formatted_item = _format_data(item, item_type)
                    if formatted_item:
                        data_batch.append(formatted_item)
                        # print(f"Collected {item.id}") # for verbose logging
                    
                    if len(data_batch) >= batch_size:
                        print(f"[{datetime.datetime.now()}] Inserting batch of {len(data_batch)} {item_type}s...")
                        db_manager.insert_batch_data(data_batch)
                        data_batch = []
                        
                except Exception as e:
                    print(f"Error processing item {getattr(item, 'id', 'N/A')}: {e}")

        except PrawcoreException as e:
            print(f"PRAW API Error (RateLimit, ServerError, etc.): {e}")
            print("Sleeping for 60 seconds before retrying...")
            time.sleep(60)
        except Exception as e:
            print(f"An unexpected error occurred in the stream: {e}")
            print("Restarting stream in 30 seconds...")
            time.sleep(30)

def poll_keywords(reddit: praw.Reddit, 
                  keywords: List[str], 
                  subreddits: List[str] = ['all'], 
                  poll_interval: int = 300, 
                  batch_size: int = 50):
    """
    Periodically polls for keywords across one or more subreddits.

    This function will run indefinitely.

    Args:
        reddit: An initialized PRAW instance.
        keywords: A list of keywords to search for.
        subreddits: A list of subreddits to search in (e.g., ['all']).
        poll_interval: Time in seconds between polls.
        batch_size: Number of items to collect before a batch DB insert.
    """
    query = " OR ".join(keywords)
    subreddit_str = "+".join(subreddits)
    print(f"Starting keyword polling for '{query}' in r/{subreddit_str}...")
    
    processed_ids = set()

    while True:
        try:
            print(f"[{datetime.datetime.now()}] Polling for keywords: '{query}'")
            subreddit = reddit.subreddit(subreddit_str)
            data_batch = []
            
            for post in subreddit.search(query, sort='new', time_filter='hour', limit=100):
                if post.id not in processed_ids:
                    try:
                        formatted_post = _format_data(post, 'post')
                        if formatted_post:
                            data_batch.append(formatted_post)
                            processed_ids.add(post.id)
                    except Exception as e:
                        print(f"Error processing post {post.id}: {e}")

            if data_batch:
                print(f"Found {len(data_batch)} new posts. Inserting into DB...")
                db_manager.insert_batch_data(data_batch)
            else:
                print("No new posts found in this poll.")

            if len(processed_ids) > 10000:
                print("Pruning processed_ids cache...")
                processed_ids = set(list(processed_ids)[-5000:])
            
            print(f"Sleeping for {poll_interval} seconds...")
            time.sleep(poll_interval)

        except PrawcoreException as e:
            print(f"PRAW API Error during polling: {e}")
            print("Sleeping for 60 seconds before retrying...")
            time.sleep(60)
        except Exception as e:
            print(f"An unexpected error occurred during polling: {e}")
            print(f"Retrying in {poll_interval} seconds...")
            time.sleep(poll_interval)