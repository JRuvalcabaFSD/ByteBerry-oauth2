/* eslint-disable @typescript-eslint/no-explicit-any */
import helmet from 'helmet';

import { createSecurityMiddleware } from '@infrastructure';

vi.mock('helmet');

describe('SecurityMiddleware', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('createSecurityMiddleware', () => {
		it('should call helmet with correct configuration', () => {
			const mockHelmetReturn = vi.fn();
			(helmet as any).mockReturnValue(mockHelmetReturn);

			const _middleware = createSecurityMiddleware();

			expect(helmet).toHaveBeenCalledOnce();
			expect(helmet).toHaveBeenCalledWith({
				contentSecurityPolicy: {
					directives: {
						defaultSrc: ["'self'"],
						styleSrc: ["'self'", "'unsafe-inline'"],
						scriptSrc: ["'self'"],
						imgSrc: ["'self'", 'data:', 'https:'],
					},
				},
				hsts: {
					maxAge: 31536000,
					includeSubDomains: true,
					preload: true,
				},
			});
		});

		it('should return helmet middleware', () => {
			const mockHelmetReturn = vi.fn();
			(helmet as any).mockReturnValue(mockHelmetReturn);

			const middleware = createSecurityMiddleware();

			expect(middleware).toBe(mockHelmetReturn);
		});

		it('should configure CSP directives correctly', () => {
			createSecurityMiddleware();

			const helmetCall = (helmet as any).mock.calls[0][0];

			expect(helmetCall.contentSecurityPolicy.directives.defaultSrc).toEqual(["'self'"]);
			expect(helmetCall.contentSecurityPolicy.directives.styleSrc).toContain("'unsafe-inline'");
			expect(helmetCall.contentSecurityPolicy.directives.imgSrc).toContain('https:');
		});

		it('should configure HSTS with 1 year maxAge', () => {
			createSecurityMiddleware();

			const helmetCall = (helmet as any).mock.calls[0][0];

			expect(helmetCall.hsts.maxAge).toBe(31536000); // 1 year in seconds
			expect(helmetCall.hsts.includeSubDomains).toBe(true);
			expect(helmetCall.hsts.preload).toBe(true);
		});
	});
});
