import { createClockService, createKeyProvider, createNodeHashService, createUuidService } from '@/infrastructure';
import { Container, Token, criticalServices } from '@/container';
import { ContainerCreationError } from '@/shared';
import { IContainer } from '@/interfaces';
import * as factories from '@/container';
import { createConfig } from '@/config';

//TODO documentar
export function bootstrapContainer(): IContainer {
  const container = new Container();

  //Core services
  container.registerSingleton('Config', createConfig);
  container.registerSingleton('Clock', createClockService);
  container.registerSingleton('Uuid', createUuidService);
  container.registerSingleton('Logger', factories.createWinstonLoggerService);
  container.registerSingleton('Hash', createNodeHashService);

  //Http Services
  container.registerSingleton('GracefulShutdown', factories.createGracefulShutdown);
  container.registerSingleton('HttpServer', factories.createHttpServer);

  //OAuth2 services
  container.registerSingleton('CodeStore', factories.createCodeStore);
  container.register('PkceVerifierService', factories.createPkceVerifierService);
  container.register('KeyProvider', createKeyProvider);
  container.register('JwtService', factories.createJwtService);
  container.register('JwksService', factories.createJwksService);

  //Uses cases
  container.register('GenerateAuthorizationCodeUseCase', factories.createGenerateAuthorizationCodeUseCase);
  container.register('ExchangeCodeForTokenUseCase', factories.createExchangeCodeForTokenUseCase);
  container.register('GetJwksUseCase', factories.createGetJwksUseCase);

  //Controllers
  container.registerSingleton('HealthController', factories.createHealthController);
  container.register('AuthorizeController', factories.createAuthorizeController);
  container.register('TokenController', factories.createTokenController);
  container.register('JwksController', factories.createJwksController);

  validate(container, criticalServices);

  return container;
}

export function validate(container: IContainer, services: string[]): void {
  services.forEach(token => {
    if (!container.isRegistered(token as Token)) throw new ContainerCreationError(token as Token);
  });
}
