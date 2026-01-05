import axios from 'axios';

// Create an 'instance' of axios with the base URL of our Flask API
const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api', // This matches our Flask app
  headers: {
    'Content-Type': 'application/json',
  },
});

export default {
  // --- Data Getter Endpoints ---
  getData: (subreddit = null, timeframe = null, keywords = null, subreddits = null) => {
    let url = '/data';
    const params = new URLSearchParams();
    if (subreddit) params.append('subreddit', subreddit);
    if (timeframe) params.append('timeframe', timeframe);
    if (keywords) params.append('keywords', keywords);
    if (subreddits && subreddits.length > 0) params.append('subreddits', subreddits.join(','));

    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
    return apiClient.get(url);
  },

  getSubreddits: () => {
    return apiClient.get('/subreddits');
  },

  getGroups: () => {
    return apiClient.get('/groups');
  },

  getStats: (subreddit = null, timeframe = null, keywords = null, subreddits = null) => {
    let url = '/stats';
    const params = new URLSearchParams();
    if (subreddit) params.append('subreddit', subreddit);
    if (timeframe) params.append('timeframe', timeframe);
    if (keywords) params.append('keywords', keywords);
    if (subreddits && subreddits.length > 0) params.append('subreddits', subreddits.join(','));

    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
    return apiClient.get(url);
  },

  // --- Data Fetcher Endpoints ---
  fetchSubreddit: (subredditName) => {
    return apiClient.post('/fetch/subreddit', { subreddit: subredditName });
  },

  fetchRandom: () => {
    return apiClient.post('/fetch/random');
  },
};