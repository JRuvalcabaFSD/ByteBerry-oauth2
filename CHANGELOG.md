# 1.0.0 (2025-11-01)


### Bug Fixes

* ajustar activación del flujo de trabajo para despliegue en push y construcción en PRs ([b303bb4](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/b303bb42ee9205911f94abbc4d64bedefcb4b1e0))
* **CI:** change path for GitHub Actions workflows ([dbfff61](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/dbfff61a00f2d37021cb851ca7bb15570b659171))
* corregir caché de instalación de Node.js a pnpm en el flujo de trabajo de documentación ([a2260b5](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/a2260b577da8a2cf3b1d7a45c03a229ea9d0f4df))
* **docs:** actualizar comando de generación de documentación a TypeDoc ([ba86755](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/ba86755366212418f13e4911685857d5ebd45da3))
* eliminar activación del flujo de trabajo en push para ramas 'main' y 'develop' ([100ab38](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/100ab3827bd1fcad7a10b234a2fe7789a6574988))
* eliminar configuración de instalación de pnpm y usar npm para la instalación global ([ac0f082](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/ac0f0828e68944fdcefbd89eea130251855d2a33))
* eliminar la sobrecarga de vue-template-compiler en pnpm-lock.yaml ([4603158](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/4603158f1fcab2600e62fed59c4f2ab8453b6f43))
* update package overrides for pug and vue-template-compiler ([367a0d9](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/367a0d9a76f1e521e83a14fd513bdf0d36173c3d))


### Features

* agregar verificación de instalación de pnpm en el flujo de trabajo de documentación ([52e2242](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/52e2242bcb4a87b299a2b54a307091bd9931c7c6))
* **bootstrap:** Implement application bootstrap process with dependency injection and graceful shutdown ([354995f](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/354995f2a751dcc295956a7eff1b625fc1f7adac))
* **ci:** add CI configuration for the launch workflow and improve quality validation in the test script ([991dc7b](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/991dc7bc3ce6f4c0246a139d865b053ee2df0052)), closes [#12](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/issues/12) [#13](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/issues/13)
* **ci:** add CI workflow for PRs ([18766cd](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/18766cd17c4a9026aee017e01d1777d1483fbf5e)), closes [#11](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/issues/11)
* **config:** implement configuration management with environment variables and error handling ([e814b92](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/e814b92195ff24df03c897a75301d49a711fdd38))
* **config:** update version initialization to use fallback value and add comprehensive tests for configuration management ([3ef18dc](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/3ef18dcfb1d27bd381cfe42e42414ec647a7f1ff)), closes [#4](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/issues/4)
* **container:** implement dependency injection container with service registration and resolution ([c3a553d](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/c3a553ddd23b455bb273d8498bc2f02e27ee65c6))
* **controllers:** implement health controller and health routes to verify service status ([b252827](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/b2528273c1c0bc2a8a0c16e6c6b501a0f2e6a51c)), closes [#T008](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/issues/T008)
* create Clean Architecture structure ([2b446a2](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/2b446a264e965f5dec98f5434bfafe345082c584))
* **docker:** add Docker configuration files and test scripts for the OAuth2 service ([8ecda3e](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/8ecda3ed2b1845a9ab3b40c930815ece21a250d9)), closes [#9](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/issues/9)
* **docs:** add comprehensive README for ByteBerry OAuth2 Service with features, architecture, installation, and usage instructions ([8d309c1](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/8d309c1187d12bbdfe5318a50d5310f1f715ee8e))
* Implement HTTP server and graceful shutdown functionality ([812bdb8](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/812bdb83bac74f703448f16e23c878612bec12e4)), closes [#T006](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/issues/T006)
* initialize project structure with TypeScript configuration, basic logging, and test setup ([ee1d0da](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/ee1d0dae155da5beb0a65625a758f12b995f3168)), closes [#1](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/issues/1)
* **logger:** Add WinstonLoggerService and unit tests for containerProxy, logger decorators ([5769c59](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/5769c59a25a6112e608ce1052a14046cc24d3c56)), closes [#7](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/issues/7)
* **tests:** add comprehensive tests for container and bootstrap functionality ([0a22585](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/0a225855df79ef1a40eaf38784845ca82d9dc108)), closes [#5](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/issues/5)
* **tests:** agregar pruebas de integración y unidad para HealthController y rutas de salud ([ac779dd](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/ac779dd94734425c7fd90367dfdc17d5a5833d27)), closes [#8](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/issues/8)
* update pnpm workspace to include core-js as a built dependency ([68af6c3](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/68af6c338289360a36dea966c9b7b2f81f04b74d))
