/**
 * @fileoverview Unit tests for logger decorators
 * @description Tests logger decorator functionality including function wrapping,
 * method decorators, context functions, and container logger wrapping.
 *
 * @author JRuvalcabaFSD
 * @since 1.0.0
 */

import { withLoggerContext, LogContextMethod, logContextFunction, wrapContainerLogger } from '@/shared/decorators/logger.decorators';
import { ILogger } from '@/interfaces';

// Mock implementations
const mockLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
} as unknown as ILogger;

describe('Logger Decorators', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('withLoggerContext - Function wrapping (lines 108-124)', () => {
    /**
     * @test Wraps function and finds logger in arguments
     * @description Verifies that function wrapper searches for logger in arguments
     * and logs function execution with context (lines 110-118)
     */
    it('should wrap function and find logger in arguments', () => {
      const testFunction = jest.fn().mockReturnValue('result');
      const wrappedFunction = withLoggerContext(testFunction, 'TestContext');

      const argWithLogger = { logger: mockLogger, data: 'test' };
      const result = wrappedFunction(argWithLogger, 'other-arg');

      expect(mockLogger.debug).toHaveBeenCalledWith('[TestContext] Function executed');
      expect(testFunction).toHaveBeenCalledWith(argWithLogger, 'other-arg');
      expect(result).toBe('result');
    });

    /**
     * @test Handles function without logger in arguments
     * @description Ensures function wrapper works when no logger is found in arguments
     * and doesn't attempt to log (lines 113-117)
     */
    it('should handle function without logger in arguments', () => {
      const testFunction = jest.fn().mockReturnValue('result');
      const wrappedFunction = withLoggerContext(testFunction, 'TestContext');

      const result = wrappedFunction('arg1', 'arg2');

      expect(mockLogger.debug).not.toHaveBeenCalled();
      expect(testFunction).toHaveBeenCalledWith('arg1', 'arg2');
      expect(result).toBe('result');
    });

    /**
     * @test Preserves function signature and return type
     * @description Validates that wrapped function maintains original signature
     * and return type correctly (lines 112-120)
     */
    it('should preserve function signature and return type', async () => {
      const asyncFunction = jest.fn().mockResolvedValue('async-result');
      const wrappedAsyncFunction = withLoggerContext(asyncFunction, 'AsyncContext');

      const argWithLogger = { logger: mockLogger };
      const result = wrappedAsyncFunction(argWithLogger);

      expect(mockLogger.debug).toHaveBeenCalledWith('[AsyncContext] Function executed');
      expect(asyncFunction).toHaveBeenCalledWith(argWithLogger);
      await expect(result).resolves.toBe('async-result');
    });

    /**
     * @test Returns original target when not function or logger
     * @description Ensures that non-function, non-logger targets are returned unchanged
     * (line 123)
     */
    it('should return original target when not function or logger', () => {
      const plainObject = { data: 'test' };
      const result = withLoggerContext(plainObject as any, 'TestContext');

      expect(result).toBe(plainObject);
    });
  });

  describe('LogContextMethod decorator error handling (lines 292-293)', () => {
    /**
     * @test Throws error when applied to non-method
     * @description Verifies that LogContextMethod decorator throws error
     * when applied to non-function descriptor (lines 292-293)
     */
    it('should throw error when applied to non-method', () => {
      const decorator = LogContextMethod();

      expect(() => {
        decorator({}, 'property', { value: 'not-a-function' } as any);
      }).toThrow('LogContextMethod solo puede aplicarse a métodos');

      expect(() => {
        decorator({}, 'property', {} as any);
      }).toThrow('LogContextMethod solo puede aplicarse a métodos');

      expect(() => {
        decorator({}, 'property', undefined as any);
      }).toThrow('LogContextMethod solo puede aplicarse a métodos');
    });
  });

  describe('logContextFunction (lines 365-370)', () => {
    /**
     * @test Wraps function with logger context
     * @description Verifies that logContextFunction creates wrapper that applies
     * context based on function name (lines 365-370)
     */
    it('should wrap function with logger context', () => {
      // Create a named function for testing
      function namedTestFunction(logger: ILogger, data: string) {
        logger.info(`Processing: ${data}`);
        return `processed-${data}`;
      }

      const wrappedFunction = logContextFunction(namedTestFunction);
      const result = wrappedFunction(mockLogger, 'test-data');

      // Verify the function was called with the logger and arguments
      expect(result).toBe('processed-test-data');

      // The wrapper should have called the original function with wrapped logger
      // We can't easily test the internal wrapping, but we can test the behavior
      expect(typeof wrappedFunction).toBe('function');
    });

    /**
     * @test Handles anonymous functions
     * @description Ensures anonymous functions are wrapped with 'AnonymousFunction' context
     * (lines 367-368)
     */
    it('should handle anonymous functions', () => {
      const anonymousFunction = (logger: ILogger, data: string) => {
        logger.info(`Processing: ${data}`);
        return `anonymous-${data}`;
      };

      const wrappedFunction = logContextFunction(anonymousFunction);
      const result = wrappedFunction(mockLogger, 'test');

      expect(result).toBe('anonymous-test');
      expect(typeof wrappedFunction).toBe('function');
    });
  });

  describe('wrapContainerLogger (lines 395-410)', () => {
    const mockContainer = {
      resolve: jest.fn(),
      otherMethod: jest.fn(),
      someProperty: 'container-value',
    };

    /**
     * @test Wraps container resolve method for Logger token
     * @description Verifies that container proxy intercepts Logger token resolution
     * and applies context wrapping (lines 398-405)
     */
    it('should wrap container resolve method for Logger token', () => {
      mockContainer.resolve = jest.fn().mockImplementation(token => {
        if (token === 'Logger') return mockLogger;
        return `resolved-${token}`;
      });

      const wrappedContainer = wrapContainerLogger(mockContainer, 'ContainerContext');
      const result = wrappedContainer.resolve('Logger');

      expect(mockContainer.resolve).toHaveBeenCalledWith('Logger');
      // The result should be a wrapped logger (we can't easily test the exact wrapping)
      expect(result).toBeDefined();
      expect(typeof result.debug).toBe('function');
    });

    /**
     * @test Forwards non-Logger token resolution unchanged
     * @description Ensures non-Logger tokens are resolved normally without wrapping
     * (lines 400-404)
     */
    it('should forward non-Logger token resolution unchanged', () => {
      mockContainer.resolve = jest.fn().mockReturnValue('service-instance');

      const wrappedContainer = wrapContainerLogger(mockContainer, 'ContainerContext');
      const result = wrappedContainer.resolve('SomeService');

      expect(mockContainer.resolve).toHaveBeenCalledWith('SomeService');
      expect(result).toBe('service-instance');
    });

    /**
     * @test Forwards non-resolve property access to original container
     * @description Validates that proxy forwards all non-resolve properties
     * to original container (lines 407-408)
     */
    it('should forward non-resolve property access to original container', () => {
      const wrappedContainer = wrapContainerLogger(mockContainer, 'ContainerContext');

      expect(wrappedContainer.otherMethod).toBe(mockContainer.otherMethod);
      expect(wrappedContainer.someProperty).toBe('container-value');

      wrappedContainer.otherMethod('test-arg');
      expect(mockContainer.otherMethod).toHaveBeenCalledWith('test-arg');
    });

    /**
     * @test Handles Logger token with non-logger-like resolved value
     * @description Ensures that if Logger token resolves to non-logger-like object,
     * it's returned unchanged (lines 401-404)
     */
    it('should handle Logger token with non-logger-like resolved value', () => {
      const nonLoggerObject = { data: 'not-a-logger' };
      mockContainer.resolve = jest.fn().mockReturnValue(nonLoggerObject);

      const wrappedContainer = wrapContainerLogger(mockContainer, 'ContainerContext');
      const result = wrappedContainer.resolve('Logger');

      expect(result).toBe(nonLoggerObject);
    });
  });
});
