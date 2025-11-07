"""
API Blueprint
"""
from flask import Blueprint

# A Blueprint is a way to organize a group of related routes
# We will register this blueprint with our main Flask app
api_bp = Blueprint('api_bp', __name__)

# Import the routes to register them with the blueprint
from . import routes