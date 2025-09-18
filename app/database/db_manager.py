"""
Database Management Module

Handles all interactions with the MySQL database, including
connection management, data insertion, and data retrieval.
"""

import mysql.connector
from mysql.connector import Error, pooling
from contextlib import contextmanager
from typing import List, Dict, Any, Optional
from app import config

try:
    connection_pool = pooling.MySQLConnectionPool(
        pool_name="reddit_pool",
        pool_size=5,
        pool_reset_session=True,
        host=config.DB_HOST,
        port=config.DB_PORT,
        user=config.DB_USER,
        password=config.DB_PASSWORD,
        database=config.DB_NAME
    )
    print("MySQL Connection Pool created successfully.")

except Error as e:
    print(f"Error while creating MySQL connection pool: {e}")
    raise

@contextmanager
def get_db_connection():
    """
    Context manager to safely get a connection from the pool and
    ensure it's returned.
    """
    try:
        connection = connection_pool.get_connection()
        yield connection
    except Error as e:
        print(f"Error getting connection from pool: {e}")
        yield None
    finally:
        if 'connection' in locals() and connection.is_connected():
            connection.close()
            # print("Connection returned to pool.") #for debugging

def insert_batch_data(data_list: List[Dict[str, Any]]):
    """
    Inserts a batch of processed Reddit data into the database.

    Args:
        data_list: A list of dictionaries, where each dict represents
                   a post or comment and matches the table schema.
    """
    if not data_list:
        return

    query = """
    INSERT INTO reddit_data 
    (id, item_type, subreddit, author, content, url, created_utc, 
     sentiment_label, sentiment_score)
    VALUES 
    (%(id)s, %(item_type)s, %(subreddit)s, %(author)s, %(content)s, %(url)s, 
     %(created_utc)s, %(sentiment_label)s, %(sentiment_score)s)
    ON DUPLICATE KEY UPDATE
        content = VALUES(content),
        sentiment_label = VALUES(sentiment_label),
        sentiment_score = VALUES(sentiment_score),
        processed_at = CURRENT_TIMESTAMP
    """
    
    batch_params = []
    for item in data_list:
        batch_params.append({
            "id": item.get('id'),
            "item_type": item.get('item_type'),
            "subreddit": item.get('subreddit'),
            "author": item.get('author'),
            "content": item.get('content'),
            "url": item.get('url'),
            "created_utc": item.get('created_utc'),
            "sentiment_label": item.get('sentiment_label'),
            "sentiment_score": item.get('sentiment_score')
        })

    try:
        with get_db_connection() as conn:
            if conn:
                with conn.cursor() as cursor:
                    cursor.executemany(query, batch_params)
                    conn.commit()
                    # print(f"Successfully inserted/updated {cursor.rowcount} rows.")
    except Error as e:
        print(f"Error during batch insert: {e}")

def query_sentiment_data(subreddit: Optional[str] = None,
                         timeframe_hours: int = 24) -> List[Dict[str, Any]]:
    """
    Queries the database for sentiment data for the dashboard.

    Args:
        subreddit: (Optional) The specific subreddit to filter by.
        timeframe_hours: The lookback window in hours.

    Returns:
        A list of dictionaries containing the query results.
    """
    base_query = """
    SELECT 
        id, 
        item_type, 
        subreddit, 
        created_utc, 
        sentiment_label, 
        sentiment_score
    FROM 
        reddit_data
    WHERE 
        created_utc >= NOW() - INTERVAL %s HOUR
    """
    
    params = [timeframe_hours]

    if subreddit:
        base_query += " AND subreddit = %s"
        params.append(subreddit)
        
    base_query += " ORDER BY created_utc DESC;"

    results = []
    try:
        with get_db_connection() as conn:
            if conn:
                with conn.cursor(dictionary=True) as cursor:
                    cursor.execute(base_query, tuple(params))
                    results = cursor.fetchall()
    except Error as e:
        print(f"Error querying sentiment data: {e}")
    
    return results

def get_distinct_subreddits() -> List[str]:
    """
    Gets a list of all unique subreddits currently in the database.
    Used to populate the dashboard filter dropdown.
    """
    query = "SELECT DISTINCT subreddit FROM reddit_data ORDER BY subreddit ASC;"
    results = []
    try:
        with get_db_connection() as conn:
            if conn:
                with conn.cursor() as cursor:
                    cursor.execute(query)
                    rows = cursor.fetchall()
                    results = [row[0] for row in rows]
    except Error as e:
        print(f"Error getting distinct subreddits: {e}")
    
    return results