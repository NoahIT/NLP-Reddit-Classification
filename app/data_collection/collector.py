import praw
import time
import datetime
from typing import List, Dict, Any, Optional
from prawcore.exceptions import PrawcoreException
from flask_socketio import SocketIO
import logging
from app import config
from app.models import RedditItem
from app.database.db_manager import DatabaseManager
from app.nlp.analyzer import SentimentAnalyzer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info("Initializing Collector's SocketIO client...")
external_socketio = SocketIO(message_queue=config.REDIS_URL)

class RedditCollector:
    def __init__(self, db_manager: DatabaseManager, analyzer: SentimentAnalyzer):
        self.db_manager = db_manager
        self.analyzer = analyzer
        self.reddit = self._get_reddit_instance()

    def _get_reddit_instance(self) -> praw.Reddit:
        try:
            reddit = praw.Reddit(
                client_id=config.REDDIT_CLIENT_ID,
                client_secret=config.REDDIT_CLIENT_SECRET,
                user_agent=config.REDDIT_USER_AGENT,
            )
            logger.info(f"PRAW instance created. Read-only: {reddit.read_only}")
            _ = reddit.user.me()
            logger.info("Reddit API connection successful.")
            return reddit
        except Exception as e:
            logger.error(f"Failed to initialize PRAW: {e}")
            logger.error("Please check your REDDIT_ environment variables in .env")
            raise

    def _format_data(self, item: Any, item_type: str) -> Optional[RedditItem]:
        try:
            content = ""
            url = ""
            if item_type == 'post':
                content = f"{item.title} {item.selftext}"
                url = f"https://www.reddit.com{item.permalink}"
            elif item_type == 'comment':
                content = item.body
                url = f"https://www.reddit.com{item.permalink}"
            else:
                return None

            sentiment = self.analyzer.analyze_sentiment(content)
            
            return RedditItem(
                id=item.id,
                item_type=item_type,
                subreddit=str(item.subreddit).lower(),
                author=str(item.author) if item.author else "[deleted]",
                content=content,
                url=url,
                created_utc=datetime.datetime.fromtimestamp(item.created_utc),
                sentiment_label=sentiment['label'],
                sentiment_score=sentiment['score'],
                score=getattr(item, 'score', 0),
                num_comments=getattr(item, 'num_comments', 0)
            )
        except Exception as e:
            logger.error(f"Error formatting item {getattr(item, 'id', 'N/A')}: {e}")
            return None

    def process_stream(self, subreddit_name: str, item_type: str = 'comment', batch_size: int = 50):
        logger.info(f"Starting {item_type} stream for r/{subreddit_name}...")
        subreddit = self.reddit.subreddit(subreddit_name)
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
                        formatted_item = self._format_data(item, item_type)
                        if formatted_item:
                            data_batch.append(formatted_item)
                        
                        if len(data_batch) >= batch_size:
                            logger.info(f"[{datetime.datetime.now()}] Inserting batch of {len(data_batch)} {item_type}s...")
                            self.db_manager.insert_batch_data(data_batch)
                            
                            logger.info(f"Emitting {len(data_batch)} new items via WebSocket...")
                            external_socketio.emit('new_data_batch', [item.to_dict() for item in data_batch])

                            data_batch = []
                            
                    except Exception as e:
                        logger.error(f"Error processing item {getattr(item, 'id', 'N/A')}: {e}")

            except PrawcoreException as e:
                logger.error(f"PRAW API Error (RateLimit, ServerError, etc.): {e}")
                logger.info("Sleeping for 60 seconds before retrying...")
                time.sleep(60)
            except Exception as e:
                logger.error(f"An unexpected error occurred in the stream: {e}")
                logger.info("Restarting stream in 30 seconds...")
                time.sleep(30)

    def poll_keywords(self, keywords: List[str], subreddits: List[str] = ['all'], 
                      poll_interval: int = 300, batch_size: int = 50):
        query = " OR ".join(keywords)
        subreddit_str = "+".join(subreddits)
        logger.info(f"Starting keyword polling for '{query}' in r/{subreddit_str}...")
        
        processed_ids = set()

        while True:
            try:
                logger.info(f"[{datetime.datetime.now()}] Polling for keywords: '{query}'")
                subreddit = self.reddit.subreddit(subreddit_str)
                data_batch = []
                
                for post in subreddit.search(query, sort='new', time_filter='hour', limit=100):
                    if post.id not in processed_ids:
                        try:
                            formatted_post = self._format_data(post, 'post')
                            if formatted_post:
                                data_batch.append(formatted_post)
                                processed_ids.add(post.id)
                        except Exception as e:
                            logger.error(f"Error processing post {post.id}: {e}")

                if data_batch:
                    logger.info(f"Found {len(data_batch)} new posts. Inserting into DB...")
                    self.db_manager.insert_batch_data(data_batch)
                    logger.info(f"Emitting {len(data_batch)} new items via WebSocket...")
                    external_socketio.emit('new_data_batch', [item.to_dict() for item in data_batch])
                else:
                    logger.info("No new posts found in this poll.")

                if len(processed_ids) > 10000:
                    logger.info("Pruning processed_ids cache...")
                    processed_ids = set(list(processed_ids)[-5000:])
                
                logger.info(f"Sleeping for {poll_interval} seconds...")
                time.sleep(poll_interval)

            except PrawcoreException as e:
                logger.error(f"PRAW API Error during polling: {e}")
                logger.info("Sleeping for 60 seconds before retrying...")
                time.sleep(60)
            except Exception as e:
                logger.error(f"An unexpected error occurred during polling: {e}")
                logger.info(f"Retrying in {poll_interval} seconds...")
                time.sleep(poll_interval)

    def fetch_subreddit_posts(self, subreddit_name: str, limit: int = 50) -> Dict[str, Any]:
        logger.info(f"Starting on-demand fetch for r/{subreddit_name}...")
        try:
            subreddit = self.reddit.subreddit(subreddit_name)
            data_batch = []
            for post in subreddit.hot(limit=limit):
                if not post.stickied: 
                    formatted_post = self._format_data(post, 'post')
                    if formatted_post:
                        data_batch.append(formatted_post)
            
            if data_batch:
                self.db_manager.insert_batch_data(data_batch)
                
            logger.info(f"On-demand fetch complete. Added {len(data_batch)} posts.")
            return {
                "status": "success", 
                "message": f"Fetched and stored {len(data_batch)} posts from r/{subreddit_name}"
            }

        except Exception as e:
            logger.error(f"Error during on-demand fetch: {e}")
            return {"status": "error", "message": str(e)}

    def fetch_random_posts(self, limit_per_sub: int = 10, num_subs: int = 10) -> Dict[str, Any]:
        logger.info("Starting on-demand fetch for random subreddits...")
        try:
            data_batch = []
            random_subs = [sub.display_name for sub in self.reddit.subreddits.random_n(num_subs)]
            
            for sub_name in random_subs:
                try:
                    subreddit = self.reddit.subreddit(sub_name)
                    for post in subreddit.hot(limit=limit_per_sub):
                        if not post.stickied:
                            formatted_post = self._format_data(post, 'post')
                            if formatted_post:
                                data_batch.append(formatted_post)
                except Exception:
                    continue 
            
            if data_batch:
                self.db_manager.insert_batch_data(data_batch)
                
            logger.info(f"Random fetch complete. Added {len(data_batch)} posts.")
            return {
                "status": "success", 
                "message": f"Fetched and stored {len(data_batch)} posts from {len(random_subs)} subreddits"
            }
        except Exception as e:
            logger.error(f"Error during random fetch: {e}")
            return {"status": "error", "message": str(e)}