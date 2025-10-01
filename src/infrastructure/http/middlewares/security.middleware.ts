import helmet from 'helmet';

/**
 * Creates a security middleware using Helmet.js to enhance application security.
 *
 * This middleware configures various security headers including:
 * - Content Security Policy (CSP) to prevent XSS attacks by controlling resource loading
 * - HTTP Strict Transport Security (HSTS) to enforce HTTPS connections
 *
 * @returns {Function} Express middleware function that applies security headers to HTTP responses
 *
 * @example
 * ```typescript
 * const app = express();
 * app.use(createSecurityMiddleware());
 * ```
 */
export function createSecurityMiddleware() {
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
