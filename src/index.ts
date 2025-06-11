/**
 * LoopKit React SDK
 *
 * A React TypeScript wrapper for the @loopkit/javascript package
 * Provides React-specific hooks and components while leveraging the built-in
 * auto-tracking features of the core JavaScript SDK.
 */

// Export main provider and context
export { LoopKitProvider, useLoopKitContext } from './context';

// Export Error Boundary components
export {
  LoopKitErrorBoundary,
  withErrorBoundary,
} from './components/ErrorBoundary';

// Export main hooks
export {
  useLoopKit,
  usePageView,
  useIdentify,
  useTrackEvent,
  usePerformanceTracking,
  useRouteTracking,
  useFeatureFlagTracking,
} from './hooks';

// Export React-specific types
export type {
  UserProperties,
  GroupProperties,
  LoopKitContextValue,
  LoopKitProviderProps,
  UseLoopKitOptions,
  UseLoopKitReturn,
} from './types';

// Re-export core types from @loopkit/javascript
export type {
  // Configuration
  LoopKitConfig,
  LogLevel,
  RetryBackoff,

  // Events
  TrackEvent,
  IdentifyEvent,
  GroupEvent,
  ClickEventProperties,
  BatchEventInput,
  TrackOptions,

  // Core interfaces
  ILoopKit,
  IStorageManager,
  ISessionManager,
  IQueueManager,
  INetworkManager,

  // Convenience aliases
  Config,
  Event,
  Options,
} from '@loopkit/javascript';

// Export React-specific error classes
export {
  LoopKitError,
  LoopKitInitializationError,
  LoopKitTrackingError,
} from './types';

// Re-export the underlying LoopKit SDK for advanced use cases
export { default as LoopKit } from '@loopkit/javascript';
