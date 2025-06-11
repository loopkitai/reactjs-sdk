/**
 * Tests for specialized hooks
 */
import React from 'react';
import { render } from '@testing-library/react';
import { LoopKitProvider } from '../context';
import { usePageView, useIdentify, useTrackEvent } from '../hooks';
import mockLoopKit, { resetMocks } from '../__mocks__/@loopkit/javascript';

// Mock the @loopkit/javascript module
jest.mock('@loopkit/javascript');

// Test wrapper component
const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <LoopKitProvider apiKey="test-api-key">{children}</LoopKitProvider>
);

describe('usePageView', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('should track page view on mount', () => {
    const TestComponent: React.FC = () => {
      usePageView('test-page', { section: 'main' });
      return <div>Test</div>;
    };

    render(<TestComponent />, { wrapper: Wrapper });

    // Wait for effect to run
    setTimeout(() => {
      expect(mockLoopKit.track).toHaveBeenCalledWith(
        'page_view',
        expect.objectContaining({
          page: 'test-page',
          section: 'main',
          source: 'react_manual',
        })
      );
    }, 100);
  });
});

describe('useIdentify', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('should identify user when userId is provided', () => {
    const TestComponent: React.FC = () => {
      useIdentify('user123', { email: 'test@example.com' });
      return <div>Test</div>;
    };

    render(<TestComponent />, { wrapper: Wrapper });

    setTimeout(() => {
      expect(mockLoopKit.identify).toHaveBeenCalledWith('user123', {
        email: 'test@example.com',
      });
    }, 100);
  });

  it('should not identify when userId is null', () => {
    const TestComponent: React.FC = () => {
      useIdentify(null, { email: 'test@example.com' });
      return <div>Test</div>;
    };

    render(<TestComponent />, { wrapper: Wrapper });

    setTimeout(() => {
      expect(mockLoopKit.identify).not.toHaveBeenCalled();
    }, 100);
  });
});

describe('useTrackEvent', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('should return a function that tracks events', async () => {
    let trackEvent: (props?: any) => void;

    const TestComponent: React.FC = () => {
      trackEvent = useTrackEvent('button_click', { page: 'home' });
      return <div data-testid="test-component">Test</div>;
    };

    render(<TestComponent />, { wrapper: Wrapper });

    // Wait for initialization to complete
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Call the returned function
    trackEvent!({ button: 'cta' });

    expect(mockLoopKit.track).toHaveBeenCalledWith(
      'button_click',
      {
        page: 'home',
        button: 'cta',
      },
      undefined
    );
  });
});
