import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import LoopKit from '@loopkit/javascript';
import type {
  LoopKitContextValue,
  LoopKitProviderProps,
  UserProperties,
  GroupProperties,
} from './types';
import type {
  LoopKitConfig,
  TrackOptions,
  BatchEventInput,
} from '@loopkit/javascript';
import { LoopKitInitializationError, LoopKitTrackingError } from './types';

// Create the context with undefined default value
const LoopKitContext = createContext<LoopKitContextValue | undefined>(
  undefined
);

/**
 * LoopKit Provider Component
 *
 * Wraps your app and provides LoopKit analytics functionality to all child components.
 * The underlying @loopkit/javascript SDK automatically handles page views, clicks, and errors.
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

  // Use refs to store callbacks to prevent dependency changes
  const onErrorRef = useRef(onError);
  const onInitializedRef = useRef(onInitialized);

  // Update refs when callbacks change
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    onInitializedRef.current = onInitialized;
  }, [onInitialized]);

  // Stabilize config object to prevent infinite loops
  const stableConfig = useMemo(() => config, [JSON.stringify(config)]);

  // Initialize LoopKit
  useEffect(() => {
    const initializeLoopKit = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Initialize with API key and config
        // The @loopkit/javascript SDK automatically handles:
        // - Page view tracking (enableAutoCapture: true by default)
        // - Click tracking (enableAutoClickTracking: true by default)
        // - Error tracking (enableErrorTracking: true by default)
        await LoopKit.init(apiKey, stableConfig);

        setCurrentConfig(LoopKit.getConfig());
        setIsInitialized(true);
        setIsLoading(false);

        // Call success callback
        if (onInitializedRef.current) {
          onInitializedRef.current();
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
        if (onErrorRef.current) {
          onErrorRef.current(error);
        }
      }
    };

    initializeLoopKit();
  }, [apiKey, stableConfig]);

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
        LoopKit.track(eventName, properties, options);
      } catch (err) {
        const error = new LoopKitTrackingError(
          `Failed to track event: ${eventName}`,
          err instanceof Error ? err : new Error(String(err))
        );

        if (onErrorRef.current) {
          onErrorRef.current(error);
        }
        throw error;
      }
    },
    [isInitialized]
  );

  // Track batch events
  const trackBatch = useCallback(
    async (events: BatchEventInput[]): Promise<void> => {
      if (!isInitialized) {
        throw new LoopKitTrackingError('LoopKit is not initialized');
      }

      try {
        LoopKit.trackBatch(events);
      } catch (err) {
        const error = new LoopKitTrackingError(
          'Failed to track batch events',
          err instanceof Error ? err : new Error(String(err))
        );

        if (onErrorRef.current) {
          onErrorRef.current(error);
        }
        throw error;
      }
    },
    [isInitialized]
  );

  // Identify user
  const identify = useCallback(
    async (userId: string, properties?: UserProperties): Promise<void> => {
      if (!isInitialized) {
        throw new LoopKitTrackingError('LoopKit is not initialized');
      }

      try {
        LoopKit.identify(userId, properties);
      } catch (err) {
        const error = new LoopKitTrackingError(
          `Failed to identify user: ${userId}`,
          err instanceof Error ? err : new Error(String(err))
        );

        if (onErrorRef.current) {
          onErrorRef.current(error);
        }
        throw error;
      }
    },
    [isInitialized]
  );

  // Group user
  const group = useCallback(
    async (
      groupId: string,
      properties?: GroupProperties,
      groupType?: string
    ): Promise<void> => {
      if (!isInitialized) {
        throw new LoopKitTrackingError('LoopKit is not initialized');
      }

      try {
        LoopKit.group(groupId, properties, groupType);
      } catch (err) {
        const error = new LoopKitTrackingError(
          `Failed to set group: ${groupId}`,
          err instanceof Error ? err : new Error(String(err))
        );

        if (onErrorRef.current) {
          onErrorRef.current(error);
        }
        throw error;
      }
    },
    [isInitialized]
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

      if (onErrorRef.current) {
        onErrorRef.current(error);
      }
      throw error;
    }
  }, [isInitialized]);

  // Get queue size
  const getQueueSize = useCallback((): number => {
    if (!isInitialized) {
      return 0;
    }

    try {
      return LoopKit.getQueueSize();
    } catch (err) {
      if (onErrorRef.current) {
        onErrorRef.current(err instanceof Error ? err : new Error(String(err)));
      }
      return 0;
    }
  }, [isInitialized]);

  // Configure LoopKit
  const configure = useCallback(
    (options: Partial<LoopKitConfig>): void => {
      if (!isInitialized) {
        throw new LoopKitTrackingError('LoopKit is not initialized');
      }

      try {
        LoopKit.configure(options);
        setCurrentConfig(LoopKit.getConfig());
      } catch (err) {
        const error = new LoopKitTrackingError(
          'Failed to configure LoopKit',
          err instanceof Error ? err : new Error(String(err))
        );

        if (onErrorRef.current) {
          onErrorRef.current(error);
        }
        throw error;
      }
    },
    [isInitialized]
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
