import React, { useState } from 'react';
import apiClient from '../api';
import './DataToolsPage.css'; // We'll create this CSS file

function DataToolsPage() {
  const [subreddit, setSubreddit] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFetchSubreddit = async (e) => {
    e.preventDefault();
    if (!subreddit) return;
    
    setLoading(true);
    setMessage('');
    try {
      const response = await apiClient.fetchSubreddit(subreddit);
      setMessage(response.data.message);
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.message || error.message}`);
    }
    setLoading(false);
    setSubreddit(''); // Clear input
  };

  const handleFetchRandom = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await apiClient.fetchRandom();
      setMessage(response.data.message);
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.message || error.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="data-tools-page">
      <h1>Data Fetching Tools</h1>
      <p>Use these tools to add new data to the database on-demand.</p>

      {/* Message Area */}
      {message && (
        <div className={`message-banner ${loading ? 'loading' : ''}`}>
          {message}
        </div>
      )}

      {/* Fetch Specific Subreddit */}
      <div className="card">
        <h2>Fetch from Specific Subreddit</h2>
        <p>Get the 50 newest 'hot' posts from a subreddit.</p>
        <form onSubmit={handleFetchSubreddit} className="tool-form">
          <input
            type="text"
            value={subreddit}
            onChange={(e) => setSubreddit(e.target.value)}
            placeholder="e.g., python, news, etc."
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Fetching...' : 'Fetch'}
          </button>
        </form>
      </div>

      {/* Fetch Random */}
      <div className="card">
        <h2>Fetch from Random Subreddits</h2>
        <p>Get 10 posts each from 10 random subreddits.</p>
        <button onClick={handleFetchRandom} disabled={loading} className="random-button">
          {loading ? 'Fetching...' : 'Fetch Random'}
        </button>
      </div>
    </div>
  );
}

export default DataToolsPage;