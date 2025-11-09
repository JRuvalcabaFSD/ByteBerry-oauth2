import { GracefulShutdown } from '@/infrastructure';
import {
  IClock,
  ICodeStore,
  IConfig,
  IExchangeCodeForTokenUseCase,
  IGenerateAuthorizationCodeUseCase,
  IHashService,
  IHealthController,
  IHttpServer,
  ILogger,
  IPKceVerifierService,
  IUuid,
} from '@/interfaces';
import { AuthorizeController, JWksController, TokenController } from '@/presentation';

//TODO documentar
export type Token =
  | 'Config'
  | 'Clock'
  | 'Uuid'
  | 'Logger'
  | 'Hash'
  | 'PkceVerifierService'
  | 'GracefulShutdown'
  | 'HttpServer'
  | 'CodeStore'
  | 'GenerateAuthorizationCodeUseCase'
  | 'ExchangeCodeForTokenUseCase'
  | 'AuthorizeController'
  | 'HealthController'
  | 'TokenController'
  | 'JwksController';

export interface ServiceMap {
  Config: IConfig;
  Clock: IClock;
  Uuid: IUuid;
  Logger: ILogger;
  Hash: IHashService;
  GracefulShutdown: GracefulShutdown;
  HttpServer: IHttpServer;
  HealthController: IHealthController;
  GenerateAuthorizationCodeUseCase: IGenerateAuthorizationCodeUseCase;
  TokenController: TokenController;
  JwksController: JWksController;
  ExchangeCodeForTokenUseCase: IExchangeCodeForTokenUseCase;
  CodeStore: ICodeStore;
  AuthorizeController: AuthorizeController;
  PkceVerifierService: IPKceVerifierService;
}

export const criticalServices = [
  'Config',
  'Clock',
  'Uuid',
  'Logger',
  'Hash',
  'PkceVerifierService',
  'GracefulShutdown',
  'HttpServer',
  'CodeStore',
  'GenerateAuthorizationCodeUseCase',
  'ExchangeCodeForTokenUseCase',
  'HealthController',
  'AuthorizeController',
  'TokenController',
  'JwksController',
];
