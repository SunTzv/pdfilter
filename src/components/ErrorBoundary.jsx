import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
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
          <div className="brutal-card" style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>
            <AlertTriangle size={64} style={{ color: 'var(--highlight-color)', marginBottom: '24px' }} />
            <h1 style={{ fontSize: '2.5rem', textTransform: 'uppercase', marginBottom: '16px', color: 'var(--primary-color)' }}>
              System Failure
            </h1>
            <p style={{ fontSize: '1.1rem', marginBottom: '32px', opacity: 0.9 }}>
              Something went catastrophically wrong. The brutalist architecture couldn't handle it.
            </p>
            <div style={{ background: '#000', padding: '16px', border: 'var(--brutal-border)', textAlign: 'left', overflowX: 'auto', marginBottom: '32px' }}>
              <code style={{ color: '#FCE5E3', fontSize: '0.9rem' }}>
                {this.state.error?.toString()}
              </code>
            </div>
            <button 
              className="brutal-btn primary"
              onClick={() => window.location.reload()}
            >
              <RefreshCw size={18} /> Reboot System
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
