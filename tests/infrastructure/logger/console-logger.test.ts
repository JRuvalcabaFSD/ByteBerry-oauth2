import { ConsoleLogger } from '@/infrastructure';

describe('ConsoleLogger (stub mínimo)', () => {
  let spy: jest.SpyInstance;
  let spyWarn: jest.SpyInstance;
  let spyError: jest.SpyInstance;

  beforeEach(() => {
    spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    spyWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    spyError = jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());

  it('should respect the levels: it does not emit debug when Level = info', () => {
    const logger = new ConsoleLogger('info', { service: 'oauth2' });
    logger.debug('mensaje debug');

    expect(spy).not.toHaveBeenCalled();
  });
  it('should add bindings in child()', () => {
    const logger = new ConsoleLogger('debug', { service: 'oauth2' });
    const child = logger.child({ requestId: '1234' });
    child.info('mensaje info');

    expect(spy).toHaveBeenCalledWith(expect.stringContaining('"service":"oauth2"'));
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('"requestId":"1234"'));
  });
  it("should show 'error' and 'warn' level logs in console", () => {
    const logger = new ConsoleLogger('warn', { service: 'oauth2' });
    logger.error('mensaje error');
    logger.warn('mensaje warn');

    expect(spyError).toHaveBeenCalledWith(expect.stringContaining('"level":"error"'));
    expect(spyWarn).toHaveBeenCalledWith(expect.stringContaining('"level":"warn"'));
  });
});
