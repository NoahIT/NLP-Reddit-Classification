"""
Defines the routes for the JSON API.
"""
from flask import Flask, jsonify, request
from . import api_bp
from app.database import db_manager
from app.utils import on_demand_fetch

@api_bp.route('/status', methods=['GET'])
def get_status():
    """Simple health-check endpoint."""
    return jsonify({"status": "ok", "service": "Reddit Sentiment API"})

@api_bp.route('/data', methods=['GET'])
def get_data():
    """
    Main data endpoint.
    Returns all processed items, optionally filtered by subreddit.
    
    Query Params:
    ?subreddit=news
    ?limit=1000
    """
    subreddit = request.args.get('subreddit', None)
    limit = int(request.args.get('limit', 5000)) 
    data = db_manager.query_sentiment_data(
        subreddit=subreddit,
        timeframe_hours=24 * 7 # Look back 1 week
    )
    for item in data:
        item['created_utc'] = item['created_utc'].isoformat()
        
    return jsonify(data)

@api_bp.route('/subreddits', methods=['GET'])
def get_subreddits():
    """
    Returns a list of all unique subreddits in the database.
    """
    subreddits = db_manager.get_distinct_subreddits()
    return jsonify(subreddits)

@api_bp.route('/fetch/subreddit', methods=['POST'])
def fetch_subreddit():
    """
    Triggers an on-demand fetch for a specific subreddit.
    Expects JSON: {"subreddit": "python"}
    """
    data = request.get_json()
    if not data or 'subreddit' not in data:
        return jsonify({"status": "error", "message": "Missing 'subreddit' in JSON body"}), 400
        
    subreddit_name = data['subreddit']
    result = on_demand_fetch.fetch_subreddit_posts(subreddit_name)
    
    if result['status'] == 'error':
        return jsonify(result), 500
    return jsonify(result)

@api_bp.route('/fetch/random', methods=['POST'])
def fetch_random():
    """
    Triggers an on-demand fetch for random subreddits.
    """
    result = on_demand_fetch.fetch_random_posts()
    
    if result['status'] == 'error':
        return jsonify(result), 500
    return jsonify(result)

@api_bp.route('/stats', methods=['GET'])
def get_stats():
    """
    Returns a dictionary of key performance indicators (KPIs).
    """
    stats = db_manager.get_kpi_stats()
    return jsonify(stats)