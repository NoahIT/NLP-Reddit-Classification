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
  getData: (subreddit = null) => {
    let url = '/data';
    if (subreddit) {
      url += `?subreddit=${subreddit}`;
    }
    return apiClient.get(url);
  },
  
  getSubreddits: () => {
    return apiClient.get('/subreddits');
  },

 getStats: () => {
    return apiClient.get('/stats');
  },

  // --- Data Fetcher Endpoints ---
  fetchSubreddit: (subredditName) => {
    return apiClient.post('/fetch/subreddit', { subreddit: subredditName });
  },

  fetchRandom: () => {
    return apiClient.post('/fetch/random');
  },
};