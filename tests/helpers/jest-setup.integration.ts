/**
 * Jest Setup para Integration Tests
 *
 * Se ejecuta ANTES de cada archivo de tests de integración.
 * Configura el ambiente para cada suite de tests.
 *
 * @module helpers/jest-setup.integration
 */

// Aumentar timeout para integration tests (DB puede ser lenta)
jest.setTimeout(30000); // 30 segundos

// Configurar NODE_ENV
process.env.NODE_ENV = 'test';

// Silenciar logs de Winston durante tests (opcional)
// Si quieres ver logs, comenta estas líneas
process.env.LOG_LEVEL = 'error';

// Mock para console.log/warn/error durante tests (opcional)
// Descomenta si quieres output más limpio
/*
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  // error: jest.fn(), // Mantener errors visibles
};
*/

// Handler global para unhandled rejections
process.on('unhandledRejection', (reason, _promise) => {
  console.error('Unhandled Rejection in test:', reason);
  throw reason;
});
