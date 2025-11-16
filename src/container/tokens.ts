import { GetJwksUseCase } from '@/application';
import { GracefulShutdown } from '@/infrastructure';
import * as interfaces from '@/interfaces';
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
  | 'HealthService'
  | 'TokenController'
  | 'JwksController'
  | 'KeyProvider'
  | 'JwtService'
  | 'JwksService'
  | 'GetJwksUseCase';

export interface ServiceMap {
  Config: interfaces.IConfig;
  Clock: interfaces.IClock;
  Uuid: interfaces.IUuid;
  Logger: interfaces.ILogger;
  Hash: interfaces.IHashService;
  GracefulShutdown: GracefulShutdown;
  HttpServer: interfaces.IHttpServer;
  HealthService: interfaces.IHealthService;
  GenerateAuthorizationCodeUseCase: interfaces.IGenerateAuthorizationCodeUseCase;
  TokenController: TokenController;
  JwksController: JWksController;
  ExchangeCodeForTokenUseCase: interfaces.IExchangeCodeForTokenUseCase;
  CodeStore: interfaces.ICodeStore;
  AuthorizeController: AuthorizeController;
  PkceVerifierService: interfaces.IPKceVerifierService;
  KeyProvider: interfaces.IKeyProvider;
  JwtService: interfaces.IJwtService;
  JwksService: interfaces.IJwksService;
  GetJwksUseCase: GetJwksUseCase;
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
  'HealthService',
  'AuthorizeController',
  'TokenController',
  'JwksController',
  'KeyProvider',
  'JwtService',
  'JwksService',
  'GetJwksUseCase',
];
