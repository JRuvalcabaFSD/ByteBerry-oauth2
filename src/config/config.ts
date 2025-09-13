import dotenv from 'dotenv';
import { get } from 'env-var';

dotenv.config({ override: false });

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface AppConfig {
  nodeEnv: 'development' | 'production' | 'test';
  port: number;
  logLevel: LogLevel;
}

export function loadConfig(): AppConfig {
  return {
    nodeEnv: get('NODE_ENV').default('development').asEnum(['development', 'production', 'test']),
    port: get('PORT').default(4000).asPortNumber(),
    logLevel: get('LOG_LEVEL').default('info').asEnum(['debug', 'info', 'warn', 'error']),
  };
}
