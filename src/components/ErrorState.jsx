import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorState = ({ message, onRetry }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    padding: '24px',
    backgroundColor: 'var(--bg-color)'
  }}>
    <div className="brutal-card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', borderColor: 'var(--highlight-color)', boxShadow: '8px 8px 0 var(--highlight-color)' }}>
      <AlertCircle size={48} style={{ color: 'var(--highlight-color)', marginBottom: '16px' }} />
      <h2 style={{ fontSize: '1.5rem', textTransform: 'uppercase', marginBottom: '12px' }}>
        Load Error
      </h2>
      <p style={{ fontSize: '1rem', marginBottom: '24px', opacity: 0.9 }}>
        {message || "Failed to process the requested file."}
      </p>
      {onRetry && (
        <button className="brutal-btn highlight" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  </div>
);

export default ErrorState;
