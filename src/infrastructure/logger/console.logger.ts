import { LogLevel } from '@/config';
import { Logger } from '@/interfaces';

export class ConsoleLogger implements Logger {
  constructor(
    private readonly level: LogLevel = 'info',
    private readonly bindings: Record<string, unknown> = {}
  ) {}

  child(biddings: Record<string, unknown>): Logger {
    return new ConsoleLogger(this.level, { ...this.bindings, ...biddings });
  }

  private log(lvl: LogLevel, msg: string, data?: Record<string, unknown>): void {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    if (levels.indexOf(lvl) < levels.indexOf(this.level)) return;

    const payload = {
      timestamp: new Date().toISOString(),
      level: lvl,
      message: msg,
      ...this.bindings,
      ...(data ? { data } : {}),
    };

    // eslint-disable-next-line no-console
    console[lvl === 'warn' ? 'warn' : lvl === 'error' ? 'error' : 'log'](JSON.stringify(payload));
  }

  debug(msg: string, data?: Record<string, unknown>): void {
    this.log('debug', msg, data);
  }
  info(msg: string, data?: Record<string, unknown>): void {
    this.log('info', msg, data);
  }
  warn(msg: string, data?: Record<string, unknown>): void {
    this.log('warn', msg, data);
  }
  error(msg: string, data?: Record<string, unknown>): void {
    this.log('error', msg, data);
  }
}
