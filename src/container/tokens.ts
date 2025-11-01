import { IClock, IConfig, ILogger, IUuid } from '@/interfaces';

//TODO documentar
export type Token = 'Config' | 'Clock' | 'Uuid' | 'Logger';

export interface ServiceMap {
  Config: IConfig;
  Clock: IClock;
  Uuid: IUuid;
  Logger: ILogger;
}

export const criticalServices = ['Config', 'Clock', 'Uuid', 'Logger'];
