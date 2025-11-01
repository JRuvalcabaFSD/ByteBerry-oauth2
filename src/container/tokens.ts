import { GracefulShutdown } from '@/infrastructure';
import { IClock, IConfig, IHttpServer, ILogger, IUuid } from '@/interfaces';

//TODO documentar
export type Token = 'Config' | 'Clock' | 'Uuid' | 'Logger' | 'GracefulShutdown' | 'HttpServer';

export interface ServiceMap {
  Config: IConfig;
  Clock: IClock;
  Uuid: IUuid;
  Logger: ILogger;
  GracefulShutdown: GracefulShutdown;
  HttpServer: IHttpServer;
}

export const criticalServices = ['Config', 'Clock', 'Uuid', 'Logger', 'GracefulShutdown', 'HttpServer'];
