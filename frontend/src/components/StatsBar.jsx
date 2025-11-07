import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import apiClient from '../api';
import './StatsBar.css';

// Animation for the container
const containerVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Animation for each card
const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Helper to format sentiment
function formatSentiment(score) {
  if (score > 0.2) return <span style={{ color: 'var(--success-color)' }}>Positive ({score.toFixed(2)})</span>;
  if (score < -0.2) return <span style={{ color: 'var(--danger-color)' }}>Negative ({score.toFixed(2)})</span>;
  return <span>Neutral ({score.toFixed(2)})</span>;
}

function StatsBar() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.getStats()
      .then(response => {
        setStats(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching stats:", err);
        setLoading(false);
      });
  }, []);

  if (loading || !stats) {
    return (
      <div className="stats-bar-loading">
        <p>Loading stats...</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="stats-bar-grid"
      variants={containerVariant}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="card stat-card" variants={cardVariant}>
        <h3>Total Posts (24h)</h3>
        <p className="stat-value">{stats.total_posts_24h}</p>
      </motion.div>
      <motion.div className="card stat-card" variants={cardVariant}>
        <h3>Avg. Sentiment (24h)</h3>
        <p className="stat-value">{formatSentiment(stats.avg_sentiment_24h)}</p>
      </motion.div>
      <motion.div className="card stat-card" variants={cardVariant}>
        <h3>Most Positive (24h)</h3>
        <p className="stat-value" style={{ color: 'var(--success-color)' }}>
          r/{stats.most_positive_sub.subreddit}
        </p>
      </motion.div>
      <motion.div className="card stat-card" variants={cardVariant}>
        <h3>Most Negative (24h)</h3>
        <p className="stat-value" style={{ color: 'var(--danger-color)' }}>
          r/{stats.most_negative_sub.subreddit}
        </p>
      </motion.div>
    </motion.div>
  );
}

export default StatsBar;