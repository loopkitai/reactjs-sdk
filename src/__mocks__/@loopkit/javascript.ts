/**
 * Mock for @loopkit/javascript
 */
import type { ILoopKit } from '@loopkit/javascript';

// Create a function that returns the mock to avoid hoisting issues
const createMockLoopKit = (): ILoopKit => ({
  version: '1.1.0',

  init: jest
    .fn()
    .mockImplementation(() => Promise.resolve(createMockLoopKit())),
  configure: jest.fn().mockImplementation(() => createMockLoopKit()),
  getConfig: jest.fn().mockReturnValue({
    apiKey: 'test-api-key',
    enableAutoCapture: true,
    enableAutoClickTracking: true,
    enableErrorTracking: true,
    debug: false,
  }),

  track: jest.fn().mockImplementation(() => createMockLoopKit()),
  trackBatch: jest.fn().mockImplementation(() => createMockLoopKit()),
  identify: jest.fn().mockImplementation(() => createMockLoopKit()),
  group: jest.fn().mockImplementation(() => createMockLoopKit()),

  flush: jest.fn().mockResolvedValue(undefined),
  getQueueSize: jest.fn().mockReturnValue(0),
  reset: jest.fn(),
  resetForTesting: jest.fn(),
});

// Mock implementation of LoopKit
const mockLoopKit = createMockLoopKit();

// Helper to reset all mocks
export const resetMocks = () => {
  const mockMethods = [
    mockLoopKit.init,
    mockLoopKit.configure,
    mockLoopKit.getConfig,
    mockLoopKit.track,
    mockLoopKit.trackBatch,
    mockLoopKit.identify,
    mockLoopKit.group,
    mockLoopKit.flush,
    mockLoopKit.getQueueSize,
    mockLoopKit.reset,
    mockLoopKit.resetForTesting,
  ];

  mockMethods.forEach((fn) => {
    if (jest.isMockFunction(fn)) {
      fn.mockClear();
    }
  });
};

// Helper to simulate initialization success/failure
export const mockInitSuccess = () => {
  (mockLoopKit.init as jest.Mock).mockImplementation(() =>
    Promise.resolve(createMockLoopKit())
  );
};

export const mockInitFailure = (error = new Error('Init failed')) => {
  (mockLoopKit.init as jest.Mock).mockImplementation(() =>
    Promise.reject(error)
  );
};

// Helper to simulate flush success/failure
export const mockFlushSuccess = () => {
  (mockLoopKit.flush as jest.Mock).mockResolvedValue(undefined);
};

export const mockFlushFailure = (error = new Error('Flush failed')) => {
  (mockLoopKit.flush as jest.Mock).mockRejectedValue(error);
};

export default mockLoopKit;
