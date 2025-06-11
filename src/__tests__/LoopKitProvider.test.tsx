/**
 * Tests for LoopKitProvider
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { LoopKitProvider, useLoopKitContext } from '../context';
import mockLoopKit, {
  resetMocks,
  mockInitFailure,
  mockInitSuccess,
} from '../__mocks__/@loopkit/javascript';

// Mock the @loopkit/javascript module
jest.mock('@loopkit/javascript');

// Test component to access context
const TestComponent: React.FC = () => {
  const { isInitialized, isLoading, error, config } = useLoopKitContext();

  return (
    <div>
      <div data-testid="loading">{isLoading ? 'loading' : 'not-loading'}</div>
      <div data-testid="initialized">
        {isInitialized ? 'initialized' : 'not-initialized'}
      </div>
      <div data-testid="error">{error ? error.message : 'no-error'}</div>
      <div data-testid="config">{config ? 'has-config' : 'no-config'}</div>
    </div>
  );
};

describe('LoopKitProvider', () => {
  beforeEach(() => {
    resetMocks();
    mockInitSuccess();
  });

  it('should render children', () => {
    render(
      <LoopKitProvider apiKey="test-api-key">
        <div data-testid="child">Child Component</div>
      </LoopKitProvider>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('should initialize LoopKit with the provided API key', async () => {
    render(
      <LoopKitProvider apiKey="test-api-key">
        <TestComponent />
      </LoopKitProvider>
    );

    await waitFor(() => {
      expect(mockLoopKit.init).toHaveBeenCalledWith('test-api-key', {});
    });
  });

  it('should initialize LoopKit with config options', async () => {
    const config = {
      debug: true,
      batchSize: 50,
      enableAutoCapture: false,
    };

    render(
      <LoopKitProvider apiKey="test-api-key" config={config}>
        <TestComponent />
      </LoopKitProvider>
    );

    await waitFor(() => {
      expect(mockLoopKit.init).toHaveBeenCalledWith('test-api-key', config);
    });
  });

  it('should show loading state initially', async () => {
    // Store original mock implementation
    const originalMock = mockLoopKit.init;

    // Make init truly async to capture loading state
    (mockLoopKit.init as jest.Mock).mockImplementation(() => {
      return Promise.resolve(mockLoopKit);
    });

    render(
      <LoopKitProvider apiKey="test-api-key">
        <TestComponent />
      </LoopKitProvider>
    );

    // Check initial loading state (should be synchronous)
    expect(screen.getByTestId('loading')).toHaveTextContent('loading');
    expect(screen.getByTestId('initialized')).toHaveTextContent(
      'not-initialized'
    );

    // Wait for initialization to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      expect(screen.getByTestId('initialized')).toHaveTextContent(
        'initialized'
      );
    });

    // Restore original mock
    mockLoopKit.init = originalMock;
  });

  it('should transition to initialized state after successful init', async () => {
    render(
      <LoopKitProvider apiKey="test-api-key">
        <TestComponent />
      </LoopKitProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      expect(screen.getByTestId('initialized')).toHaveTextContent(
        'initialized'
      );
      expect(screen.getByTestId('error')).toHaveTextContent('no-error');
      expect(screen.getByTestId('config')).toHaveTextContent('has-config');
    });
  });

  it('should handle initialization errors', async () => {
    const initError = new Error('Failed to initialize');
    mockInitFailure(initError);

    render(
      <LoopKitProvider apiKey="test-api-key">
        <TestComponent />
      </LoopKitProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      expect(screen.getByTestId('initialized')).toHaveTextContent(
        'not-initialized'
      );
      expect(screen.getByTestId('error')).toHaveTextContent(
        'Failed to initialize LoopKit'
      );
    });
  });

  it('should call onInitialized callback on successful init', async () => {
    const onInitialized = jest.fn();

    render(
      <LoopKitProvider apiKey="test-api-key" onInitialized={onInitialized}>
        <TestComponent />
      </LoopKitProvider>
    );

    await waitFor(() => {
      expect(onInitialized).toHaveBeenCalled();
    });
  });

  it('should call onError callback on init failure', async () => {
    const onError = jest.fn();
    const initError = new Error('Init failed');
    mockInitFailure(initError);

    render(
      <LoopKitProvider apiKey="test-api-key" onError={onError}>
        <TestComponent />
      </LoopKitProvider>
    );

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Failed to initialize LoopKit',
        })
      );
    });
  });

  it('should re-initialize when apiKey changes', async () => {
    const { rerender } = render(
      <LoopKitProvider apiKey="test-api-key-1">
        <TestComponent />
      </LoopKitProvider>
    );

    await waitFor(() => {
      expect(mockLoopKit.init).toHaveBeenCalledWith('test-api-key-1', {});
    });

    rerender(
      <LoopKitProvider apiKey="test-api-key-2">
        <TestComponent />
      </LoopKitProvider>
    );

    await waitFor(() => {
      expect(mockLoopKit.init).toHaveBeenCalledWith('test-api-key-2', {});
    });

    expect(mockLoopKit.init).toHaveBeenCalledTimes(2);
  });

  it('should re-initialize when config changes', async () => {
    const { rerender } = render(
      <LoopKitProvider apiKey="test-api-key" config={{ debug: false }}>
        <TestComponent />
      </LoopKitProvider>
    );

    await waitFor(() => {
      expect(mockLoopKit.init).toHaveBeenCalledWith('test-api-key', {
        debug: false,
      });
    });

    rerender(
      <LoopKitProvider apiKey="test-api-key" config={{ debug: true }}>
        <TestComponent />
      </LoopKitProvider>
    );

    await waitFor(() => {
      expect(mockLoopKit.init).toHaveBeenCalledWith('test-api-key', {
        debug: true,
      });
    });

    expect(mockLoopKit.init).toHaveBeenCalledTimes(2);
  });
});

describe('useLoopKitContext', () => {
  beforeEach(() => {
    resetMocks();
    mockInitSuccess();
  });

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useLoopKitContext must be used within a LoopKitProvider');

    consoleSpy.mockRestore();
  });

  it('should return context value when used within provider', async () => {
    render(
      <LoopKitProvider apiKey="test-api-key">
        <TestComponent />
      </LoopKitProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('initialized')).toHaveTextContent(
        'initialized'
      );
    });
  });
});
