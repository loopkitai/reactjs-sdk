import { useCallback, useEffect, useRef } from 'react';
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

/**
 * Hook for tracking component performance
 *
 * Tracks render times and component lifecycle events.
 *
 * @param componentName Name of the component being tracked
 * @param options Tracking options
 */
export const usePerformanceTracking = (
  componentName: string,
  options: {
    trackRenderTime?: boolean;
    trackMounts?: boolean;
    trackUnmounts?: boolean;
    enabled?: boolean;
  } = {}
) => {
  const { track, isInitialized } = useLoopKit();
  const {
    trackRenderTime = true,
    trackMounts = true,
    trackUnmounts = true,
    enabled = true,
  } = options;

  const renderStartTime = useRef<number>(0);
  const mountTime = useRef<number>(0);

  // Track render start time
  if (trackRenderTime && enabled && isInitialized) {
    renderStartTime.current = performance.now();
  }

  // Track component mount
  useEffect(() => {
    if (!enabled || !isInitialized) return;

    mountTime.current = performance.now();

    if (trackMounts) {
      track('component_mounted', {
        component_name: componentName,
        mount_time: mountTime.current,
      }).catch(console.error);
    }

    // Track render time after mount
    if (trackRenderTime && renderStartTime.current > 0) {
      const renderTime = mountTime.current - renderStartTime.current;
      track('component_render_time', {
        component_name: componentName,
        render_time_ms: renderTime,
        render_type: 'mount',
      }).catch(console.error);
    }

    // Cleanup function for unmount tracking
    return () => {
      if (trackUnmounts) {
        const unmountTime = performance.now();
        const componentLifetime = unmountTime - mountTime.current;

        track('component_unmounted', {
          component_name: componentName,
          unmount_time: unmountTime,
          component_lifetime_ms: componentLifetime,
        }).catch(console.error);
      }
    };
  }, [
    componentName,
    track,
    trackMounts,
    trackUnmounts,
    trackRenderTime,
    enabled,
    isInitialized,
  ]);

  // Track re-render time
  useEffect(() => {
    if (!enabled || !isInitialized || !trackRenderTime) return;
    if (mountTime.current === 0) return; // Skip first render (mount)

    const renderTime = performance.now() - renderStartTime.current;
    track('component_render_time', {
      component_name: componentName,
      render_time_ms: renderTime,
      render_type: 'update',
    }).catch(console.error);
  });
};

/**
 * Hook for tracking React Router navigation
 *
 * Specifically designed to work with React Router and track route changes.
 *
 * @param routeName Optional route name override
 * @param routeParams Route parameters to include
 */
export const useRouteTracking = (
  routeName?: string,
  routeParams: Record<string, any> = {}
) => {
  const { track, isInitialized } = useLoopKit();
  const previousRoute = useRef<string>('');

  useEffect(() => {
    if (!isInitialized) return;

    const currentRoute = routeName || window.location.pathname;

    // Only track if route actually changed
    if (currentRoute !== previousRoute.current) {
      previousRoute.current = currentRoute;

      track('route_change', {
        route: currentRoute,
        route_name: routeName,
        route_params: routeParams,
        page: window.location.pathname,
        url: window.location.href,
        source: 'react_router',
      }).catch(console.error);
    }
  }, [routeName, routeParams, track, isInitialized]);
};

/**
 * Hook for tracking feature flag usage
 *
 * Tracks when feature flags are evaluated or used.
 *
 * @param flagName Name of the feature flag
 * @param flagValue Current value of the flag
 * @param metadata Additional metadata about the flag
 */
export const useFeatureFlagTracking = (
  flagName: string,
  flagValue: boolean | string | number,
  metadata: Record<string, any> = {}
) => {
  const { track, isInitialized } = useLoopKit();

  useEffect(() => {
    if (!isInitialized) return;

    track('feature_flag_evaluated', {
      flag_name: flagName,
      flag_value: flagValue,
      flag_type: typeof flagValue,
      ...metadata,
    }).catch(console.error);
  }, [flagName, flagValue, metadata, track, isInitialized]);
};
