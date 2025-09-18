CREATE DATABASE IF NOT EXISTS reddit_sentiment_db;

USE reddit_sentiment_db;

CREATE TABLE IF NOT EXISTS reddit_data (
    id VARCHAR(20) PRIMARY KEY,
    item_type ENUM('post', 'comment') NOT NULL,
    subreddit VARCHAR(100) NOT NULL,
    author VARCHAR(100),
    content TEXT NOT NULL,
    url VARCHAR(1024),
    created_utc DATETIME NOT NULL,
    sentiment_label ENUM('positive', 'negative', 'neutral') NOT NULL,
    sentiment_score FLOAT NOT NULL,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subreddit ON reddit_data (subreddit);
CREATE INDEX idx_created_utc ON reddit_data (created_utc);
CREATE INDEX idx_sentiment_label ON reddit_data (sentiment_label);