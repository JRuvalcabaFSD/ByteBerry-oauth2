import dotenv from 'dotenv';

import { Config } from '@container';
import { handledServicesError } from './shared/errors/handled-services.errors.js';

(() => {
	main().catch((error) => {
		handledServicesError(error);
		process.exit(1);
	});
})();

async function main() {
	dotenv.config({ override: false });

	const config = new Config();
	console.log({ config });
}
