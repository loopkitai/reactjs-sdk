import React, { Component, ErrorInfo, ReactNode } from 'react';
import * as LoopKitJavaScript from '@loopkit/javascript';

// Handle different export patterns from @loopkit/javascript
const LoopKit = (LoopKitJavaScript as any).default || LoopKitJavaScript;

interface Props {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, errorInfo: ErrorInfo) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  enableTracking?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * React Error Boundary with automatic error tracking
 *
 * This component catches React component errors and automatically tracks them
 * with LoopKit, complementing the JavaScript SDK's global error tracking.
 */
export class LoopKitErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Track the error with LoopKit if tracking is enabled
    if (this.props.enableTracking !== false) {
      try {
        LoopKit.track('react_error_boundary', {
          error_message: error.message,
          error_name: error.name,
          error_stack: error.stack,
          component_stack: errorInfo.componentStack,
          error_boundary: true,
          // Include page context
          page:
            typeof window !== 'undefined'
              ? window.location.pathname
              : undefined,
          url: typeof window !== 'undefined' ? window.location.href : undefined,
        });
      } catch (trackingError) {
        console.error('Failed to track React error:', trackingError);
      }
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // Render custom fallback UI if provided
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return this.props.fallback(this.state.error!, this.state.errorInfo!);
        }
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div
          style={{
            padding: '20px',
            margin: '20px',
            border: '1px solid #ff6b6b',
            borderRadius: '4px',
            backgroundColor: '#ffe0e0',
            color: '#d63031',
          }}
        >
          <h2>Oops! Something went wrong</h2>
          <p>
            We're sorry, but something unexpected happened. The error has been
            reported.
          </p>
          <details style={{ marginTop: '10px' }}>
            <summary>Error details</summary>
            <pre
              style={{
                fontSize: '12px',
                marginTop: '10px',
                padding: '10px',
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: '4px',
                overflow: 'auto',
              }}
            >
              {this.state.error?.toString()}
              {this.state.errorInfo?.componentStack}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WithErrorBoundaryComponent = (props: P) => (
    <LoopKitErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </LoopKitErrorBoundary>
  );

  WithErrorBoundaryComponent.displayName = `withErrorBoundary(${
    WrappedComponent.displayName || WrappedComponent.name
  })`;

  return WithErrorBoundaryComponent;
}
