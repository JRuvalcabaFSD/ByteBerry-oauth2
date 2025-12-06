import { handledServicesError, withLoggerContext } from '@shared';
import { bootstrap } from '@bootstrap';

(() => {
	main().catch((error) => {
		handledServicesError(error);
		process.exit(1);
	});
})();

async function main() {
	const { container } = await bootstrap();

	const ctxLogger = withLoggerContext(container.resolve('Logger'), 'main');

	ctxLogger.info('Service initialized successfully');
}
