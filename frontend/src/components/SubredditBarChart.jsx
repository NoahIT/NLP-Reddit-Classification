import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';
import { motion } from 'framer-motion';

// Simple animation variant for Framer Motion
const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

function SubredditBarChart({ data }) {
  // Calculate top 10 subreddits by post count
  const { topSubreddits, topCounts } = useMemo(() => {
    const counts = {};
    data.forEach(item => {
      counts[item.subreddit] = (counts[item.subreddit] || 0) + 1;
    });

    const sortedSubreddits = Object.entries(counts)
      .sort(([, a], [, b]) => b - a) // Sort descending
      .slice(0, 10); // Get top 10

    return {
      topSubreddits: sortedSubreddits.map(item => `r/${item[0]}`).reverse(), // Reverse for horizontal bar
      topCounts: sortedSubreddits.map(item => item[1]).reverse(),
    };
  }, [data]);

  return (
    <motion.div className="card" variants={cardVariant}>
      <Plot
        data={[
          {
            y: topSubreddits,
            x: topCounts,
            type: 'bar',
            orientation: 'h', // Horizontal bar chart
            marker: {
              color: '#0d6efd',
              line: {
                color: '#0b5ed7',
                width: 1
              }
            },
          },
        ]}
        layout={{
          title: 'Top Subreddits by Post Count',
          height: 400,
          margin: { l: 150, r: 20, b: 50, t: 40 }, // Add left margin for labels
          xaxis: { title: 'Post Count' },
        }}
        style={{ width: '100%', height: '400px' }}
      />
    </motion.div>
  );
}

export default SubredditBarChart;