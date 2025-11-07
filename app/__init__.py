"""
Application Factory

This file creates and configures the Flask application.
"""
from flask import Flask
from flask_cors import CORS
from app import config

def create_app():
    """
    Creates the core Flask app instance.
    """
    app = Flask(__name__)
    
    # Configure CORS to allow our React frontend to make requests
    # In production, you'd lock this down to your frontend's domain.
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Register the API blueprint
    from .api import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')

    @app.route('/')
    def health_check():
        return "API is running. Access data at /api/data"

    return app