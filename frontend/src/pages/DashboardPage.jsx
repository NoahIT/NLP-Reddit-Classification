import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../api';
import PostTable from '../components/PostTable';
import SentimentPieChart from '../components/SentimentPieChart';
import SentimentTimeSeries from '../components/SentimentTimeSeries';
import SubredditBarChart from '../components/SubredditBarChart';
import { motion } from 'framer-motion';

// --- NEW IMPORTS ---
import StatsBar from '../components/StatsBar';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

import './DashboardPage.css';

// Animation variants
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
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableSubreddits, setAvailableSubreddits] = useState([]);
  const [selectedSubreddit, setSelectedSubreddit] = useState('');
  const [plotFilter, setPlotFilter] = useState(null);
  
  // --- NEW STATE ---
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null); // Clear previous errors
    
    Promise.all([
      apiClient.getData(),
      apiClient.getSubreddits()
    ])
    .then(([dataResponse, subsResponse]) => {
      setAllData(dataResponse.data);
      setAvailableSubreddits(subsResponse.data);
      setLoading(false);
    })
    .catch(error => {
      // --- SET ERROR ---
      console.error("Error fetching data:", error);
      setError(error.message);
      setLoading(false);
    });
  }, []);

  // ... (useMemo and handler functions remain exactly the same) ...
  const dataForPlots = useMemo(() => {
    if (!selectedSubreddit) return allData;
    return allData.filter(item => item.subreddit === selectedSubreddit);
  }, [allData, selectedSubreddit]);

  const dataForTable = useMemo(() => {
    let data = dataForPlots; 
    if (plotFilter) {
      if (plotFilter.type === 'pie') {
        data = data.filter(item => item.sentiment_label === plotFilter.label);
      }
      if (plotFilter.type === 'time') {
        data = data.filter(item => 
          new Date(item.created_utc).toISOString().startsWith(plotFilter.label)
        );
      }
    }
    return data;
  }, [dataForPlots, plotFilter]);

  const handlePieClick = (event) => {
    const clickedLabel = event.points[0].label.toLowerCase(); 
    if (plotFilter && plotFilter.type === 'pie' && plotFilter.label === clickedLabel) {
      setPlotFilter(null);
    } else {
      setPlotFilter({ type: 'pie', label: clickedLabel });
    }
  };
  
  const handleTimeClick = (event) => {
    const clickedHour = event.points[0].x.substring(0, 13); 
    if (plotFilter && plotFilter.type === 'time' && plotFilter.label === clickedHour) {
      setPlotFilter(null);
    } else {
      setPlotFilter({ type: 'time', label: clickedHour });
    }
  };

  const clearAllFilters = () => {
    setPlotFilter(null);
    setSelectedSubreddit('');
  };
  
  // --- NEW RENDER LOGIC ---
  if (loading) return <LoadingSpinner />;
  
  if (error) return <ErrorState message={error} />;
  
  // Note: We show the StatsBar even if the main data is empty
  // But we show the EmptyState for the charts/table
  return (
    <motion.div 
      className="dashboard-page"
      variants={containerVariant}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 variants={cardVariant}>Main Dashboard</motion.h1>
      
      {/* --- ADD STATS BAR --- */}
      <StatsBar />

      {/* --- Filter Bar --- */}
      <motion.div className="card filter-bar" variants={cardVariant}>
        <label htmlFor="subreddit-select">Filter by Subreddit:</label>
        <select 
          id="subreddit-select"
          value={selectedSubreddit}
          onChange={(e) => {
            setSelectedSubreddit(e.target.value);
            setPlotFilter(null); 
          }}
        >
          <option value="">All Subreddits</option>
          {availableSubreddits.map(sub => (
            <option key={sub} value={sub}>r/{sub}</option>
          ))}
        </select>
        
        {(selectedSubreddit || plotFilter) && (
          <button onClick={clearAllFilters} className="clear-filter-btn">
            Clear Filters
          </button>
        )}
      </motion.div>
      
      {/* --- CHECK FOR EMPTY DATA --- */}
      {allData.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* --- Plot Grid --- */}
          <div className="plot-grid">
            <motion.div className="card" variants={cardVariant}>
              <SentimentPieChart data={dataForPlots} onPlotClick={handlePieClick} />
            </motion.div>
            <motion.div className="card" variants={cardVariant}>
              <SentimentTimeSeries data={dataForPlots} onPlotClick={handleTimeClick} />
            </motion.div>
            <div className="span-two">
              <SubredditBarChart data={dataForPlots} /> 
            </div>
          </div>

          {/* --- Data Table Section (Drill-Down) --- */}
          <motion.div className="card" variants={cardVariant}>
            <h2>
              Data Explorer 
              {plotFilter && ` (Filtered by click: ${plotFilter.label})`}
            </h2>
            <p>
              {`Showing ${dataForTable.length} items. `}
              {plotFilter ? <strong>Click the plot again to clear selection.</strong> : 'Click a plot segment to filter.'}
            </p>
            <PostTable rowData={dataForTable} />
          </motion.div>
        </>
      )}
    </motion.div>
  );
}

export default DashboardPage;