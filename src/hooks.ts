import { useCallback, useEffect } from 'react';
import type { DependencyList } from 'react';
import { useLoopKitContext } from './context';
import type {
  UseLoopKitOptions,
  UseLoopKitReturn,
  UserProperties,
  GroupProperties,
} from './types';

/**
 * Main hook for using LoopKit analytics
 *
 * Provides enhanced functionality with convenience methods for common tracking scenarios.
 *
 * @param options Configuration options for the hook
 * @returns Enhanced LoopKit functionality with convenience methods
 */
export const useLoopKit = (
  options: UseLoopKitOptions = {}
): UseLoopKitReturn => {
  const { userId, userProperties, autoIdentify = false } = options;

  const context = useLoopKitContext();
  const {
    isInitialized,
    isLoading,
    error,
    config,
    track,
    trackBatch,
    identify,
    group,
    flush,
    getQueueSize,
  } = context;

  // Auto-identify user when hook is used with userId
  useEffect(() => {
    if (autoIdentify && userId && isInitialized) {
      identify(userId, userProperties).catch(console.error);
    }
  }, [autoIdentify, userId, userProperties, isInitialized, identify]);

  // Track page view
  const trackPageView = useCallback(
    async (
      pageName?: string,
      properties: Record<string, any> = {}
    ): Promise<void> => {
      const pageViewProperties = {
        page: pageName || window.location.pathname,
        url: window.location.href,
        title: document.title,
        referrer: document.referrer,
        ...properties,
      };

      await track('page_view', pageViewProperties);
    },
    [track]
  );

  // Track click events
  const trackClick = useCallback(
    async (
      elementName: string,
      properties: Record<string, any> = {}
    ): Promise<void> => {
      const clickProperties = {
        element: elementName,
        page: window.location.pathname,
        ...properties,
      };

      await track('click', clickProperties);
    },
    [track]
  );

  // Track form submit events
  const trackFormSubmit = useCallback(
    async (
      formName: string,
      properties: Record<string, any> = {}
    ): Promise<void> => {
      const formProperties = {
        form: formName,
        page: window.location.pathname,
        ...properties,
      };

      await track('form_submit', formProperties);
    },
    [track]
  );

  // Set user ID with optional properties
  const setUserId = useCallback(
    async (newUserId: string, properties?: UserProperties): Promise<void> => {
      await identify(newUserId, properties);
    },
    [identify]
  );

  // Set user properties for current user
  const setUserProperties = useCallback(
    async (properties: UserProperties): Promise<void> => {
      if (!userId) {
        throw new Error('User ID must be set before setting user properties');
      }
      await identify(userId, properties);
    },
    [identify, userId]
  );

  // Set group with optional properties
  const setGroup = useCallback(
    async (
      groupId: string,
      properties?: GroupProperties,
      groupType?: string
    ): Promise<void> => {
      await group(groupId, properties, groupType);
    },
    [group]
  );

  return {
    // Core state
    isInitialized,
    isLoading,
    error,
    config,

    // Core methods
    track,
    trackBatch,
    identify,
    group,
    flush,
    getQueueSize,

    // Convenience methods
    trackPageView,
    trackClick,
    trackFormSubmit,

    // User management shortcuts
    setUserId,
    setUserProperties,

    // Group management shortcuts
    setGroup,
  };
};

/**
 * Hook for tracking page views automatically
 *
 * Automatically tracks page views when the component mounts or when dependencies change.
 *
 * @param pageName Optional page name override
 * @param properties Additional properties to send with page view
 * @param dependencies Array of dependencies that should trigger a new page view
 */
export const usePageView = (
  pageName?: string,
  properties: Record<string, any> = {},
  dependencies: DependencyList = []
): void => {
  const { trackPageView, isInitialized } = useLoopKit();

  useEffect(() => {
    if (isInitialized) {
      trackPageView(pageName, properties).catch(console.error);
    }
  }, [isInitialized, pageName, ...dependencies]); // eslint-disable-line react-hooks/exhaustive-deps
};

/**
 * Hook for auto-identifying users
 *
 * Automatically identifies the user when the hook is used with a userId.
 *
 * @param userId User ID to identify
 * @param properties User properties to set
 */
export const useIdentify = (
  userId: string | null,
  properties?: UserProperties
): void => {
  const { identify, isInitialized } = useLoopKit();

  useEffect(() => {
    if (userId && isInitialized) {
      identify(userId, properties).catch(console.error);
    }
  }, [userId, properties, isInitialized, identify]);
};

/**
 * Hook for tracking events with a simple function
 *
 * Returns a memoized tracking function that can be used in event handlers.
 *
 * @param eventName The name of the event to track
 * @param defaultProperties Default properties to include with every event
 * @returns Function to call when the event should be tracked
 */
export const useTrackEvent = (
  eventName: string,
  defaultProperties: Record<string, any> = {}
) => {
  const { track } = useLoopKit();

  return useCallback(
    (additionalProperties: Record<string, any> = {}) => {
      const properties = { ...defaultProperties, ...additionalProperties };
      track(eventName, properties).catch(console.error);
    },
    [track, eventName, defaultProperties]
  );
};
