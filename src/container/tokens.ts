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
 * @property `AuthController` Identifier for the authentication controller/handler.
 */
export const TOKENS = {
  //Core tokens
  Clock: Symbol.for('Clock'),
  Config: Symbol.for('Config'),
  Logger: Symbol.for('Logger'),
  Uuid: Symbol.for('Uuid'),
  HttpServer: Symbol.for('HttpServer'),

  //Server token
  AuthController: Symbol.for('AuthController'),
  HealthController: Symbol.for('HealthController'),
  GracefulShutdown: Symbol.for('GracefulShutdown'),

  //OAuth2 services
  PckValidator: Symbol.for('PckValidator'),
  JwtService: Symbol.for('JwtService'),

  //OAuth2 repositories
  AuthorizationCodeRepository: Symbol.for('AuthorizationCodeRepository'),

  //Oauth2 Use Cases
  GenerateAuthorizationCodeUseCase: Symbol.for('GenerateAuthorizationCodeUseCase'),
  ExchangeAuthorizationUseCase: Symbol.for('ExchangeAuthorizationUseCase'),
  ValidatePkceChallengeUseCase: Symbol.for('ValidatePkceChallengeUseCse'),
} as const;

/**
 * Declares the set of core application services that must be available for startup and runtime.
 *
 * Each entry associates a dependency-injection token with a human-readable name, enabling
 * validation, diagnostics, and health checks for essential infrastructure (clock, config,
 * UUID generation, HTTP server, logging, and health controller).
 *
 * @remarks
 * Use this list to assert DI registrations during bootstrap and to surface clear error
 * messages when a critical dependency is missing.
 *
 * @example
 * ```ts
 * criticalServices.forEach(({ token, name }) => {
 *   if (!container.isRegistered(token)) {
 *     throw new Error(`Missing critical service: ${name}`);
 *   }
 * });
 * ```
 *
 * @public
 */
export const criticalServices = [
  { token: TOKENS.Clock, name: 'Clock' },
  { token: TOKENS.Config, name: 'Config' },
  { token: TOKENS.Uuid, name: 'Uuid' },
  // { token: TOKENS.HttpServer, name: 'HttpServer' },
  { token: TOKENS.Logger, name: 'Logger' },
  // { token: TOKENS.HealthController, name: 'HealthController' },
];
