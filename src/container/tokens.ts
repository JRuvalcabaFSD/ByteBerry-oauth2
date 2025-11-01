import { IClock, IConfig, IUuid } from '@/interfaces';

//TODO documentar
export type Token = 'Config' | 'Clock' | 'Uuid';

export interface ServiceMap {
  Config: IConfig;
  Clock: IClock;
  Uuid: IUuid;
}

export const criticalServices = ['Config', 'Clock', 'Uuid'];
