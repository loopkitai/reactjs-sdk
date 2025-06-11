/**
 * LoopKit React SDK Types
 *
 * This file extends the core @loopkit/javascript types with React-specific functionality.
 */

import type { ReactNode } from 'react';

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

import type {
  LoopKitConfig,
  TrackOptions,
  BatchEventInput,
} from '@loopkit/javascript';

// React-specific types

export interface UserProperties {
  email?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  plan?: string;
  signup_date?: string;
  [key: string]: any;
}

export interface GroupProperties {
  name?: string;
  plan?: string;
  employee_count?: number;
  [key: string]: any;
}

export interface LoopKitContextValue {
  isInitialized: boolean;
  isLoading: boolean;
  error: Error | null;
  config: LoopKitConfig | null;

  // Core methods
  track: (
    eventName: string,
    properties?: Record<string, any>,
    options?: TrackOptions
  ) => Promise<void>;
  trackBatch: (events: BatchEventInput[]) => Promise<void>;
  identify: (userId: string, properties?: UserProperties) => Promise<void>;
  group: (
    groupId: string,
    properties?: GroupProperties,
    groupType?: string
  ) => Promise<void>;

  // Queue management
  flush: () => Promise<void>;
  getQueueSize: () => number;

  // Configuration
  configure: (options: Partial<LoopKitConfig>) => void;
}

export interface LoopKitProviderProps {
  apiKey: string;
  config?: Partial<LoopKitConfig>;
  children: ReactNode;
  onError?: (error: Error) => void;
  onInitialized?: () => void;
}

export interface UseLoopKitOptions {
  userId?: string;
  userProperties?: UserProperties;
  autoIdentify?: boolean;
}

export interface UseLoopKitReturn
  extends Omit<LoopKitContextValue, 'configure'> {
  // Additional convenience methods for React
  trackPageView: (
    pageName?: string,
    properties?: Record<string, any>
  ) => Promise<void>;
  trackClick: (
    elementName: string,
    properties?: Record<string, any>
  ) => Promise<void>;
  trackFormSubmit: (
    formName: string,
    properties?: Record<string, any>
  ) => Promise<void>;

  // User management shortcuts
  setUserId: (userId: string, properties?: UserProperties) => Promise<void>;
  setUserProperties: (properties: UserProperties) => Promise<void>;

  // Group management shortcuts
  setGroup: (
    groupId: string,
    properties?: GroupProperties,
    groupType?: string
  ) => Promise<void>;
}

// React-specific error types
export class LoopKitError extends Error {
  constructor(
    message: string,
    public code?: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'LoopKitError';
  }
}

export class LoopKitInitializationError extends LoopKitError {
  constructor(message: string, originalError?: Error) {
    super(message, 'INITIALIZATION_ERROR', originalError);
    this.name = 'LoopKitInitializationError';
  }
}

export class LoopKitTrackingError extends LoopKitError {
  constructor(message: string, originalError?: Error) {
    super(message, 'TRACKING_ERROR', originalError);
    this.name = 'LoopKitTrackingError';
  }
}
