import { createClockService, createNodeHashService, createUuidService } from '@/infrastructure';
import { Container, Token, criticalServices } from '@/container';
import { ContainerCreationError } from '@/shared';
import { IContainer } from '@/interfaces';
import * as factories from '@/container';
import { createConfig } from '@/config';

//TODO documentar
export function bootstrapContainer(): IContainer {
  const container = new Container();

  registerCoreServices(container);
  registerOAuthServices(container);
  registerJwtServices(container);
  registerControllers(container);
  registerDatabaseServices(container);

  validate(container, criticalServices);

  return container;
}

export function validate(container: IContainer, services: string[]): void {
  services.forEach(token => {
    if (!container.isRegistered(token as Token)) throw new ContainerCreationError(token as Token);
  });
}
function registerCoreServices(container: Container): void {
  container.registerSingleton('Config', createConfig);
  container.registerSingleton('Clock', createClockService);
  container.registerSingleton('Uuid', createUuidService);
  container.registerSingleton('Logger', factories.createWinstonLoggerService);
  container.registerSingleton('Hash', createNodeHashService);
  container.registerSingleton('GracefulShutdown', factories.createGracefulShutdown);
  container.registerSingleton('HttpServer', factories.createHttpServer);
}

function registerOAuthServices(container: IContainer): void {
  container.register('PkceVerifierService', factories.createPkceVerifierService);
  container.register('KeyProvider', factories.createKeyProvider);
  container.register('JwtService', factories.createJwtService);
  container.register('JwksService', factories.createJwksService);
}

function registerJwtServices(container: IContainer): void {
  container.register('GenerateAuthorizationCodeUseCase', factories.createGenerateAuthorizationCodeUseCase);
  container.register('ExchangeCodeForTokenUseCase', factories.createExchangeCodeForTokenUseCase);
  container.register('GetJwksUseCase', factories.createGetJwksUseCase);
}
function registerControllers(container: Container): void {
  container.registerSingleton('HealthService', factories.createHealthService);
  container.register('AuthorizeController', factories.createAuthorizeController);
  container.register('TokenController', factories.createTokenController);
  container.register('JwksController', factories.createJwksController);
}

function registerDatabaseServices(container: IContainer): void {
  container.registerSingleton('DatabaseConfig', factories.createDatabaseConfig);
  container.registerSingleton('DbClient', factories.createDbClient);
  container.registerSingleton('AuthCodeMappers', factories.createAuthCodeMapper);
  container.registerSingleton('AuthorizationCodeRepository', factories.createAuthorizationCodeRepository);
}
