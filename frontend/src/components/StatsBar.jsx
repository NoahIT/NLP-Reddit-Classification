import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import apiClient from '../api';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../i18n/translations';
import './StatsBar.css';

const containerVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

function formatSentiment(score, t) {
  const numericScore = Number(score);
  if (isNaN(numericScore)) {
    return <span className="sentiment-neutral">{t('neutral')} (0.00)</span>;
  }
  if (numericScore > 0.2) return <span className="sentiment-positive">{t('positive')} ({numericScore.toFixed(2)})</span>;
  if (numericScore < -0.2) return <span className="sentiment-negative">{t('negative')} ({numericScore.toFixed(2)})</span>;
  return <span className="sentiment-neutral">{t('neutral')} ({numericScore.toFixed(2)})</span>;
}

function StatsBar({ subreddit, keywords, subreddits, refreshTrigger }) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // null for timeframe implies backend default (7 days)
    apiClient.getStats(subreddit, null, keywords, subreddits)
      .then(response => {
        setStats(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching stats:", err);
        setLoading(false);
      });
  }, [subreddit, keywords, subreddits, refreshTrigger]);

  if (loading || !stats) {
    return (
      <div className="stats-bar-loading">
        <div className="spinner"></div>
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
      <motion.div className="card stat-card glass-panel" variants={cardVariant}>
        <h3>{t('totalPosts')}</h3>
        <p className="stat-value">{stats.total_posts}</p>
        <span className="stat-label">In Current View</span>
      </motion.div>
      <motion.div className="card stat-card glass-panel" variants={cardVariant}>
        <h3>{t('avgSentiment')}</h3>
        <p className="stat-value">{formatSentiment(stats.avg_sentiment, t)}</p>
        <span className="stat-label">Average Sentiment</span>
      </motion.div>
      <motion.div className="card stat-card glass-panel" variants={cardVariant}>
        <h3>{t('mostCommon')} {t('positive')}</h3>
        <p className="stat-value" style={{ color: 'var(--success-color)' }}>
          r/{stats.most_positive_sub.subreddit}
        </p>
        <span className="stat-label">Highest Sentiment</span>
      </motion.div>
      <motion.div className="card stat-card glass-panel" variants={cardVariant}>
        <h3>{t('mostCommon')} {t('negative')}</h3>
        <p className="stat-value" style={{ color: 'var(--danger-color)' }}>
          r/{stats.most_negative_sub.subreddit}
        </p>
        <span className="stat-label">Lowest Sentiment</span>
      </motion.div>
    </motion.div>
  );
}

export default StatsBar;