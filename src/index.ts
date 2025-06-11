/**
 * LoopKit React SDK
 *
 * A React TypeScript wrapper for the @loopkit/javascript package
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

// Export all types
export type {
  LoopKitConfig,
  TrackEvent,
  TrackOptions,
  UserProperties,
  GroupProperties,
  BatchEvent,
  LoopKitContextValue,
  LoopKitProviderProps,
  UseLoopKitOptions,
  UseLoopKitReturn,
} from './types';

// Export error classes
export {
  LoopKitError,
  LoopKitInitializationError,
  LoopKitTrackingError,
} from './types';

// Re-export the underlying LoopKit SDK for advanced use cases
export { default as LoopKit } from '@loopkit/javascript';
