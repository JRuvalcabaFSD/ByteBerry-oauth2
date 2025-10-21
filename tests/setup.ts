// jest.setup.js
global.console = {
  ...console,
  // Silencia los logs
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
