import { CircularDependencyError, ContainerError, DependencyCreationError, TokenAlreadyRegisteredError } from '@/shared';

describe('Container Errors', () => {
  const testToken = Symbol.for('TestToken');
  const anotherToken = Symbol.for('AnotherToken');

  describe('TokenAlreadyRegisteredError', () => {
    it('should create error with correct message and properties', () => {
      const error = new TokenAlreadyRegisteredError(testToken);

      expect(error).toBeInstanceOf(ContainerError);
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('TokenAlreadyRegisteredError');
      expect(error.token).toBe(testToken);
      expect(error.message).toContain(testToken.toString());
      expect(error.timestamp).toBeInstanceOf(Date);
    });
    it('should support instanceof checks', () => {
      const error = new TokenAlreadyRegisteredError(testToken);

      expect(error instanceof TokenAlreadyRegisteredError).toBeTruthy();
      expect(error instanceof ContainerError).toBeTruthy();
      expect(error instanceof Error).toBeTruthy();
    });
  });
  describe('CircularDependencyError', () => {
    it('should create error with dependency chain information', () => {
      const dependencyChain = [testToken, anotherToken];

      const error = new CircularDependencyError(dependencyChain, testToken);

      expect(error.name).toBe('CircularDependencyError');
      expect(error.dependencyChain).toEqual(dependencyChain);
      expect(error.conflictingToken).toBe(testToken);
      expect(error.message).toContain('->');
    });
    it('should preserve original dependency chain', () => {
      const originalChain = [testToken];

      const error = new CircularDependencyError(originalChain, anotherToken);
      originalChain.push(anotherToken);

      expect(error.dependencyChain).toEqual([testToken]);
    });
  });
  describe('DependencyCreationError', () => {
    it('should wrap original error with context', () => {
      const originalError = new Error('Original error message');

      const err = new DependencyCreationError(testToken, originalError);

      expect(err.name).toBe('DependencyCreationError');
      expect(err.token).toBe(testToken);
      expect(err.originalError).toBe(originalError);
      expect(err.message).toContain('Original error message');
    });
  });
});
