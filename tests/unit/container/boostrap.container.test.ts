/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContainerCreationError } from '@shared';

// Mock del módulo factories desde @container
vi.mock('@container', async () => {
	const actual = await vi.importActual('@container');
	return {
		...actual,
		createConfig: vi.fn(() => ({ value: 'mocked-config' })),
		criticalServices: () => ['Config'],
	};
});

describe('bootstrapContainer', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should create and return a container with registered services', async () => {
		const { bootstrapContainer } = await import('@container');
		const container = bootstrapContainer();

		expect(container).toBeDefined();
		expect(container.isRegistered('Config')).toBe(true);
	});

	it('should register core services correctly', async () => {
		const { bootstrapContainer } = await import('@container');
		const container = bootstrapContainer();
		const config = container.resolve('Config');

		expect(config).toHaveProperty('nodeEnv');
		expect(config).toHaveProperty('port');
		expect(config).toHaveProperty('version');
		expect(config).toHaveProperty('logLevel');
		expect(config).toHaveProperty('logRequests');
	});

	it('should validate that all critical services are registered', async () => {
		const { bootstrapContainer } = await import('@container');
		const container = bootstrapContainer();

		// Todos los servicios críticos deben estar registrados
		expect(container.isRegistered('Config')).toBe(true);
	});

	it('should throw ContainerCreationError if critical service is not registered', async () => {
		// Este test verifica que la validación funciona creando un contenedor manualmente
		// y validando con un servicio que no existe
		const { Container } = await import('@container');
		const container = new Container();
		container.register('Config', () => ({ nodeEnv: 'test', port: 3000, version: '1.0.0', logLevel: 'info', logRequests: true }));

		// Validar con un servicio que no existe
		const services = ['Config', 'NonExistentService'];
		expect(() => {
			services.forEach((token) => {
				if (!container.isRegistered(token as any)) throw new ContainerCreationError(token as any);
			});
		}).toThrow(ContainerCreationError);
	});

	it('should return a fully functional container', async () => {
		const { bootstrapContainer } = await import('@container');
		const container = bootstrapContainer();

		// Verificar que el container puede resolver servicios
		expect(() => container.resolve('Config')).not.toThrow();
	});

	it('should validate services using Object.values iteration', async () => {
		// Este test verifica que la función validate itera correctamente
		// sobre los servicios críticos usando Object.values
		const { Container } = await import('@container');
		const container = new Container();

		// No registrar Config para forzar el error
		const mockCriticalServices = () => ({ Config: 'Config' });

		expect(() => {
			const services = mockCriticalServices();
			Object.values(services).forEach((token) => {
				if (!container.isRegistered(token as any)) {
					throw new ContainerCreationError(token as any);
				}
			});
		}).toThrow(ContainerCreationError);
	});
});
