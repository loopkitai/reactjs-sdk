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
  mockFlushFailure,
} from '../__mocks__/@loopkit/javascript';

// Mock the @loopkit/javascript module
jest.mock('@loopkit/javascript');

// Test component that uses the useLoopKit hook
const TestComponent: React.FC<{
  userId?: string;
  userProperties?: Record<string, any>;
  autoIdentify?: boolean;
}> = ({ userId, userProperties, autoIdentify }) => {
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
  } = useLoopKit({ userId, userProperties, autoIdentify });

  const handleTrack = () => track('test_event', { prop: 'value' });
  const handleIdentify = () =>
    identify('user123', { email: 'test@example.com' });
  const handleGroup = () =>
    group('group123', { name: 'Test Group' }, 'organization');
  const handleFlush = () => flush();
  const handleTrackPageView = () =>
    trackPageView('test-page', { custom: 'test' });
  const handleTrackClick = () =>
    trackClick('test-button', { location: 'header' });
  const handleTrackFormSubmit = () =>
    trackFormSubmit('test-form', { fields: ['name'] });
  const handleSetUserId = () => setUserId('newuser', { plan: 'pro' });
  const handleSetUserProperties = () =>
    setUserProperties({ plan: 'enterprise' });
  const handleSetGroup = () => setGroup('newgroup', { type: 'company' });

  return (
    <div>
      <div data-testid="loading">{isLoading ? 'loading' : 'not-loading'}</div>
      <div data-testid="initialized">
        {isInitialized ? 'initialized' : 'not-initialized'}
      </div>
      <div data-testid="error">{error ? error.message : 'no-error'}</div>
      <div data-testid="queue-size">{getQueueSize()}</div>

      <button onClick={handleTrack} data-testid="track-button">
        Track
      </button>
      <button onClick={handleIdentify} data-testid="identify-button">
        Identify
      </button>
      <button onClick={handleGroup} data-testid="group-button">
        Group
      </button>
      <button onClick={handleFlush} data-testid="flush-button">
        Flush
      </button>
      <button
        onClick={handleTrackPageView}
        data-testid="track-page-view-button"
      >
        Track Page View
      </button>
      <button onClick={handleTrackClick} data-testid="track-click-button">
        Track Click
      </button>
      <button
        onClick={handleTrackFormSubmit}
        data-testid="track-form-submit-button"
      >
        Track Form Submit
      </button>
      <button onClick={handleSetUserId} data-testid="set-user-id-button">
        Set User ID
      </button>
      <button
        onClick={handleSetUserProperties}
        data-testid="set-user-properties-button"
      >
        Set User Properties
      </button>
      <button onClick={handleSetGroup} data-testid="set-group-button">
        Set Group
      </button>
    </div>
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

  describe('initialization and state', () => {
    it('should return correct initial state', async () => {
      render(<TestComponent />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByTestId('initialized')).toHaveTextContent(
          'initialized'
        );
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
        expect(screen.getByTestId('error')).toHaveTextContent('no-error');
      });
    });

    it('should auto-identify user when autoIdentify is true', async () => {
      const userId = 'auto-user-123';
      const userProperties = { email: 'auto@example.com', plan: 'pro' };

      render(
        <TestComponent
          userId={userId}
          userProperties={userProperties}
          autoIdentify={true}
        />,
        { wrapper: Wrapper }
      );

      await waitFor(() => {
        expect(mockLoopKit.identify).toHaveBeenCalledWith(
          userId,
          userProperties
        );
      });
    });

    it('should not auto-identify when autoIdentify is false', async () => {
      const userId = 'auto-user-123';
      const userProperties = { email: 'auto@example.com' };

      render(
        <TestComponent
          userId={userId}
          userProperties={userProperties}
          autoIdentify={false}
        />,
        { wrapper: Wrapper }
      );

      await waitFor(() => {
        expect(screen.getByTestId('initialized')).toHaveTextContent(
          'initialized'
        );
      });

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
        { prop: 'value' },
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
        { name: 'Test Group' },
        'organization'
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
      // Mock window.location
      delete (window as any).location;
      (window as any).location = {
        pathname: '/test-page',
        href: 'http://localhost/test-page',
      };

      Object.defineProperty(document, 'title', {
        value: 'Test Page',
        writable: true,
        configurable: true,
      });

      Object.defineProperty(document, 'referrer', {
        value: 'http://localhost',
        writable: true,
        configurable: true,
      });

      render(<TestComponent />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByTestId('initialized')).toHaveTextContent(
          'initialized'
        );
      });

      await user.click(screen.getByTestId('track-page-view-button'));

      expect(mockLoopKit.track).toHaveBeenCalledWith('page_view', {
        page: 'test-page',
        url: 'http://localhost/test-page',
        title: 'Test Page',
        referrer: 'http://localhost',
        source: 'react_manual',
        custom: 'test',
      });
    });

    it('should track click with React-specific properties', async () => {
      delete (window as any).location;
      (window as any).location = { pathname: '/test-page' };

      render(<TestComponent />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByTestId('initialized')).toHaveTextContent(
          'initialized'
        );
      });

      await user.click(screen.getByTestId('track-click-button'));

      expect(mockLoopKit.track).toHaveBeenCalledWith('click', {
        element: 'test-button',
        page: '/test-page',
        source: 'react_manual',
        location: 'header',
      });
    });

    it('should track form submit', async () => {
      delete (window as any).location;
      (window as any).location = { pathname: '/test-page' };

      render(<TestComponent />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByTestId('initialized')).toHaveTextContent(
          'initialized'
        );
      });

      await user.click(screen.getByTestId('track-form-submit-button'));

      expect(mockLoopKit.track).toHaveBeenCalledWith('form_submit', {
        form: 'test-form',
        page: '/test-page',
        fields: ['name'],
      });
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

      expect(mockLoopKit.identify).toHaveBeenCalledWith('newuser', {
        plan: 'pro',
      });
    });

    it('should set user properties when userId is provided', async () => {
      render(<TestComponent userId="existing-user" />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByTestId('initialized')).toHaveTextContent(
          'initialized'
        );
      });

      await user.click(screen.getByTestId('set-user-properties-button'));

      expect(mockLoopKit.identify).toHaveBeenCalledWith('existing-user', {
        plan: 'enterprise',
      });
    });

    it('should throw error when setting user properties without userId', async () => {
      render(<TestComponent />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByTestId('initialized')).toHaveTextContent(
          'initialized'
        );
      });

      // This should throw an error since no userId is set
      await expect(async () => {
        await user.click(screen.getByTestId('set-user-properties-button'));
      }).rejects.toThrow('User ID must be set before setting user properties');
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
        'newgroup',
        { type: 'company' },
        undefined
      );
    });
  });

  describe('error handling', () => {
    it('should handle flush errors gracefully', async () => {
      mockFlushFailure(new Error('Flush failed'));

      render(<TestComponent />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByTestId('initialized')).toHaveTextContent(
          'initialized'
        );
      });

      // This should throw the error from flush
      await expect(async () => {
        await user.click(screen.getByTestId('flush-button'));
      }).rejects.toThrow('Failed to flush events');
    });

    it('should throw error when tracking before initialization', async () => {
      const TestComponentBeforeInit: React.FC = () => {
        const { track, isInitialized } = useLoopKit();

        const handleTrack = async () => {
          if (!isInitialized) {
            throw new Error('Cannot track before initialization');
          }
          await track('test_event');
        };

        return (
          <div>
            <div data-testid="initialized">
              {isInitialized ? 'initialized' : 'not-initialized'}
            </div>
            <button onClick={handleTrack} data-testid="track-button">
              Track
            </button>
          </div>
        );
      };

      render(<TestComponentBeforeInit />, { wrapper: Wrapper });

      // Wait for component to render but don't wait for initialization
      expect(screen.getByTestId('initialized')).toHaveTextContent(
        'not-initialized'
      );

      // This should throw an error since we're not initialized
      await expect(async () => {
        await user.click(screen.getByTestId('track-button'));
      }).rejects.toThrow('Cannot track before initialization');
    });
  });
});
