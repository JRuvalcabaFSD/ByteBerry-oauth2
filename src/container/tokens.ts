export const TOKENS = {
  Config: Symbol.for('Config'),
  Logger: Symbol.for('Logger'),
  Clock: Symbol.for('Clock'),
  Uuid: Symbol.for('Uuid'),
  HttpServer: Symbol.for('HttpServer'),

  HealthController: Symbol.for('HealthController'),
} as const;

export type Token = (typeof TOKENS)[keyof typeof TOKENS];
