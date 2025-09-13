import { Clock, Logger } from '@/interfaces';

export class healthController {
  constructor(
    private readonly clock: Clock,
    private readonly logger: Logger,
    private readonly version: string,
    private readonly serviceName: string
  ) {}

  status() {
    const payload = {
      service: this.serviceName,
      status: 'ok',
      version: this.version,
      timestamp: this.clock.nowIso(),
    };
    this.logger.debug('Health check status', payload);
    return payload;
  }
}
