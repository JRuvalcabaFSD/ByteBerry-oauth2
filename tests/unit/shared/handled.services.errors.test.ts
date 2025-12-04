/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConfigError, handledServicesError } from '@shared';

describe('handledServicesError', () => {
	let consoleLogSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2025-01-15T14:30:45.123Z'));
	});

	afterEach(() => {
		consoleLogSpy.mockRestore();
		vi.useRealTimers();
	});

	it('should handle ConfigError with development message', () => {
		const originalEnv = process.env.NODE_ENV;
		process.env.NODE_ENV = 'development';

		const configError = new ConfigError('Invalid configuration', { key: 'value' });
		handledServicesError(configError);

		expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('14:30:45.123 UTC'));
		expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid configuration'));

		process.env.NODE_ENV = originalEnv;
	});

	it('should handle ConfigError with generic message in production', () => {
		const originalEnv = process.env.NODE_ENV;
		process.env.NODE_ENV = 'production';

		const configError = new ConfigError('Sensitive error details', { key: 'secret' });
		handledServicesError(configError);

		expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Configuration error'));
		expect(consoleLogSpy).not.toHaveBeenCalledWith(expect.stringContaining('Sensitive error details'));

		process.env.NODE_ENV = originalEnv;
	});

	it('should use default handler for unknown error types', () => {
		const genericError = new Error('Generic error message');
		handledServicesError(genericError);

		expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Internal Server Error'));
		expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Generic error message'));
	});

	it('should handle errors without errorType property', () => {
		const customError = { message: 'Custom error' };
		handledServicesError(customError);

		expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Internal Server Error'));
	});

	it('should include timestamp in all error logs', () => {
		const error = new Error('Test error');
		handledServicesError(error);

		expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('14:30:45.123 UTC'));
		expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('[ByteBerry-OAuth2]'));
	});

	it('should handle ContainerError with development stack trace', () => {
		const originalEnv = process.env.NODE_ENV;
		process.env.NODE_ENV = 'development';

		const containerError: any = {
			errorType: 'container',
			message: 'Container initialization failed',
			stack: 'Error: Container initialization failed\n    at Container.resolve',
		};
		handledServicesError(containerError);

		expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Container initialization failed'));
		expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Error: Container initialization failed'));

		process.env.NODE_ENV = originalEnv;
	});

	it('should handle ContainerError without stack trace in production', () => {
		const originalEnv = process.env.NODE_ENV;
		process.env.NODE_ENV = 'production';

		const containerError: any = {
			errorType: 'container',
			message: 'Service resolution failed',
		};
		handledServicesError(containerError);

		expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Service resolution failed'));
		expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('null'));

		process.env.NODE_ENV = originalEnv;
	});
});
