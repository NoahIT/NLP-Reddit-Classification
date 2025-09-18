"""
Configuration Module

This module loads environment variables from a .env file and makes them
available as Python constants. This centralizes configuration and keeps
secrets out of the source code.
"""

import os
from dotenv import load_dotenv

dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path)

REDDIT_CLIENT_ID = os.getenv('REDDIT_CLIENT_ID')
REDDIT_CLIENT_SECRET = os.getenv('REDDIT_CLIENT_SECRET')
REDDIT_USER_AGENT = os.getenv('REDDIT_USER_AGENT')

DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = int(os.getenv('DB_PORT', 3306))
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_NAME = os.getenv('DB_NAME')

if not all([REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USER_AGENT]):
    raise ValueError("Reddit API credentials (CLIENT_ID, CLIENT_SECRET, USER_AGENT) not found in .env file.")

if not all([DB_USER, DB_PASSWORD, DB_NAME]):
    raise ValueError("Database credentials (DB_USER, DB_PASSWORD, DB_NAME) not found in .env file.")