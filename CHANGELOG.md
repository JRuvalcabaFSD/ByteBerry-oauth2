# [1.3.0](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/compare/v1.2.0...v1.3.0) (2025-11-29)


### Bug Fixes

* actualizar comando de prueba unitaria en el flujo de trabajo de CI ([ac1a321](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/ac1a321069c481196ec1ab68c5c0c28971fde93d))
* actualizar DATABASE_URL en el flujo de trabajo de CI para pruebas ([e9f9153](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/e9f915383f9dddf1f8736e115b682a7376e120e5))
* actualizar DATABASE_URL en las migraciones de Prisma para usar la base de datos de prueba ([4f03fad](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/4f03fad3c12dbd1a3c52bb6c583f328dcab072d4))
* actualizar flujo de trabajo de CI para usar Node.js 22.22.1 y mejorar la verificación de PostgreSQL ([4ef7460](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/4ef7460c9491298693c313d11581f9ab489c065d))
* actualizar NODE_VERSION a 22.21.1 y modificar el comando de prueba en el flujo de trabajo de CI ([d76d0a0](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/d76d0a01ba52e06949377ef98ea446549e486d84))
* actualizar variable DATABASE_URL a 'ignore' en el flujo de trabajo de CI ([59f9260](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/59f9260e1b83ff77c700e5d0fb8d45cdac4aada5))
* actualizar versión de Node.js y eliminar variable de entorno redundante en el flujo de trabajo de CI ([299166b](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/299166b31fc62ef31c96827b33d7c6751b1d9604))
* corregir comillas en NODE_VERSION y caché de pnpm, y establecer DATABASE_URL a 'ignore' en las migraciones de Prisma ([acda192](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/acda192ab709b99468cc4217a550e575bde259df))
* corregir error de sintaxis en el flujo de trabajo de CI para la planificación de la próxima versión ([93b6dbb](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/93b6dbbf10ff7ac60e050009263ad136168d92c4))
* instalar openssl en la etapa de generación del cliente Prisma ([7959518](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/79595180e9c8fbd7646a20e6e140530540b80905))
* **logger:** preserve sync/async behavior in LogContextMethod ([9d1de11](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/9d1de11d99ab1846fa8e689b1dfddafb615424d9))
* **prisma:**  Prisma configuration and Dockerfile for environment variable handling ([4a5e958](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/4a5e9584b43724f57e5ed97925ce67672a22647a))
* revert NODE_VERSION a 22.21.1 y eliminar pasos de espera y migración de PostgreSQL en el script de entrada ([9d2fe52](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/9d2fe52a0381a850216d4151616f56236aee6539))
* revert Node.js version to 22.21.1 in CI workflow ([5283697](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/528369727e3c6a1db2ac65aac2495f909298fd1b))
* **test:** fix text for code changes. ([2d9f56b](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/2d9f56b68a37aa7c2a0e876a17ad433ff57de8b6))
* update entry point check in CI workflow to reflect new file path ([c523498](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/c523498cfba2375e824540ddbbc9c022c2c71dc3))


### Features

* add step to generate Prisma Client in CI workflow ([6df11b3](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/6df11b3794b768598bcba702658e7f69216d1f36))
* add user and client management use cases and DTOs ([f4e6d37](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/f4e6d37a869f98dc44df54152a137d482400ede8)), closes [#T085](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/issues/T085) [#33](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/issues/33)
* agregar pasos para subir artefactos de construcción y planificar la próxima versión en el flujo de trabajo de CI ([87096d5](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/87096d5ffc570db6e6a980b714fe421afb3149b1))
* **database:** implement database integration and refactor authorization code management ([344ee38](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/344ee38736e2c3d3f4975d948accab0c6182065f)), closes [#30](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/issues/30)
* Implement database health checker service and interface ([19630bd](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/19630bd66f589f71594c1b828c664f1d2a83775c)), closes [#T087](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/issues/T087) [#35](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/issues/35)
* integrate Prisma ORM and PostgreSQL for database management ([f54f423](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/f54f423b24ead6ba04f768325170fc2a77df1baa))
* Refactor OAuth2 implementation with user and token management ([2ca7bb2](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/2ca7bb204493e6ea9dae65d7906772c1faa3e5ba)), closes [#T084](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/issues/T084) [#32](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/issues/32)
* **shutdown:** add database disconnection during graceful shutdown ([333b150](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/333b1505f2e3c66a126ba3a12ada1262f9c0b939))
* **tests:** implement integration tests for authorization code and user repositories ([4e06298](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/4e06298fc2525d6b098f07bb26fd47d2b33386d1)), closes [#T084](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/issues/T084) [#34](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/issues/34)
* update Dockerfile, package.json, and pnpm configurations; add prisma copy script and adjust entry point ([3f3548f](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/3f3548f5e12f15b18e26e1ef4d272d1808d1f46d))
* update PR CI workflow to improve formatting and add Prisma client generation step ([ed63d55](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/ed63d55c46e191f1f16941814c31891f5fe8e579))

# [1.2.0](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/compare/v1.1.0...v1.2.0) (2025-11-16)


### Features

* **jwt:** update JwtService constructor to include issuer, audience, and expiration ([6254e3f](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/6254e3f23e3b8f725e98f24a71c9ab83820d4225))

# [1.1.0](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/compare/v1.0.0...v1.1.0) (2025-11-11)


### Bug Fixes

* corregir formato y duplicados en la sección de configuración del README.md ([d3fe5bd](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/d3fe5bd54489f679319cb6a3077faab72abd09b6))


### Features

* **auth:** enhance OAuth2 flow with PKCE validation ([8245744](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/8245744386285a31b0568a42c383192e90fee96b))
* **container:** add JwtService and KeyProvider to DI container ([578d1c4](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/578d1c48e2adae613b549e1c9171e5d532ae6e57))
* **docker:** add entrypoint script for JWT key management ([b215ae3](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/b215ae3992631b8bb41236b8bb7f8b4e128c08a9)), closes [#25](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/issues/25) [#26](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/issues/26) [#27](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/issues/27)
* Implement OAuth 2.0 Authorization Code Flow with PKCE ([60a794d](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/60a794d0f935505eda995865f10b9b109347c37f))
* **jwks:** implement JWKS retrieval and service ([2c8de54](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/2c8de5472cbdbdb5b5bd26aeef64f143e176a197)), closes [#22](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/issues/22) [#23](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/issues/23)
* **jwt:** Add JWT authentication support with key management ([6d37e1a](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/6d37e1a0f63b08aa180054304566708b9cae6c8a)), closes [#21](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/issues/21)
* **pkce:** implement PKCE verification service and scripts ([fff3910](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/fff391034e234a805392cbbb6ab0c2897d828a0c))
* **tests:** add unit tests for OAuth2 components ([9b39d8f](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/9b39d8fa6eff4c7c957f24d8536c44b14a9aca88)), closes [#19](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/issues/19) [#20](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/issues/20)
* **tests:** enhance unit tests for CORS, error handling, JWKS, and JWT services ([576cd1b](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/576cd1bddaa86078a03457f4e96482a82598ddbc)), closes [#24](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/issues/24)

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
