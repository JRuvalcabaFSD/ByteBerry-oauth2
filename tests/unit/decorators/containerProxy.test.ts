/**
 * @fileoverview Unit tests for containerProxy
 * @description Tests container proxy functionality including resolve method interception,
 * logger context wrapping, and property forwarding behavior.
 *
 * @author JRuvalcabaFSD
 * @since 1.0.0
 */

import { containerWithLoggerContext } from '@/shared/decorators/containerProxy';
import { ILogger } from '@/interfaces';

// Mock implementations
const mockLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
} as unknown as ILogger;

const mockWrappedLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
} as unknown as ILogger;

const mockContainer = {
  resolve: jest.fn(),
  otherMethod: jest.fn(),
  someProperty: 'test-value',
};

// Mock withLoggerContext
jest.mock('@/shared', () => ({
  ...jest.requireActual('@/shared'),
  withLoggerContext: jest.fn(() => mockWrappedLogger),
}));

describe('Container Proxy', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { withLoggerContext } = require('@/shared');

  beforeEach(() => {
    jest.clearAllMocks();
    mockContainer.resolve = jest.fn().mockImplementation((token: string) => {
      if (token === 'Logger') return mockLogger;
      if (token === 'Config') return { port: 3000 };
      return `resolved-${token}`;
    });
  });

  /**
   * @test Intercepts resolve method for Logger token
   * @description Verifies that proxy intercepts resolve calls for 'Logger' token
   * and wraps the resolved logger with context (lines 47-62)
   */
  it('should intercept resolve method for Logger token', () => {
    const proxiedContainer = containerWithLoggerContext(mockContainer, 'TestContext');

    const result = proxiedContainer.resolve('Logger');

    expect(mockContainer.resolve).toHaveBeenCalledWith('Logger');
    expect(withLoggerContext).toHaveBeenCalledWith(mockLogger, 'TestContext');
    expect(result).toBe(mockWrappedLogger);
  });

  /**
   * @test Forwards resolve calls for non-Logger tokens unchanged
   * @description Ensures that resolve calls for tokens other than 'Logger'
   * are forwarded to original container without modification (lines 55-59)
   */
  it('should forward resolve calls for non-Logger tokens unchanged', () => {
    const proxiedContainer = containerWithLoggerContext(mockContainer, 'TestContext');

    const configResult = proxiedContainer.resolve('Config');
    const serviceResult = proxiedContainer.resolve('SomeService');

    expect(mockContainer.resolve).toHaveBeenCalledWith('Config');
    expect(mockContainer.resolve).toHaveBeenCalledWith('SomeService');
    expect(configResult).toEqual({ port: 3000 });
    expect(serviceResult).toBe('resolved-SomeService');
    expect(withLoggerContext).not.toHaveBeenCalled();
  });

  /**
   * @test Forwards non-resolve property access to original container
   * @description Validates that proxy forwards all property access except resolve
   * to the original container maintaining normal behavior (lines 63-67)
   */
  it('should forward non-resolve property access to original container', () => {
    const proxiedContainer = containerWithLoggerContext(mockContainer, 'TestContext');

    // Access method
    expect(proxiedContainer.otherMethod).toBe(mockContainer.otherMethod);

    // Access property
    expect(proxiedContainer.someProperty).toBe('test-value');

    // Call forwarded method
    proxiedContainer.otherMethod('test-arg');
    expect(mockContainer.otherMethod).toHaveBeenCalledWith('test-arg');
  });

  /**
   * @test Preserves resolve method signature and context binding
   * @description Ensures that the wrapped resolve method maintains proper 'this' context
   * and handles rest parameters correctly (lines 51-60)
   */
  it('should preserve resolve method signature and context binding', () => {
    const proxiedContainer = containerWithLoggerContext(mockContainer, 'TestContext');

    // Test with additional arguments
    mockContainer.resolve = jest.fn().mockImplementation((token, ...rest) => {
      return `resolved-${token}-${rest.join('-')}`;
    });

    const result = proxiedContainer.resolve('TestService', 'arg1', 'arg2');

    expect(mockContainer.resolve).toHaveBeenCalledWith('TestService', 'arg1', 'arg2');
    expect(result).toBe('resolved-TestService-arg1-arg2');
  });

  /**
   * @test Handles resolve method type casting correctly
   * @description Validates that the wrapped resolve function is properly cast
   * to maintain TypeScript compatibility (lines 61-62)
   */
  it('should handle resolve method type casting correctly', () => {
    const proxiedContainer = containerWithLoggerContext(mockContainer, 'TestContext');

    // Verify that the proxied container maintains the same interface
    expect(typeof proxiedContainer.resolve).toBe('function');
    expect(typeof proxiedContainer.otherMethod).toBe('function');
    expect(typeof proxiedContainer.someProperty).toBe('string');

    // Test that resolve works with different token types
    const stringToken = proxiedContainer.resolve('StringToken');
    const numberToken = proxiedContainer.resolve(42 as any);

    expect(stringToken).toBe('resolved-StringToken');
    expect(numberToken).toBe('resolved-42');
  });
});
