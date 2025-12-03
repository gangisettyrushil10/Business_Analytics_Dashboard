import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

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
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('error boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });
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
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="mx-auto my-8 flex min-h-[320px] max-w-3xl flex-col items-center justify-center rounded-xl border bg-card p-10 text-center shadow-sm">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">Something went wrong</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We hit an unexpected error, but your data remains safe. Please try again.
          </p>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-6 w-full rounded-xl border bg-muted/40 p-4 text-left text-sm">
              <summary className="cursor-pointer font-semibold text-card-foreground">
                Error details (dev only)
              </summary>
              <pre className="mt-3 overflow-auto rounded-lg bg-card p-3 text-xs text-muted-foreground">
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}

          <button
            onClick={this.handleReset}
            className="mt-6 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
