import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import LoopKit from '@loopkit/javascript';
import type {
  LoopKitContextValue,
  LoopKitProviderProps,
  LoopKitConfig,
  TrackOptions,
  UserProperties,
  GroupProperties,
  BatchEvent,
} from './types';
import { LoopKitInitializationError, LoopKitTrackingError } from './types';

// Create the context with undefined default value
const LoopKitContext = createContext<LoopKitContextValue | undefined>(
  undefined
);

/**
 * LoopKit Provider Component
 *
 * Wraps your app and provides LoopKit analytics functionality to all child components.
 */
export const LoopKitProvider: React.FC<LoopKitProviderProps> = ({
  apiKey,
  config = {},
  children,
  onError,
  onInitialized,
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentConfig, setCurrentConfig] = useState<LoopKitConfig | null>(
    null
  );
  const previousPathRef = useRef<string>('');

  // Initialize LoopKit
  useEffect(() => {
    const initializeLoopKit = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Initialize with API key and config - cast config to match LoopKit expectations
        await LoopKit.init(apiKey, config as any);

        setCurrentConfig(config);
        setIsInitialized(true);
        setIsLoading(false);

        // Call success callback
        if (onInitialized) {
          onInitialized();
        }
      } catch (err) {
        const error = new LoopKitInitializationError(
          'Failed to initialize LoopKit',
          err instanceof Error ? err : new Error(String(err))
        );

        setError(error);
        setIsLoading(false);
        setIsInitialized(false);

        // Call error callback
        if (onError) {
          onError(error);
        }
      }
    };

    initializeLoopKit();
  }, [apiKey, config, onError, onInitialized]);

  // React-specific auto-tracking: Enhanced SPA navigation tracking
  useEffect(() => {
    if (!isInitialized) return;

    // Only add React-specific navigation tracking if auto-capture is enabled
    const shouldTrackNavigation = config.enableAutoCapture !== false;
    if (!shouldTrackNavigation) return;

    const trackPageView = () => {
      const currentPath = window.location.pathname;

      // Avoid duplicate tracking - only track if path actually changed
      if (currentPath !== previousPathRef.current) {
        previousPathRef.current = currentPath;

        LoopKit.track('page_view', {
          page: currentPath,
          title: document.title,
          url: window.location.href,
          referrer: document.referrer,
          source: 'react_navigation', // Distinguish from JS SDK auto-tracking
        });
      }
    };

    // Track initial page view for React apps
    trackPageView();

    // Enhanced navigation tracking for SPAs
    // This complements the JS SDK's popstate tracking
    const handleLocationChange = () => {
      // Small delay to ensure DOM has updated
      setTimeout(trackPageView, 0);
    };

    // Listen for programmatic navigation (React Router, etc.)
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (...args) {
      originalPushState.apply(window.history, args);
      handleLocationChange();
    };

    window.history.replaceState = function (...args) {
      originalReplaceState.apply(window.history, args);
      handleLocationChange();
    };

    // Cleanup
    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, [isInitialized, config.enableAutoCapture]);

  // Track event
  const track = useCallback(
    async (
      eventName: string,
      properties?: Record<string, any>,
      options?: TrackOptions
    ): Promise<void> => {
      if (!isInitialized) {
        throw new LoopKitTrackingError('LoopKit is not initialized');
      }

      try {
        await LoopKit.track(eventName, properties, options);
      } catch (err) {
        const error = new LoopKitTrackingError(
          `Failed to track event: ${eventName}`,
          err instanceof Error ? err : new Error(String(err))
        );

        if (onError) {
          onError(error);
        }
        throw error;
      }
    },
    [isInitialized, onError]
  );

  // Track batch events
  const trackBatch = useCallback(
    async (events: BatchEvent[]): Promise<void> => {
      if (!isInitialized) {
        throw new LoopKitTrackingError('LoopKit is not initialized');
      }

      try {
        await LoopKit.trackBatch(events);
      } catch (err) {
        const error = new LoopKitTrackingError(
          'Failed to track batch events',
          err instanceof Error ? err : new Error(String(err))
        );

        if (onError) {
          onError(error);
        }
        throw error;
      }
    },
    [isInitialized, onError]
  );

  // Identify user
  const identify = useCallback(
    async (userId: string, properties?: UserProperties): Promise<void> => {
      if (!isInitialized) {
        throw new LoopKitTrackingError('LoopKit is not initialized');
      }

      try {
        await LoopKit.identify(userId, properties);
      } catch (err) {
        const error = new LoopKitTrackingError(
          `Failed to identify user: ${userId}`,
          err instanceof Error ? err : new Error(String(err))
        );

        if (onError) {
          onError(error);
        }
        throw error;
      }
    },
    [isInitialized, onError]
  );

  // Group user
  const group = useCallback(
    async (
      groupId: string,
      properties?: GroupProperties,
      _groupType?: string
    ): Promise<void> => {
      if (!isInitialized) {
        throw new LoopKitTrackingError('LoopKit is not initialized');
      }

      try {
        await LoopKit.group(groupId, properties);
      } catch (err) {
        const error = new LoopKitTrackingError(
          `Failed to set group: ${groupId}`,
          err instanceof Error ? err : new Error(String(err))
        );

        if (onError) {
          onError(error);
        }
        throw error;
      }
    },
    [isInitialized, onError]
  );

  // Flush events
  const flush = useCallback(async (): Promise<void> => {
    if (!isInitialized) {
      throw new LoopKitTrackingError('LoopKit is not initialized');
    }

    try {
      await LoopKit.flush();
    } catch (err) {
      const error = new LoopKitTrackingError(
        'Failed to flush events',
        err instanceof Error ? err : new Error(String(err))
      );

      if (onError) {
        onError(error);
      }
      throw error;
    }
  }, [isInitialized, onError]);

  // Get queue size
  const getQueueSize = useCallback((): number => {
    if (!isInitialized) {
      return 0;
    }

    try {
      return LoopKit.getQueueSize();
    } catch (err) {
      if (onError) {
        onError(err instanceof Error ? err : new Error(String(err)));
      }
      return 0;
    }
  }, [isInitialized, onError]);

  // Configure LoopKit
  const configure = useCallback(
    (options: Partial<LoopKitConfig>): void => {
      if (!isInitialized) {
        throw new LoopKitTrackingError('LoopKit is not initialized');
      }

      try {
        LoopKit.configure(options as any);
        setCurrentConfig((prev) => ({ ...prev, ...options }));
      } catch (err) {
        const error = new LoopKitTrackingError(
          'Failed to configure LoopKit',
          err instanceof Error ? err : new Error(String(err))
        );

        if (onError) {
          onError(error);
        }
        throw error;
      }
    },
    [isInitialized, onError]
  );

  const contextValue: LoopKitContextValue = {
    isInitialized,
    isLoading,
    error,
    config: currentConfig,
    track,
    trackBatch,
    identify,
    group,
    flush,
    getQueueSize,
    configure,
  };

  return (
    <LoopKitContext.Provider value={contextValue}>
      {children}
    </LoopKitContext.Provider>
  );
};

/**
 * Hook to access LoopKit context
 *
 * @throws {Error} If used outside of LoopKitProvider
 */
export const useLoopKitContext = (): LoopKitContextValue => {
  const context = useContext(LoopKitContext);

  if (context === undefined) {
    throw new Error('useLoopKitContext must be used within a LoopKitProvider');
  }

  return context;
};
