import { bootstrap } from '@bootstrap';
import { handledServicesError, withLoggerContext } from '@shared';

import dotenv from 'dotenv';

(() => {
	main().catch((error) => {
		handledServicesError(error);
		process.exit(1);
	});
})();

async function main() {
	dotenv.config({ override: false });
	const { container } = await bootstrap();

	const ctxLogger = withLoggerContext(container.resolve('Logger'), 'main');
	const { serviceUrl, port } = container.resolve('Config');

	ctxLogger.info(`service available in the url: ${serviceUrl}:${port}`);
}
