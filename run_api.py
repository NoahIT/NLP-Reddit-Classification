"""
API Server - Entry Point
"""
import eventlet
eventlet.monkey_patch() # Must be at the very top

from app import create_app
from app.config import DEBUG

print("Creating Flask app and SocketIO...")
app, socketio = create_app()

if __name__ == "__main__":
    print("Starting Flask-SocketIO server with Eventlet...")
    print(f"API will be available at http://127.0.0.1:5000/ (Debug: {DEBUG})")
    
    # Use socketio.run to start the WebSocket server
    socketio.run(app, host='0.0.0.0', port=5000, debug=DEBUG)