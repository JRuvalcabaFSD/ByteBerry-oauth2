import { ILogger } from '@/interfaces';
// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      /**
       * Unique request identifier for correlation
       * Generated using UUID service or extracted from headers
       */
      logger?: ILogger;
      startTime?: number;
      requestId?: string;
    }
  }
}

// This file needs to be included for module augmentation
export {};
