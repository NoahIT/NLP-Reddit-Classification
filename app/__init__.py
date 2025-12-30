"""
Application Factory
"""
from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO
from app import config

# 1. Initialize SocketIO here
socketio = SocketIO()

def create_app():
    """
    Creates the core Flask app instance.
    """
    app = Flask(__name__)
    
    # 2. Configure CORS for both the app and Socket.IO
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # 3. Initialize SocketIO with the app and Redis message queue
    socketio.init_app(app, message_queue=config.REDIS_URL, cors_allowed_origins="*")

    # Register the API blueprint
    from .api import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')

    @app.route('/')
    def health_check():
        return "API is running. Access data at /api/data"

    # 4. Return both app and socketio
    return app, socketio