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

	const config = container.resolve('Config');

	// eslint-disable-next-line no-console
	console.log({ config });
}
