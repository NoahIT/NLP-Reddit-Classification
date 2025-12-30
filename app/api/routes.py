from flask import Flask, jsonify, request
from . import api_bp
from app.database.db_manager import db_manager
from app.nlp.analyzer import analyzer
from app.data_collection.collector import RedditCollector
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

collector_service = RedditCollector(db_manager, analyzer)

@api_bp.route('/status', methods=['GET'])
def get_status():
    return jsonify({"status": "ok", "service": "Reddit Sentiment API"})

@api_bp.route('/data', methods=['GET'])
def get_data():
   
    subreddit = request.args.get('subreddit', None)
    
    subreddits_arg = request.args.get('subreddits', None)
    subreddits = None
    if subreddits_arg:
        subreddits = [s.strip() for s in subreddits_arg.split(',') if s.strip()]

    keywords = request.args.get('keywords', None)

    try:
        timeframe = int(request.args.get('timeframe', 24 * 7))
    except ValueError:
        timeframe = 24 * 7
        
    data = db_manager.query_sentiment_data(
        subreddit=subreddit,
        subreddits=subreddits,
        keywords=keywords,
        timeframe_hours=timeframe
    )
    for item in data:
        if item.get('created_utc'):
            item['created_utc'] = item['created_utc'].isoformat()
        
    return jsonify(data)

@api_bp.route('/subreddits', methods=['GET'])
def get_subreddits():
    subreddits = db_manager.get_distinct_subreddits()
    return jsonify(subreddits)

@api_bp.route('/groups', methods=['GET'])
def get_groups():
    groups = {
        "Tech": ["technology", "programming", "hardware", "software", "gadgets"],
        "News": ["news", "worldnews", "politics", "science"],
        "Crypto": ["bitcoin", "cryptocurrency", "ethereum", "dogecoin"],
        "Finance": ["finance", "investing", "wallstreetbets", "stocks"],
        "Entertainment": ["movies", "music", "gaming", "books", "television"]
    }
    return jsonify(groups)

@api_bp.route('/fetch/subreddit', methods=['POST'])
def fetch_subreddit():
    data = request.get_json()
    if not data or 'subreddit' not in data:
        return jsonify({"status": "error", "message": "Missing 'subreddit' in JSON body"}), 400
        
    subreddit_name = data['subreddit']
    result = collector_service.fetch_subreddit_posts(subreddit_name)
    
    if result['status'] == 'error':
        return jsonify(result), 500
    return jsonify(result)

@api_bp.route('/fetch/random', methods=['POST'])
def fetch_random():
    result = collector_service.fetch_random_posts()
    
    if result['status'] == 'error':
        return jsonify(result), 500
    return jsonify(result)

@api_bp.route('/stats', methods=['GET'])
def get_stats():
    stats = db_manager.get_kpi_stats()
    return jsonify(stats)