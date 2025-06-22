/**
 * Tests for useLoopKit hook
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoopKitProvider } from '../context';
import { useLoopKit } from '../hooks';
import mockLoopKit, {
  resetMocks,
  mockInitSuccess,
} from '../__mocks__/@loopkit/javascript';

// Mock the @loopkit/javascript module
jest.mock('@loopkit/javascript');

// Test component that uses the useLoopKit hook
const TestComponent: React.FC = () => {
  const {
    isInitialized,
    isLoading,
    error,
    track,
    identify,
    group,
    flush,
    getQueueSize,
    trackPageView,
    trackClick,
    trackFormSubmit,
    setUserId,
    setUserProperties,
    setGroup,
  } = useLoopKit({ userId: 'test-user' });

  const handleTrack = () => track('test_event', { test: true });
  const handleIdentify = () =>
    identify('user123', { email: 'test@example.com' });
  const handleGroup = () => group('group123', { name: 'Test Group' });
  const handleFlush = async () => {
    try {
      await flush();
    } catch (err) {
      // Errors are expected in some tests
    }
  };

  const handleTrackPageView = () =>
    trackPageView('test-page', { custom: 'test' });

  const handleTrackClick = () =>
    trackClick('test-button', { location: 'header' });

  const handleTrackFormSubmit = () =>
    trackFormSubmit('test-form', { fields: ['name'] });

  const handleSetUserId = () => setUserId('user456');
  const handleSetUserProperties = async () => {
    try {
      await setUserProperties({ email: 'new@example.com' });
    } catch (err) {
      // Error is expected in some tests
    }
  };
  const handleSetGroup = () => setGroup('group456');

  return (
    <div>
      <div data-testid="initialized">
        {isInitialized ? 'initialized' : 'not-initialized'}
      </div>
      <div data-testid="loading">{isLoading ? 'loading' : 'not-loading'}</div>
      <div data-testid="error">{error ? error.message : 'no-error'}</div>
      <div data-testid="queue-size">{getQueueSize()}</div>

      <button data-testid="track-button" onClick={handleTrack}>
        Track
      </button>
      <button data-testid="identify-button" onClick={handleIdentify}>
        Identify
      </button>
      <button data-testid="group-button" onClick={handleGroup}>
        Group
      </button>
      <button data-testid="flush-button" onClick={handleFlush}>
        Flush
      </button>

      <button
        data-testid="track-page-view-button"
        onClick={handleTrackPageView}
      >
        Track Page View
      </button>
      <button data-testid="track-click-button" onClick={handleTrackClick}>
        Track Click
      </button>
      <button
        data-testid="track-form-submit-button"
        onClick={handleTrackFormSubmit}
      >
        Track Form Submit
      </button>

      <button data-testid="set-user-id-button" onClick={handleSetUserId}>
        Set User ID
      </button>
      <button
        data-testid="set-user-properties-button"
        onClick={handleSetUserProperties}
      >
        Set User Properties
      </button>
      <button data-testid="set-group-button" onClick={handleSetGroup}>
        Set Group
      </button>
    </div>
  );
};

// Test component for uninitialized state
const UninitializedTestComponent: React.FC = () => {
  const { track } = useLoopKit();

  const handleTrack = async () => {
    try {
      await track('test_event');
    } catch (err) {
      // Error is expected
    }
  };

  return (
    <button data-testid="track-button" onClick={handleTrack}>
      Track
    </button>
  );
};

// Test component without userId for error testing
const NoUserIdTestComponent: React.FC = () => {
  const { setUserProperties } = useLoopKit();

  const handleSetUserProperties = async () => {
    try {
      await setUserProperties({ email: 'test@example.com' });
    } catch (err) {
      // Error is expected
    }
  };

  return (
    <button
      data-testid="set-user-properties-button"
      onClick={handleSetUserProperties}
    >
      Set User Properties
    </button>
  );
};

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <LoopKitProvider apiKey="test-api-key">{children}</LoopKitProvider>
);

describe('useLoopKit', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    resetMocks();
    mockInitSuccess();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization and state', () => {
    it('should return correct initial state', async () => {
      render(<TestComponent />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByTestId('initialized')).toHaveTextContent(
          'initialized'
        );
      });

      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      expect(screen.getByTestId('error')).toHaveTextContent('no-error');
    });

    it('should auto-identify user when autoIdentify is true', async () => {
      const AutoIdentifyComponent: React.FC = () => {
        useLoopKit({ userId: 'auto-user', autoIdentify: true });
        return <div data-testid="auto-identify">Auto Identify</div>;
      };

      render(<AutoIdentifyComponent />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(mockLoopKit.identify).toHaveBeenCalledWith(
          'auto-user',
          undefined
        );
      });
    });

    it('should not auto-identify when autoIdentify is false', async () => {
      const NoAutoIdentifyComponent: React.FC = () => {
        useLoopKit({ userId: 'no-auto-user', autoIdentify: false });
        return <div data-testid="no-auto-identify">No Auto Identify</div>;
      };

      render(<NoAutoIdentifyComponent />, { wrapper: Wrapper });

      // Wait a bit and ensure identify was not called
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(mockLoopKit.identify).not.toHaveBeenCalled();
    });
  });

  describe('core tracking methods', () => {
    it('should call track with correct parameters', async () => {
      render(<TestComponent />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByTestId('initialized')).toHaveTextContent(
          'initialized'
        );
      });

      await user.click(screen.getByTestId('track-button'));

      expect(mockLoopKit.track).toHaveBeenCalledWith(
        'test_event',
        {
          test: true,
        },
        undefined
      );
    });

    it('should call identify with correct parameters', async () => {
      render(<TestComponent />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByTestId('initialized')).toHaveTextContent(
          'initialized'
        );
      });

      await user.click(screen.getByTestId('identify-button'));

      expect(mockLoopKit.identify).toHaveBeenCalledWith('user123', {
        email: 'test@example.com',
      });
    });

    it('should call group with correct parameters', async () => {
      render(<TestComponent />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByTestId('initialized')).toHaveTextContent(
          'initialized'
        );
      });

      await user.click(screen.getByTestId('group-button'));

      expect(mockLoopKit.group).toHaveBeenCalledWith(
        'group123',
        {
          name: 'Test Group',
        },
        undefined
      );
    });

    it('should call flush', async () => {
      render(<TestComponent />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByTestId('initialized')).toHaveTextContent(
          'initialized'
        );
      });

      await user.click(screen.getByTestId('flush-button'));

      expect(mockLoopKit.flush).toHaveBeenCalled();
    });

    it('should return queue size', async () => {
      (mockLoopKit.getQueueSize as jest.Mock).mockReturnValue(5);

      render(<TestComponent />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByTestId('queue-size')).toHaveTextContent('5');
      });
    });
  });

  describe('convenience methods', () => {
    it('should track page view with React-specific properties', async () => {
      render(<TestComponent />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByTestId('initialized')).toHaveTextContent(
          'initialized'
        );
      });

      await user.click(screen.getByTestId('track-page-view-button'));

      expect(mockLoopKit.track).toHaveBeenCalledWith(
        'page_view',
        {
          page: 'test-page',
          url: 'http://localhost/',
          title: '',
          referrer: '',
          source: 'react_manual',
          custom: 'test',
        },
        undefined
      );
    });

    it('should track click with React-specific properties', async () => {
      render(<TestComponent />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByTestId('initialized')).toHaveTextContent(
          'initialized'
        );
      });

      await user.click(screen.getByTestId('track-click-button'));

      expect(mockLoopKit.track).toHaveBeenCalledWith(
        'click',
        {
          element: 'test-button',
          page: '/',
          source: 'react_manual',
          location: 'header',
        },
        undefined
      );
    });

    it('should track form submit', async () => {
      render(<TestComponent />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByTestId('initialized')).toHaveTextContent(
          'initialized'
        );
      });

      await user.click(screen.getByTestId('track-form-submit-button'));

      expect(mockLoopKit.track).toHaveBeenCalledWith(
        'form_submit',
        {
          form: 'test-form',
          page: '/',
          fields: ['name'],
        },
        undefined
      );
    });
  });

  describe('user management shortcuts', () => {
    it('should set user ID', async () => {
      render(<TestComponent />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByTestId('initialized')).toHaveTextContent(
          'initialized'
        );
      });

      await user.click(screen.getByTestId('set-user-id-button'));

      expect(mockLoopKit.identify).toHaveBeenCalledWith('user456', undefined);
    });

    it('should set user properties when userId is provided', async () => {
      render(<TestComponent />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByTestId('initialized')).toHaveTextContent(
          'initialized'
        );
      });

      await user.click(screen.getByTestId('set-user-properties-button'));

      expect(mockLoopKit.identify).toHaveBeenCalledWith('test-user', {
        email: 'new@example.com',
      });
    });

    it('should handle error when setting user properties without userId', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(<NoUserIdTestComponent />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(
          screen.getByTestId('set-user-properties-button')
        ).toBeInTheDocument();
      });

      // Click the button - the error will be handled internally by the component
      await user.click(screen.getByTestId('set-user-properties-button'));

      // Just verify that identify was not called since there's no userId
      expect(mockLoopKit.identify).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should set group', async () => {
      render(<TestComponent />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByTestId('initialized')).toHaveTextContent(
          'initialized'
        );
      });

      await user.click(screen.getByTestId('set-group-button'));

      expect(mockLoopKit.group).toHaveBeenCalledWith(
        'group456',
        undefined,
        undefined
      );
    });
  });

  describe('error handling', () => {
    it('should handle flush errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (mockLoopKit.flush as jest.Mock).mockRejectedValue(
        new Error('Flush failed')
      );

      render(<TestComponent />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByTestId('initialized')).toHaveTextContent(
          'initialized'
        );
      });

      // Click flush button - error will be handled internally
      await user.click(screen.getByTestId('flush-button'));

      expect(mockLoopKit.flush).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle tracking before initialization', async () => {
      // Mock a failed initialization to keep the component uninitialized
      (mockLoopKit.init as jest.Mock).mockRejectedValue(
        new Error('Init failed')
      );

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(<UninitializedTestComponent />, { wrapper: Wrapper });

      // Wait for failed initialization
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Click track button - error will be handled internally
      await user.click(screen.getByTestId('track-button'));

      // We expect that the internal error was handled
      expect(mockLoopKit.track).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
