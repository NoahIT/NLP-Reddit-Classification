import unittest
import json
from unittest.mock import patch, MagicMock
from app import create_app

class TestAPI(unittest.TestCase):
    def setUp(self):
        self.app, self.socketio = create_app()
        self.client = self.app.test_client()
        self.app.config['TESTING'] = True

    def test_health_check(self):
        response = self.client.get('/api/status')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['status'], 'ok')

    @patch('app.database.db_manager.DatabaseManager.query_sentiment_data')
    def test_get_data(self, mock_query_sentiment_data):
        mock_query_sentiment_data.return_value = [
            {'id': '1', 'subreddit': 'python', 'sentiment_label': 'positive', 'sentiment_score': 0.8}
        ]
        
        response = self.client.get('/api/data?subreddit=python')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['subreddit'], 'python')
        
    @patch('app.database.db_manager.DatabaseManager.get_kpi_stats')
    def test_get_stats(self, mock_get_kpi_stats):
        mock_get_kpi_stats.return_value = {
            'total_posts_24h': 100,
            'avg_sentiment_24h': 0.5
        }
        response = self.client.get('/api/stats')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['total_posts_24h'], 100)

    @patch('app.database.db_manager.DatabaseManager.get_distinct_subreddits')
    def test_get_subreddits(self, mock_get_subreddits):
        mock_get_subreddits.return_value = ['python', 'news']
        response = self.client.get('/api/subreddits')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('python', data)
        self.assertIn('news', data)

if __name__ == '__main__':
    unittest.main()
