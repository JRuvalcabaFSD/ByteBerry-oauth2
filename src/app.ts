import { bootstrap } from '@bootstrap';
import { handledServicesError } from '@shared';

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

	const server = container.resolve('HttpServer');

	console.log(`App ruining, HttpServer ruining in port: ${server.getServeInfo().port}`);
}
