import React from 'react';
import './EmptyState.css'; // We can reuse the same CSS

function ErrorState({ message }) {
  return (
    <div className="empty-state-container card" style={{ borderColor: 'var(--danger-color)' }}>
      <h2 style={{ color: 'var(--danger-color)' }}>An Error Occurred</h2>
      <p>We ran into a problem while trying to load your data.</p>
      <p>
        <strong>Error:</strong> {message || 'An unknown error occurred.'}
      </p>
    </div>
  );
}

export default ErrorState;