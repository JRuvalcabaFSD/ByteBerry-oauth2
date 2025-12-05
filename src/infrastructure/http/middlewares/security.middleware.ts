import { RequestHandler } from 'express';

import helmet from 'helmet';

export function createSecurityMiddleware(): RequestHandler {
	return helmet({
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
}
