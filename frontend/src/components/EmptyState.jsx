import React from 'react';
import { Link } from 'react-router-dom';
import './EmptyState.css';

function EmptyState() {
  return (
    <div className="empty-state-container card">
      <h2>No Data Found</h2>
      <p>We couldn't find any data for the selected time period.</p>
      <p>
        Try fetching new data from the{' '}
        <Link to="/tools" className="tools-link">
          Data Tools page
        </Link>
        .
      </p>
    </div>
  );
}

export default EmptyState;