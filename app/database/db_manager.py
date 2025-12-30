import mysql.connector
from mysql.connector import Error, pooling
from contextlib import contextmanager
from typing import List, Dict, Any, Optional
import logging
from app import config
from app.models import RedditItem

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DatabaseManager:
    def __init__(self):
        self.pool = self._create_pool()
        self._ensure_schema_updates()

    def _ensure_schema_updates(self):
        """Checks for missing columns and updates schema if needed."""
        try:
            with self.get_connection() as conn:
                if conn:
                    with conn.cursor() as cursor:
                        cursor.execute("SHOW COLUMNS FROM reddit_data LIKE 'score';")
                        if not cursor.fetchone():
                            logger.info("Column 'score' missing in reddit_data. Adding it...")
                            try:
                                cursor.execute("ALTER TABLE reddit_data ADD COLUMN score INT DEFAULT 0;")
                                conn.commit()
                                logger.info("Column 'score' added successfully.")
                            except Error as e:
                                if e.errno == 1060:
                                    logger.warning("Race condition detected: 'score' column already exists. Skipping.")
                                else:
                                    raise e
                        
                        cursor.execute("SHOW COLUMNS FROM reddit_data LIKE 'num_comments';")
                        if not cursor.fetchone():
                            logger.info("Column 'num_comments' missing in reddit_data. Adding it...")
                            try:
                                cursor.execute("ALTER TABLE reddit_data ADD COLUMN num_comments INT DEFAULT 0;")
                                conn.commit()
                                logger.info("Column 'num_comments' added successfully.")
                            except Error as e:
                                if e.errno == 1060:
                                    logger.warning("Race condition detected: 'num_comments' column already exists. Skipping.")
                                else:
                                    raise e
                                    
                        logger.info("Schema check passed.")
        except Error as e:
            logger.error(f"Error during schema update check: {e}")

    def _create_pool(self) -> pooling.MySQLConnectionPool:
        try:
            pool = pooling.MySQLConnectionPool(
                pool_name="reddit_pool",
                pool_size=5,
                pool_reset_session=True,
                host=config.DB_HOST,
                port=config.DB_PORT,
                user=config.DB_USER,
                password=config.DB_PASSWORD,
                database=config.DB_NAME
            )
            logger.info("MySQL Connection Pool created successfully.")
            return pool
        except Error as e:
            logger.error(f"Error while creating MySQL connection pool: {e}")
            raise

    @contextmanager
    def get_connection(self):
        connection = None
        try:
            connection = self.pool.get_connection()
            yield connection
        except Error as e:
            logger.error(f"Error getting connection from pool: {e}")
            yield None
        finally:
            if connection and connection.is_connected():
                connection.close()

    def insert_batch_data(self, data_list: List[RedditItem]):
        if not data_list:
            return

        query = """
        INSERT INTO reddit_data 
        (id, item_type, subreddit, author, content, url, created_utc, 
         sentiment_label, sentiment_score, score, num_comments)
        VALUES 
        (%(id)s, %(item_type)s, %(subreddit)s, %(author)s, %(content)s, %(url)s, 
         %(created_utc)s, %(sentiment_label)s, %(sentiment_score)s, %(score)s, %(num_comments)s)
        ON DUPLICATE KEY UPDATE
            content = VALUES(content),
            sentiment_label = VALUES(sentiment_label),
            sentiment_score = VALUES(sentiment_score),
            score = VALUES(score),
            num_comments = VALUES(num_comments),
            processed_at = CURRENT_TIMESTAMP
        """
        
        batch_params = [item.to_dict() for item in data_list]

        try:
            with self.get_connection() as conn:
                if conn:
                    with conn.cursor() as cursor:
                        cursor.executemany(query, batch_params)
                        conn.commit()
        except Error as e:
            logger.error(f"Error during batch insert: {e}")

    def query_sentiment_data(self, subreddit: Optional[str] = None,
                             subreddits: Optional[List[str]] = None,
                             keywords: Optional[str] = None,
                             timeframe_hours: int = 24) -> List[Dict[str, Any]]:
        base_query = """
        SELECT 
            id, 
            item_type, 
            subreddit, 
            created_utc, 
            sentiment_label, 
            sentiment_score,
            score,
            num_comments,
            content, 
            url
        FROM 
            reddit_data
        WHERE 
            created_utc >= NOW() - INTERVAL %s HOUR
        """
        
        params = [timeframe_hours]

        if subreddit:
            base_query += " AND subreddit = %s"
            params.append(subreddit)
        
        if subreddits and len(subreddits) > 0:
            placeholders = ', '.join(['%s'] * len(subreddits))
            base_query += f" AND subreddit IN ({placeholders})"
            params.extend(subreddits)

        if keywords:
            keyword_list = [k.strip() for k in keywords.split(',') if k.strip()]
            if keyword_list:
                keyword_conditions = []
                for k in keyword_list:
                    keyword_conditions.append("(content LIKE %s OR subreddit LIKE %s)")
                    params.extend([f"%{k}%", f"%{k}%"])
                
                if keyword_conditions:
                    base_query += " AND (" + " OR ".join(keyword_conditions) + ")"
            
        base_query += " ORDER BY created_utc DESC;"

        results = []
        try:
            with self.get_connection() as conn:
                if conn:
                    with conn.cursor(dictionary=True) as cursor:
                        cursor.execute(base_query, tuple(params))
                        results = cursor.fetchall()
        except Error as e:
            logger.error(f"Error querying sentiment data: {e}")
        
        return results

    def get_distinct_subreddits(self) -> List[str]:
        query = "SELECT DISTINCT subreddit FROM reddit_data ORDER BY subreddit ASC;"
        results = []
        try:
            with self.get_connection() as conn:
                if conn:
                    with conn.cursor() as cursor:
                        cursor.execute(query)
                        rows = cursor.fetchall()
                        results = [row[0] for row in rows]
        except Error as e:
            logger.error(f"Error getting distinct subreddits: {e}")
        
        return results

    def get_kpi_stats(self) -> Dict[str, Any]:
        stats = {}
        
        q_total = "SELECT COUNT(*) as count FROM reddit_data WHERE created_utc >= NOW() - INTERVAL 24 HOUR"
        q_avg_sentiment = "SELECT COALESCE(AVG(sentiment_score), 0) as avg_score FROM reddit_data WHERE created_utc >= NOW() - INTERVAL 24 HOUR"
        
        q_most_positive = """
            SELECT subreddit, AVG(sentiment_score) as avg_score
            FROM reddit_data
            WHERE created_utc >= NOW() - INTERVAL 24 HOUR
            GROUP BY subreddit
            ORDER BY avg_score DESC
            LIMIT 1
        """
        
        q_most_negative = """
            SELECT subreddit, AVG(sentiment_score) as avg_score
            FROM reddit_data
            WHERE created_utc >= NOW() - INTERVAL 24 HOUR
            GROUP BY subreddit
            ORDER BY avg_score ASC
            LIMIT 1
        """
        
        try:
            with self.get_connection() as conn:
                if conn:
                    with conn.cursor(dictionary=True) as cursor:
                        cursor.execute(q_total)
                        stats['total_posts_24h'] = cursor.fetchone()['count']
                        
                        cursor.execute(q_avg_sentiment)
                        stats['avg_sentiment_24h'] = cursor.fetchone()['avg_score']
                        
                        cursor.execute(q_most_positive)
                        pos_result = cursor.fetchone()
                        stats['most_positive_sub'] = pos_result if pos_result else {"subreddit": "N/A", "avg_score": 0}
                        
                        cursor.execute(q_most_negative)
                        neg_result = cursor.fetchone()
                        stats['most_negative_sub'] = neg_result if neg_result else {"subreddit": "N/A", "avg_score": 0}
                        
        except Error as e:
            logger.error(f"Error calculating KPI stats: {e}")
            return {}
            
        return stats

db_manager = DatabaseManager()