export type NodeEnvs = 'development' | 'production' | 'test';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Interface that determines how the environment variable configuration class should be implemented
 * @export
 * @interface IEnvConfig
 */
export interface IEnvConfig {
  readonly port: number;
  readonly nodeEnv: NodeEnvs;
  readonly logLevel: LogLevel;
  isDevelopment(): boolean;
  isProduction(): boolean;
  isTest(): boolean;
}
