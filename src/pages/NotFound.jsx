import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      width: '100vw',
      backgroundColor: 'var(--bg-color)',
      padding: '24px'
    }}>
      <div className="brutal-card" style={{ maxWidth: '600px', width: '100%', textAlign: 'center', borderColor: 'var(--primary-color)', boxShadow: '8px 8px 0 var(--primary-color)' }}>
        <h1 style={{ fontSize: '8rem', fontWeight: 900, color: 'var(--highlight-color)', margin: 0, lineHeight: 1 }}>
          404
        </h1>
        <h2 style={{ fontSize: '2rem', textTransform: 'uppercase', marginBottom: '24px', letterSpacing: '2px', color: 'var(--text-color)' }}>
          Page Not Found
        </h2>
        <p style={{ fontSize: '1.1rem', marginBottom: '40px', opacity: 0.9, lineHeight: 1.6 }}>
          The document you are looking for has been shredded, deleted, or never existed in the first place.
        </p>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <button className="brutal-btn primary" style={{ fontSize: '1.2rem', padding: '16px 32px' }}>
            <Home size={20} /> Return to Base
          </button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
