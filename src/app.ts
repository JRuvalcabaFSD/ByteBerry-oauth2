import { withLoggerContext } from '@shared';
import { bootstrapContainer } from './container/bootstrap.container.js';
import { handledServicesError } from './shared/errors/handled.services.error.js';

(() => {
	main().catch((error) => {
		handledServicesError(error);
		process.exit(1);
	});
})();

async function main() {
	const container = bootstrapContainer();

	const ctxLogger = withLoggerContext(container.resolve('Logger'), 'main');

	ctxLogger.info('Service initialized successfully');
}
