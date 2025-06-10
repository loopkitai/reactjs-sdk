/**
 * LoopKit React SDK Types
 */

import type { ReactNode } from 'react';

export interface LoopKitConfig {
  // API Settings
  baseURL?: string;

  // Batching
  batchSize?: number;
  flushInterval?: number;
  maxQueueSize?: number;

  // Performance
  enableCompression?: boolean;
  requestTimeout?: number;

  // Debugging
  debug?: boolean;
  logLevel?: 'error' | 'warn' | 'info' | 'debug';

  // Auto-capture (Browser only)
  enableAutoCapture?: boolean;
  enableErrorTracking?: boolean;

  // Privacy
  respectDoNotTrack?: boolean;
  enableLocalStorage?: boolean;

  // Retry Logic
  maxRetries?: number;
  retryBackoff?: 'exponential' | 'linear';

  // Callbacks
  onBeforeTrack?: (event: TrackEvent) => TrackEvent | null;
  onAfterTrack?: (event: TrackEvent, success: boolean) => void;
  onError?: (error: Error) => void;
}

export interface TrackEvent {
  name: string;
  properties?: Record<string, any>;
  options?: TrackOptions;
}

export interface TrackOptions {
  timestamp?: string | Date;
  [key: string]: any;
}

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

export interface BatchEvent {
  name: string;
  properties?: Record<string, any>;
  options?: TrackOptions;
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
  trackBatch: (events: BatchEvent[]) => Promise<void>;
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
  config?: LoopKitConfig;
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
  // Additional convenience methods
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

// Error types
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
