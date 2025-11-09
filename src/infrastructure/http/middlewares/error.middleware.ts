/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import { IConfig, ILogger } from '@/interfaces';
import { OAuth2Error, withLoggerContext } from '@/shared';

/**
 * Handles errors that occur during HTTP request processing.
 *
 * @param error - The error object thrown during request handling.
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param config - The application configuration object.
 */

type ErrorHandler = (error: Error, req: Request, res: Response, config: IConfig) => void;

/**
 * A map of error handler functions keyed by error type.
 *
 * Each handler is responsible for formatting and sending an appropriate HTTP response
 * based on the error type and context. The supported error types include:
 *
 * - `'oauth2'`: Handles OAuth2 errors, sets `WWW-Authenticate` header for 401 responses,
 *   and includes stack trace in development mode.
 * - `'bootstrap'`: Handles bootstrap initialization errors, returns a 500 status with context.
 * - `'container'`: Handles dependency injection container errors, returns a 500 status with token info.
 * - `'config'`: Handles configuration errors, returns a 500 status with context.
 * - `'cors'`: Handles CORS errors, returns a 403 status and hides error details in production.
 *
 * All handlers include a `requestId` and a timestamp in the response for traceability.
 */

const HANDLERS = new Map<string, ErrorHandler>([
  [
    'oauth',
    (error, req, res, config) => {
      const e = error as OAuth2Error;
      const requestId = req.requestId || 'unknown';
      if (e.statusCode === 401) res.setHeader('WWW-Authenticate', 'Bearer');
      res.status(e.statusCode).json({
        ...e.toJSON(),
        requestId,
        timestamp: new Date().toISOString(),
      });
    },
  ],
  [
    'bootstrap',
    (error, req, res, _config) => {
      const e = error as any;
      res.status(500).json({
        error: 'Bootstrap Failed',
        message: error.message,
        context: e.context,
        requestId: req.requestId || 'unknown',
        timestamp: new Date().toISOString(),
      });
    },
  ],

  [
    'container',
    (error, req, res, _config) => {
      const e = error as any;
      res.status(500).json({
        error: 'Container Error',
        message: error.message,
        token: e.token?.toString(),
        requestId: req.requestId || 'unknown',
        timestamp: new Date().toISOString(),
      });
    },
  ],

  [
    'config',
    (error, req, res, _config) => {
      const e = error as any;
      res.status(500).json({
        error: 'Configuration Error',
        message: error.message,
        context: e.context,
        requestId: req.requestId || 'unknown',
        timestamp: new Date().toISOString(),
      });
    },
  ],

  [
    'cors',
    (error, req, res, config) => {
      res.status(403).json({
        error: 'Forbidden',
        message: config.isDevelopment() ? error.message : 'Origin not allowed by CORS',
        requestId: req.requestId || 'unknown',
        timestamp: new Date().toISOString(),
      });
    },
  ],
]);

/**
 * Creates an Express error-handling middleware that logs errors and sends a standardized error response.
 *
 * The middleware logs error details using the provided logger, including request information and stack trace.
 * It selects a custom error handler based on the error type if available, otherwise falls back to a default handler.
 * In development mode, the error message is included in the response; otherwise, a generic message is sent.
 *
 * @param logger - An instance implementing the ILogger interface for logging error details.
 * @param config - An instance implementing the IConfig interface to determine environment settings.
 * @returns An Express-compatible error-handling middleware function.
 */

export function createErrorMiddleware(logger: ILogger, config: IConfig) {
  const ctxLogger = withLoggerContext(logger, 'createErrorMiddleware');

  console.log('Debug');

  const defaultHandler: ErrorHandler = (error, req, res) => {
    const requestId = req.requestId || 'unknown';
    res.status(500).json({
      error: 'Internal Server Error',
      message: config.isDevelopment() ? error.message : 'Something went wrong',
      requestId,
      timestamp: new Date().toISOString(),
    });
  };

  return (error: Error, req: Request, res: Response, _next: NextFunction): void => {
    const requestId = req.requestId || 'unknown';
    const err = error as any;

    ctxLogger.error(`${error.name} error in request`, {
      requestId,
      error: error.message,
      stack: error.stack === '' ? undefined : error.stack,
      method: req.method,
      url: req.originalUrl || req.url,
    });

    const handler = (err.errorType && HANDLERS.get(err.errorType)) || defaultHandler;

    handler(error, req, res, config);
  };
}
