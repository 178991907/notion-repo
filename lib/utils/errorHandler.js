import React from 'react';

const ErrorHandler = {
  createErrorBoundary: (fallbackUI) => {
    return class ErrorBoundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, info: null };
      }

      static getDerivedStateFromError(error) {
        return { hasError: true, error };
      }

      componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({ error, info: errorInfo });
      }

      render() {
        if (this.state.hasError) {
          return (
            <div style={{ padding: '2rem', textAlign: 'left', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'red' }}>Oh no! Something went wrong</h1>
              <div style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '8px', maxWidth: '800px', width: '100%', overflow: 'auto', border: '1px solid #ddd' }}>
                <p style={{ fontWeight: 'bold' }}>{this.state.error?.toString()}</p>
                <pre style={{ fontSize: '12px', color: '#333', marginTop: '10px' }}>
                  {this.state.error?.stack}
                </pre>
                <pre style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
                  {this.state.info?.componentStack}
                </pre>
              </div>
              <button onClick={() => window.location.reload()} style={{ marginTop: '2rem', padding: '0.5rem 1.5rem', cursor: 'pointer', border: '1px solid #ccc', borderRadius: '4px', background: 'transparent' }}>Refresh</button>
            </div>
          );
        }

        return this.props.children;
      }
    };
  }
};

export default ErrorHandler;
