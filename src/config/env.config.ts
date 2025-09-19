import dotenv from 'dotenv';
import { get } from 'env-var';

import { IEnvConfig, LogLevel, NodeEnvs } from '@/interfaces';

dotenv.config({ override: false });

/**
 * Load the initial configuration of the environment variables
 * @export
 * @class EnvConfig
 * @implements {IEnvConfig}
 */
export class EnvConfig implements IEnvConfig {
  public readonly port: number;
  public readonly nodeEnv: NodeEnvs;
  public readonly logLevel: LogLevel;

  /**
   * Creates an instance of EnvConfig.
   * @memberof EnvConfig
   */
  constructor() {
    this.port = get('PORT').default(4000).asPortNumber();
    this.nodeEnv = get('NODE_ENV').default('development').asEnum(['development', 'production', 'test']) as NodeEnvs;
    this.logLevel = get('LOG_LEVEL').default('info').asEnum(['debug', 'info', 'warn', 'error']) as LogLevel;
  }

  /**
   * Returns if the application is running in development mode
   * @return {*}  {boolean}
   * @memberof EnvConfig
   */
  public isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  /**
   * Returns if the application is running in production mode
   * @return {*}  {boolean}
   * @memberof EnvConfig
   */
  public isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  /**
   * Returns if the application is running in test mode
   * @return {*}  {boolean}
   * @memberof EnvConfig
   */
  public isTest(): boolean {
    return this.nodeEnv === 'test';
  }
}
