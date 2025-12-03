import { Config } from '@config';

(async () => {
	main();
})();

async function main() {
	const config = new Config();
	console.log(config);
}
