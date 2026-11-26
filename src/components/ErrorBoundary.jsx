import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#F9F8FD',
            fontFamily: 'Inter, sans-serif',
            padding: 24,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              maxWidth: 520,
              background: '#FFFFFF',
              borderRadius: 24,
              padding: '36px 32px',
              boxShadow: '0 12px 36px rgba(48, 36, 95, 0.08)',
              border: '1px solid rgba(48, 36, 95, 0.08)',
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: '#FEE2E2',
                color: '#EF4444',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                marginBottom: 16,
              }}
            >
              ⚠️
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1E143E', marginBottom: 8 }}>
              Something went wrong
            </h2>
            <p style={{ color: '#685D8A', fontSize: '0.92rem', marginBottom: 20 }}>
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                style={{
                  padding: '10px 20px',
                  borderRadius: 12,
                  background: '#6C47FF',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Reset &amp; Reload
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                style={{
                  padding: '10px 20px',
                  borderRadius: 12,
                  background: '#F3F0FA',
                  color: '#30245F',
                  border: '1px solid rgba(48, 36, 95, 0.1)',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
