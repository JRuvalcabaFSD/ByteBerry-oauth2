/**
 * Registry of unique dependency-injection tokens used across the application.
 *
 * Each entry is a global Symbol (via `Symbol.for`) to ensure stable, collision-resistant
 * identifiers when binding and resolving services within the IoC container.
 *
 * @remarks
 * Use these tokens instead of magic strings to improve refactor safety and type inference
 * (reinforced by the `as const` assertion).
 *
 * @example
 * ```ts
 * container.bind(TOKENS.Logger).to(LoggerImpl);
 * const logger = container.get<Logger>(TOKENS.Logger);
 * ```
 *
 * @property `Config` Identifier for the application configuration provider.
 * @property `Uuid` Identifier for a UUID generator service.
 * @property `Clock` Identifier for a clock/time-source abstraction.
 * @property `Logger` Identifier for the application logger.
 * @property `HttpServer` Identifier for the HTTP server instance or adapter.
 * @property `HealthController` Identifier for the health-check controller/handler.
 */
export const TOKENS = {
  Clock: Symbol.for('Clock'),
  Config: Symbol.for('Config'),
  HealthController: Symbol.for('HealthController'),
  HttpServer: Symbol.for('HttpServer'),
  Logger: Symbol.for('Logger'),
  Uuid: Symbol.for('Uuid'),
} as const;

/**
 * Collection of dependency-injection tokens that are considered essential for application startup,
 * liveness, and readiness checks.
 *
 * Each item maps a DI token to a human-readable service name:
 * - token: A unique identifier from {@link TOKENS} used by the container to resolve the service.
 * - name: A short, descriptive label used for logs and diagnostics.
 *
 * The application can iterate this list to assert that all critical services are registered and
 * resolvable before accepting traffic. Updating this list changes which services are monitored as
 * part of health checks and bootstrap validation.
 *
 * @remarks
 * - Order is not significant.
 * - Ensure each token resolves synchronously or handle async readiness appropriately.
 * - Keep names concise; they appear in logs and health endpoints.
 *
 * @example
 * // Validate that all critical services can be resolved at startup
 * for (const { token, name } of criticalServices) {
 *   container.resolve(token);
 *   logger.info(`Critical service ready: ${name}`);
 * }
 *
 * @see {@link TOKENS}
 * @public
 */
export const criticalServices = [
  { token: TOKENS.Clock, name: 'Clock' },
  { token: TOKENS.Config, name: 'Config' },
  // TODO { token: TOKENS.HealthController, name: 'HealthController' },
  // TODO { token: TOKENS.HttpServer, name: 'HttpServer' },
  // TODO { token: TOKENS.Logger, name: 'Logger' },
  { token: TOKENS.Uuid, name: 'Uuid' },
];
