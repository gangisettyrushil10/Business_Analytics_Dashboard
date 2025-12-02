import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // update state so the next render will show the fallback ui
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // log error to console (in production, you'd send this to an error tracking service)
    console.error('error boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // in production, send to error tracking service like sentry
    // if (process.env.NODE_ENV === 'production') {
    //   Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
    // }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // custom fallback ui
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // default fallback ui
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          padding: '2rem',
          background: 'var(--bg-secondary)',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          margin: '2rem',
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
            something went wrong
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', textAlign: 'center' }}>
            we encountered an unexpected error. don't worry, your data is safe.
          </p>
          
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{
              width: '100%',
              maxWidth: '600px',
              marginBottom: '1rem',
              padding: '1rem',
              background: 'var(--bg-primary)',
              borderRadius: '4px',
              border: '1px solid var(--border-color)',
            }}>
              <summary style={{ cursor: 'pointer', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                error details (dev only)
              </summary>
              <pre style={{
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
              }}>
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}

          <button
            onClick={this.handleReset}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

