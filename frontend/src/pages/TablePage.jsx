import React, { useState, useEffect } from 'react';
import apiClient from '../api';
import PostTable from '../components/PostTable';

// --- NEW IMPORTS ---
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';


function TablePage() {
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- NEW STATE ---
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    apiClient.getData()
      .then(response => {
        setRowData(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  // --- NEW RENDER LOGIC ---
  if (loading) return <LoadingSpinner />;
  
  if (error) return <ErrorState message={error} />;

  if (rowData.length === 0) {
    return (
      <div>
        <h1>Full Data Table</h1>
        <EmptyState />
      </div>
    );
  }

  return (
    <div>
      <h1>Full Data Table</h1>
      <p>Showing all {rowData.length} items from the last 7 days.</p>
      <div className="card">
        <PostTable rowData={rowData} />
      </div>
    </div>
  );
}

export default TablePage;