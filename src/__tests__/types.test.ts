/**
 * Tests for TypeScript type integration
 */
import type {
  // Core types from @loopkit/javascript
  LoopKitConfig,
  TrackEvent,
  IdentifyEvent,
  GroupEvent,
  ClickEventProperties,
  BatchEventInput,
  TrackOptions,
  ILoopKit,

  // React-specific types
  UserProperties,
  GroupProperties,
  LoopKitProviderProps,
  UseLoopKitOptions,
} from '../index';

// Import error classes as values (not types)
import {
  LoopKitError,
  LoopKitInitializationError,
  LoopKitTrackingError,
} from '../index';

describe('Type Integration', () => {
  it('should properly export core types from @loopkit/javascript', () => {
    // Test that we can use the imported types
    const config: LoopKitConfig = {
      apiKey: 'test-key',
      debug: true,
      enableAutoCapture: true,
    };

    const trackEvent: TrackEvent = {
      name: 'test_event',
      properties: { test: true },
      anonymousId: 'anon123',
      timestamp: '2024-01-01T00:00:00Z',
      system: {
        sdk: { name: 'test', version: '1.0.0' },
        sessionId: 'session123',
      },
    };

    const identifyEvent: IdentifyEvent = {
      userId: 'user123',
      properties: { email: 'test@example.com' },
      anonymousId: 'anon123',
      timestamp: '2024-01-01T00:00:00Z',
      system: {
        sdk: { name: 'test', version: '1.0.0' },
        sessionId: 'session123',
      },
    };

    const groupEvent: GroupEvent = {
      userId: 'user123',
      groupId: 'group123',
      groupType: 'organization',
      properties: { name: 'Test Org' },
      anonymousId: 'anon123',
      timestamp: '2024-01-01T00:00:00Z',
      system: {
        sdk: { name: 'test', version: '1.0.0' },
        sessionId: 'session123',
      },
    };

    const clickProperties: ClickEventProperties = {
      element_type: 'button',
      element_text: 'Click Me',
      element_id: 'btn-1',
      element_class: 'btn btn-primary',
      element_tag: 'button',
      page: '/test',
      page_title: 'Test Page',
      page_url: 'http://localhost/test',
      position: { x: 100, y: 200 },
    };

    const batchEvent: BatchEventInput = {
      name: 'batch_event',
      properties: { batch: true },
    };

    const trackOptions: TrackOptions = {
      timestamp: '2024-01-01T00:00:00Z',
      context: { custom: 'data' },
    };

    expect(config.apiKey).toBe('test-key');
    expect(trackEvent.name).toBe('test_event');
    expect(identifyEvent.userId).toBe('user123');
    expect(groupEvent.groupId).toBe('group123');
    expect(clickProperties.element_type).toBe('button');
    expect(batchEvent.name).toBe('batch_event');
    expect(trackOptions.timestamp).toBe('2024-01-01T00:00:00Z');
  });

  it('should properly export React-specific types', () => {
    const userProperties: UserProperties = {
      email: 'user@example.com',
      plan: 'pro',
      signup_date: '2024-01-01',
    };

    const groupProperties: GroupProperties = {
      name: 'Test Company',
      plan: 'enterprise',
      employee_count: 100,
    };

    const providerProps: Partial<LoopKitProviderProps> = {
      apiKey: 'test-key',
      config: { debug: true },
    };

    const useLoopKitOptions: UseLoopKitOptions = {
      userId: 'user123',
      userProperties: { email: 'test@example.com' },
      autoIdentify: true,
    };

    expect(userProperties.email).toBe('user@example.com');
    expect(groupProperties.name).toBe('Test Company');
    expect(providerProps.apiKey).toBe('test-key');
    expect(useLoopKitOptions.autoIdentify).toBe(true);
  });

  it('should properly type error classes', () => {
    // These should be constructable and have proper inheritance
    const baseError = new LoopKitError('Base error');
    const initError = new LoopKitInitializationError('Init error');
    const trackError = new LoopKitTrackingError('Track error');

    expect(baseError).toBeInstanceOf(Error);
    expect(baseError).toBeInstanceOf(LoopKitError);
    expect(baseError.name).toBe('LoopKitError');

    expect(initError).toBeInstanceOf(Error);
    expect(initError).toBeInstanceOf(LoopKitError);
    expect(initError).toBeInstanceOf(LoopKitInitializationError);
    expect(initError.name).toBe('LoopKitInitializationError');

    expect(trackError).toBeInstanceOf(Error);
    expect(trackError).toBeInstanceOf(LoopKitError);
    expect(trackError).toBeInstanceOf(LoopKitTrackingError);
    expect(trackError.name).toBe('LoopKitTrackingError');
  });

  it('should ensure compatibility with ILoopKit interface', () => {
    // Test that our mock matches the expected interface shape
    const mockLoopKit: Partial<ILoopKit> = {
      version: '1.1.0',
      init: () => ({} as ILoopKit),
      track: () => ({} as ILoopKit),
      identify: () => ({} as ILoopKit),
      group: () => ({} as ILoopKit),
      flush: () => Promise.resolve(),
      getQueueSize: () => 0,
    };

    expect(mockLoopKit.version).toBe('1.1.0');
    expect(typeof mockLoopKit.init).toBe('function');
    expect(typeof mockLoopKit.track).toBe('function');
    expect(typeof mockLoopKit.identify).toBe('function');
    expect(typeof mockLoopKit.group).toBe('function');
    expect(typeof mockLoopKit.flush).toBe('function');
    expect(typeof mockLoopKit.getQueueSize).toBe('function');
  });
});
