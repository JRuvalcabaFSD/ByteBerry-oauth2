import { createConfig } from '@/config';
import { Container, Token, criticalServices } from '@/container';
import * as factories from '@/container';
import { createClockService, createNodeHashService, createUuidService } from '@/infrastructure';
import { IContainer } from '@/interfaces';
import { ContainerCreationError } from '@/shared';

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
  container.register('GenerateAuthorizationCodeUseCase', factories.createGenerateAuthorizationCodeUseCase);
  container.register('ExchangeCodeForTokenUseCase', factories.createExchangeCodeForTokenUseCase);
  container.register('PkceVerifierService', factories.createPkceVerifierService);

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
