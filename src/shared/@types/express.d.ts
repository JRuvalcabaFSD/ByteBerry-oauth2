import { ILogger } from '@interfaces';

declare global {
	namespace Express {
		interface Request {
			logger?: ILogger;
			starTime?: number;
			requestId?: string;
		}
	}
}

export {};
