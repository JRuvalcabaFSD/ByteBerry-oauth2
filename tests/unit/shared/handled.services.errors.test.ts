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

		// Crear un error real que tenga stack
		const error = new Error('Container initialization failed');
		const containerError: any = Object.assign(error, {
			errorType: 'container',
		});

		handledServicesError(containerError);

		// Verificar que el log contiene todo en una sola llamada
		const logCall = consoleLogSpy.mock.calls[0][0];

		// Verificar timestamp y namespace
		expect(logCall).toContain('14:30:45.123 UTC');
		expect(logCall).toContain('[ByteBerry-OAuth2]');

		// Verificar mensaje
		expect(logCall).toContain('Container initialization failed');

		// Verificar que el stack trace está incluido
		expect(logCall).toContain('Error: Container initialization failed');

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

		// Verificar que contiene el mensaje
		expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Container error'));

		// Verificar que NO contiene stack trace (stack es null en producción)
		const logCall = consoleLogSpy.mock.calls[0][0];
		expect(logCall).not.toContain('Error:');
		expect(logCall).not.toContain('at ');

		process.env.NODE_ENV = originalEnv;
	});
});
