import { GracefulShutdown } from '@/infrastructure';
import { IClock, IConfig, IHealthController, IHttpServer, ILogger, IUuid } from '@/interfaces';

//TODO documentar
export type Token = 'Config' | 'Clock' | 'Uuid' | 'Logger' | 'GracefulShutdown' | 'HttpServer' | 'HealthController';

export interface ServiceMap {
  Config: IConfig;
  Clock: IClock;
  Uuid: IUuid;
  Logger: ILogger;
  GracefulShutdown: GracefulShutdown;
  HttpServer: IHttpServer;
  HealthController: IHealthController;
}

export const criticalServices = ['Config', 'Clock', 'Uuid', 'Logger', 'GracefulShutdown', 'HttpServer', 'HealthController'];
