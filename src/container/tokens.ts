import { PrismaClient } from './../../generated/prisma/client';
import { AuthenticateUserUseCase, CreateUserUseCase, GetJwksUseCase, ValidateClientUseCase } from '@/application';
import { DatabaseConfig } from '@/config/database.config';
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
  | 'GenerateAuthorizationCodeUseCase'
  | 'ExchangeCodeForTokenUseCase'
  | 'AuthorizeController'
  | 'HealthService'
  | 'TokenController'
  | 'JwksController'
  | 'KeyProvider'
  | 'JwtService'
  | 'JwksService'
  | 'GetJwksUseCase'
  | 'DatabaseConfig'
  | 'DbClient'
  | 'AuthorizationCodeRepository'
  | 'AuthCodeMappers'
  | 'UserMapper'
  | 'UserRepository'
  | 'OAuthClientRepository'
  | 'TokenRepository'
  | 'CreateUserUseCase'
  | 'AuthenticateUserUseCase'
  | 'ValidateClientUseCase';

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
  AuthorizeController: AuthorizeController;
  PkceVerifierService: interfaces.IPKceVerifierService;
  KeyProvider: interfaces.IKeyProvider;
  JwtService: interfaces.IJwtService;
  JwksService: interfaces.IJwksService;
  GetJwksUseCase: GetJwksUseCase;
  DatabaseConfig: DatabaseConfig;
  DbClient: PrismaClient;
  AuthorizationCodeRepository: interfaces.IAuthorizationCodeRepository;
  AuthCodeMappers: interfaces.IAuthCodeMappers;
  UserMapper: interfaces.IUserMapper;
  UserRepository: interfaces.IUserRepository;
  OAuthClientRepository: interfaces.IOAuthClientRepository;
  TokenRepository: interfaces.ITokenRepository;
  CreateUserUseCase: CreateUserUseCase;
  AuthenticateUserUseCase: AuthenticateUserUseCase;
  ValidateClientUseCase: ValidateClientUseCase;
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
  'DatabaseConfig',
  'DbClient',
  'AuthorizationCodeRepository',
  'AuthCodeMappers',
  'UserMapper',
  'UserRepository',
  'OAuthClientRepository',
  'TokenRepository',
  'CreateUserUseCase',
  'AuthenticateUserUseCase',
  'ValidateClientUseCase',
];
