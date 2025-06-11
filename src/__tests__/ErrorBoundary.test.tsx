/**
 * Tests for LoopKitErrorBoundary
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  LoopKitErrorBoundary,
  withErrorBoundary,
} from '../components/ErrorBoundary';
import mockLoopKit, { resetMocks } from '../__mocks__/@loopkit/javascript';

// Mock the @loopkit/javascript module
jest.mock('@loopkit/javascript');

// Component that throws an error
const ThrowingComponent: React.FC<{ shouldThrow?: boolean }> = ({
  shouldThrow = true,
}) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Component that doesn't throw
const SafeComponent: React.FC = () => (
  <div data-testid="safe-component">Safe content</div>
);

describe('LoopKitErrorBoundary', () => {
  beforeEach(() => {
    resetMocks();
    // Suppress console.error for error boundary tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render children when no error occurs', () => {
    render(
      <LoopKitErrorBoundary>
        <SafeComponent />
      </LoopKitErrorBoundary>
    );

    expect(screen.getByTestId('safe-component')).toBeInTheDocument();
  });

  it('should render default error UI when error occurs', () => {
    render(
      <LoopKitErrorBoundary>
        <ThrowingComponent />
      </LoopKitErrorBoundary>
    );

    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    expect(
      screen.getByText(/We're sorry, but something unexpected happened/)
    ).toBeInTheDocument();
  });

  it('should render custom fallback when provided', () => {
    const customFallback = (
      <div data-testid="custom-error">Custom error message</div>
    );

    render(
      <LoopKitErrorBoundary fallback={customFallback}>
        <ThrowingComponent />
      </LoopKitErrorBoundary>
    );

    expect(screen.getByTestId('custom-error')).toBeInTheDocument();
    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('should call custom fallback function when provided', () => {
    const fallbackFunction = jest.fn((error, _errorInfo) => (
      <div data-testid="function-error">Error: {error.message}</div>
    ));

    render(
      <LoopKitErrorBoundary fallback={fallbackFunction}>
        <ThrowingComponent />
      </LoopKitErrorBoundary>
    );

    expect(fallbackFunction).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Test error' }),
      expect.objectContaining({ componentStack: expect.any(String) })
    );
    expect(screen.getByTestId('function-error')).toBeInTheDocument();
  });

  it('should track error with LoopKit when tracking is enabled', () => {
    // Mock window.location
    delete (window as any).location;
    (window as any).location = {
      pathname: '/test-page',
      href: 'http://localhost/test-page',
    };

    render(
      <LoopKitErrorBoundary enableTracking={true}>
        <ThrowingComponent />
      </LoopKitErrorBoundary>
    );

    expect(mockLoopKit.track).toHaveBeenCalledWith('react_error_boundary', {
      error_message: 'Test error',
      error_name: 'Error',
      error_stack: expect.any(String),
      component_stack: expect.any(String),
      error_boundary: true,
      page: '/test-page',
      url: 'http://localhost/test-page',
    });
  });

  it('should not track error when tracking is disabled', () => {
    render(
      <LoopKitErrorBoundary enableTracking={false}>
        <ThrowingComponent />
      </LoopKitErrorBoundary>
    );

    expect(mockLoopKit.track).not.toHaveBeenCalled();
  });

  it('should track error by default when enableTracking is not specified', () => {
    render(
      <LoopKitErrorBoundary>
        <ThrowingComponent />
      </LoopKitErrorBoundary>
    );

    expect(mockLoopKit.track).toHaveBeenCalled();
  });

  it('should call onError callback when provided', () => {
    const onErrorSpy = jest.fn();

    render(
      <LoopKitErrorBoundary onError={onErrorSpy}>
        <ThrowingComponent />
      </LoopKitErrorBoundary>
    );

    expect(onErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Test error' }),
      expect.objectContaining({ componentStack: expect.any(String) })
    );
  });

  it('should handle tracking errors gracefully', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    (mockLoopKit.track as jest.Mock).mockImplementation(() => {
      throw new Error('Tracking failed');
    });

    render(
      <LoopKitErrorBoundary>
        <ThrowingComponent />
      </LoopKitErrorBoundary>
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to track React error:',
      expect.any(Error)
    );
  });

  it('should show error details in development mode', () => {
    render(
      <LoopKitErrorBoundary>
        <ThrowingComponent />
      </LoopKitErrorBoundary>
    );

    // Click on details to expand
    const detailsElement = screen.getByText('Error details');
    expect(detailsElement).toBeInTheDocument();
  });
});

describe('withErrorBoundary HOC', () => {
  beforeEach(() => {
    resetMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should wrap component with error boundary', () => {
    const WrappedComponent = withErrorBoundary(SafeComponent);

    render(<WrappedComponent />);

    expect(screen.getByTestId('safe-component')).toBeInTheDocument();
  });

  it('should catch errors in wrapped component', () => {
    const WrappedComponent = withErrorBoundary(ThrowingComponent);

    render(<WrappedComponent />);

    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
  });

  it('should pass error boundary props', () => {
    const customFallback = <div data-testid="hoc-error">HOC error</div>;
    const WrappedComponent = withErrorBoundary(ThrowingComponent, {
      fallback: customFallback,
      enableTracking: false,
    });

    render(<WrappedComponent />);

    expect(screen.getByTestId('hoc-error')).toBeInTheDocument();
    expect(mockLoopKit.track).not.toHaveBeenCalled();
  });

  it('should preserve component display name', () => {
    const TestComponent: React.FC = () => <div>Test</div>;
    TestComponent.displayName = 'TestComponent';

    const WrappedComponent = withErrorBoundary(TestComponent);

    expect(WrappedComponent.displayName).toBe(
      'withErrorBoundary(TestComponent)'
    );
  });

  it('should use component name if displayName is not available', () => {
    const TestComponent: React.FC = () => <div>Test</div>;

    const WrappedComponent = withErrorBoundary(TestComponent);

    expect(WrappedComponent.displayName).toBe(
      'withErrorBoundary(TestComponent)'
    );
  });
});
