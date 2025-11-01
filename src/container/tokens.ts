import { IConfig } from '@/interfaces';

//TODO documentar
export type Token = 'Config';

export interface ServiceMap {
  Config: IConfig;
}

export const criticalServices = ['Config'];
