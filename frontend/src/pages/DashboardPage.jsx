import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../api';

import SentimentPieChart from '../components/SentimentPieChart';
import SentimentTimeSeries from '../components/SentimentTimeSeries';
import SubredditBarChart from '../components/SubredditBarChart';
import SentimentScatterPlot from '../components/SentimentScatterPlot';
import SubredditRadarChart from '../components/SubredditRadarChart';
import CollapsibleCard from '../components/CollapsibleCard';
import { motion } from 'framer-motion';

import StatsBar from '../components/StatsBar';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import ScrollToTopButton from '../components/ScrollToTopButton';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../i18n/translations';

import './DashboardPage.css';

const containerVariant = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

function DashboardPage() {
  const { language } = useLanguage();
  const t = useTranslation(language);

  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableSubreddits, setAvailableSubreddits] = useState([]);
  const [availableGroups, setAvailableGroups] = useState({});

  const [selectedSubreddit, setSelectedSubreddit] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [keywords, setKeywords] = useState('');
  const [minScore, setMinScore] = useState('');
  const [isTopChartsCollapsed, setIsTopChartsCollapsed] = useState(false);
  const [error, setError] = useState(null);

  // Debounce keywords to avoid too many API calls
  const [debouncedKeywords, setDebouncedKeywords] = useState(keywords);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeywords(keywords);
    }, 500);
    return () => clearTimeout(timer);
  }, [keywords]);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Determine subreddits list based on group selection
    let subredditsToFetch = null;
    if (selectedGroup && availableGroups[selectedGroup]) {
      subredditsToFetch = availableGroups[selectedGroup];
    }

    Promise.all([
      apiClient.getData(selectedSubreddit, null, debouncedKeywords, subredditsToFetch),
      apiClient.getSubreddits(),
      apiClient.getGroups()
    ])
      .then(([dataResponse, subsResponse, groupsResponse]) => {
        setAllData(dataResponse.data);
        setAvailableSubreddits(subsResponse.data);
        setAvailableGroups(groupsResponse.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
        setError(error.message);
        setLoading(false);
      });
  }, [selectedSubreddit, selectedGroup, debouncedKeywords]); // Re-fetch when filters change

  const dataForPlots = useMemo(() => {
    let data = allData;
    if (minScore) {
      data = data.filter(item => item.score >= parseInt(minScore));
    }
    return data;
  }, [allData, minScore]);

  const clearAllFilters = () => {
    setSelectedSubreddit('');
    setSelectedGroup('');
    setKeywords('');
    setMinScore('');
  };

  if (loading) return <LoadingSpinner />;

  if (error) return <ErrorState message={error} />;

  return (
    <motion.div
      className="dashboard-page"
      variants={containerVariant}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 variants={cardVariant}>{t('dashboard')}</motion.h1>

      {/* --- ADD STATS BAR --- */}
      <StatsBar />

      {/* --- Filter Bar --- */}
      <motion.div className="card filter-bar glass-panel" variants={cardVariant}>
        <div className="filter-group">
          <label htmlFor="subreddit-select">{t('filterBySubreddit')}:</label>
          <select
            id="subreddit-select"
            value={selectedSubreddit}
            onChange={(e) => {
              setSelectedSubreddit(e.target.value);
            }}
          >
            <option value="">{t('allSubreddits') || "All Subreddits"}</option>
            {availableSubreddits.map(sub => (
              <option key={sub} value={sub}>r/{sub}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="group-select">{t('filterByGroup') || "Filter by Group"}:</label>
          <select
            id="group-select"
            value={selectedGroup}
            onChange={(e) => {
              setSelectedGroup(e.target.value);
              setSelectedSubreddit(''); // Clear specific subreddit if group is chosen
            }}
          >
            <option value="">{t('allGroups') || "All Groups"}</option>
            {Object.keys(availableGroups).map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="keyword-input">{t('searchKeywords') || "Keywords"}:</label>
          <input
            id="keyword-input"
            type="text"
            placeholder="e.g. crypto, biden"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            className="keyword-input"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="min-score-input">Min Score:</label>
          <input
            id="min-score-input"
            type="number"
            placeholder="0"
            value={minScore}
            onChange={(e) => setMinScore(e.target.value)}
            className="score-input"
          />
        </div>

        {(selectedSubreddit || selectedGroup || keywords || minScore) && (
          <button onClick={clearAllFilters} className="clear-filter-btn">
            {t('clearFilter')}
          </button>
        )}
      </motion.div>

      {/* --- Plot Grid --- */}
      <div className="dashboard-grid">
        {/* Row 1: Pie & Time Series (Shared Width) */}
        <CollapsibleCard
          title="Overall Sentiment"
          className="chart-card"
          isOpen={!isTopChartsCollapsed}
          onToggle={() => setIsTopChartsCollapsed(!isTopChartsCollapsed)}
        >
          <SentimentPieChart data={dataForPlots} />
        </CollapsibleCard>

        <CollapsibleCard
          title="Sentiment Trends"
          className="chart-card"
          isOpen={!isTopChartsCollapsed}
          onToggle={() => setIsTopChartsCollapsed(!isTopChartsCollapsed)}
        >
          <SentimentTimeSeries data={dataForPlots} />
        </CollapsibleCard>

        {/* Row 2: Scatter & Radar (Now Sharing Row) */}
        <CollapsibleCard title="Sentiment vs Score" className="chart-card">
          <SentimentScatterPlot data={dataForPlots} />
        </CollapsibleCard>

        <CollapsibleCard title="Subreddit Comparison" className="chart-card">
          <SubredditRadarChart data={dataForPlots} />
        </CollapsibleCard>

        {/* Row 3: Legacy Bar Chart */}
        <CollapsibleCard title="Sentiment by Subreddit" className="chart-card span-full">
          <SubredditBarChart data={dataForPlots} />
        </CollapsibleCard>
      </div>



      <ScrollToTopButton />
    </motion.div>
  );
}

export default DashboardPage;