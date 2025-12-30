import unittest
from unittest.mock import MagicMock, patch
from app.models import RedditItem
from app.database.db_manager import DatabaseManager
from app.nlp.analyzer import SentimentAnalyzer
from app.data_collection.collector import RedditCollector
from datetime import datetime

class TestRefactoring(unittest.TestCase):
    def test_models(self):
        item = RedditItem(
            id="123",
            item_type="post",
            subreddit="test",
            author="user",
            content="content",
            url="http://url",
            created_utc=datetime.now(),
            sentiment_label="positive",
            sentiment_score=0.8
        )
        self.assertEqual(item.id, "123")
        self.assertEqual(item.to_dict()['id'], "123")
        
        # Test edge cases
        item_empty = RedditItem(
            id="",
            item_type="",
            subreddit="",
            author="",
            content="",
            url="",
            created_utc=datetime.now(),
            sentiment_label="neutral",
            sentiment_score=0.0
        )
        self.assertEqual(item_empty.id, "")

    @patch('app.database.db_manager.pooling.MySQLConnectionPool')
    def test_db_manager(self, mock_pool):
        db = DatabaseManager()
        self.assertIsNotNone(db.pool)
        
        # Test get_connection failure
        mock_pool.return_value.get_connection.side_effect = Exception("Connection failed")
        with self.assertRaises(Exception):
            db.get_connection()

    def test_analyzer(self):
        # Mocking NLTK analyzer to avoid downloading lexicon in test env if not present
        with patch('app.nlp.analyzer.NLTKSentimentIntensityAnalyzer') as mock_vader:
            mock_vader.return_value.polarity_scores.return_value = {'compound': 0.9}
            analyzer = SentimentAnalyzer()
            result = analyzer.analyze_sentiment("Great!")
            self.assertEqual(result['label'], 'positive')
            self.assertEqual(result['score'], 0.9)
            
            # Test negative sentiment
            mock_vader.return_value.polarity_scores.return_value = {'compound': -0.9}
            result = analyzer.analyze_sentiment("Terrible!")
            self.assertEqual(result['label'], 'negative')
            
            # Test neutral sentiment
            mock_vader.return_value.polarity_scores.return_value = {'compound': 0.0}
            result = analyzer.analyze_sentiment("Okay.")
            self.assertEqual(result['label'], 'neutral')

    @patch('app.data_collection.collector.praw.Reddit')
    def test_collector(self, mock_reddit):
        mock_db = MagicMock(spec=DatabaseManager)
        mock_analyzer = MagicMock(spec=SentimentAnalyzer)
        
        collector = RedditCollector(mock_db, mock_analyzer)
        self.assertIsNotNone(collector.reddit)

if __name__ == '__main__':
    unittest.main()
