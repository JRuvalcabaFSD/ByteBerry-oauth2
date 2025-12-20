(() => {
	main().catch((error) => {
		console.error(error);
		process.exit(1);
	});
})();

async function main() {
	console.log('Aplicación corriendo');
}
