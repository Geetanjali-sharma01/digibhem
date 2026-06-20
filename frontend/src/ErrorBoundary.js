import React from 'react';
import { Card, Btn } from './components';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      // Default error UI
      return (
        <Card danger className="" style={{ margin: '20px', padding: '30px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>⚠️</div>
            <h2 style={{ fontSize: 22, marginBottom: 8, color: 'var(--danger)' }}>
              Something went wrong
            </h2>
            <p style={{ color: 'var(--text-light)', marginBottom: 20, fontSize: 14 }}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{ 
                textAlign: 'left', 
                marginBottom: 20, 
                padding: 16, 
                background: 'rgba(0,0,0,0.2)', 
                borderRadius: 8,
                fontSize: 12,
                maxHeight: 200,
                overflow: 'auto'
              }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600, marginBottom: 8 }}>
                  Error Details (Development)
                </summary>
                <pre style={{ margin: 0, color: 'var(--color-danger)' }}>
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Btn onClick={this.handleReset} variant="primary">
                🔄 Try Again
              </Btn>
              <Btn onClick={() => window.location.reload()} variant="ghost">
                🏠 Reload Page
              </Btn>
            </div>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// Higher-order component for functional components
export function withErrorBoundary(WrappedComponent) {
  return function WithErrorBoundaryWrapper(props) {
    return (
      <ErrorBoundary>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}
