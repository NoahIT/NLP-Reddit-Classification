"""
API Server - Entry Point

Run this script to start the Flask API server.
"""
from app import create_app

app = create_app()

if __name__ == "__main__":
    print("Starting Flask API server...")
    print("API will be available at http://127.0.0.1:5000/")
    
    # Host must be 0.0.0.0 to be accessible from outside the Docker container
    app.run(debug=True, host='0.0.0.0', port=5000)