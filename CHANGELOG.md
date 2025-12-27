# [1.1.0](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/compare/v1.0.0...v1.1.0) (2025-12-26)


### Bug Fixes

* **auth:** status validation and fix typo in grantType ([180fa47](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/180fa476063fe77933d0f30d403c9493a68d1597))
* **refactor:** remove unused LoginController reference in app.ts ([f0c7b0a](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/f0c7b0a35ebb9ca1cafa6987530515b4866f5d56))
* **scripts:** correct script name in CI configuration and update quality check command ([8482066](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/84820668097a08c89a4276fb7b7a22ee22bc9056))


### Features

* agregar archivos de configuración y rutas para la funcionalidad de inicio de sesión ([d6e0d1c](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/d6e0d1ccf2388146752395ebd58f3817ba4d98e6))
* **auth:** agregar interfaz para el caso de uso de inicio de sesión de usuario ([b72fc57](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/b72fc5755113e00ccb72001e6e5433fbfa89810b))
* **auth:** eliminar controlador de inicio de sesión y simplificar registro de controladores ([1359b07](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/1359b0768647a5671a024e3a6b89cb8b5f1b6457))
* **auth:** implement in-memory repository and entity for OAuth2 authorization codes ([3089b1a](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/3089b1a0d61a9905ab591bd8adb9e84468cd380d)), closes [#9](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/issues/9)
* **auth:** implement login request and response DTOs, use case, and controller ([72263e2](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/72263e22839ac6f695677b3afcbe3cda97f56995))
* **auth:** implement OAuth2 authorization code flow ([1164363](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/1164363d79522394d7848e25a60e933f4ab1b1ba)), closes [#11](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/issues/11)
* **auth:** implementar funcionalidad de inicio de sesión y mejorar validaciones ([baf98aa](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/baf98aa6ff781d31e1b0716a8977451f37827172))
* **build:** actualizar scripts de construcción y agregar dependencias necesarias ([4963e59](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/4963e59481f1471bd61df5c732a4bc0a1d7583df))
* **ci:** generate JWT test keys in IC working fluids ([9a7dbdb](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/9a7dbdba6bf254de4791946a8d759cc4411cc4f2))
* **config:** enable silent mode in Vitest configuration ([c5c61b3](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/c5c61b33105b156381b8a18d5b4153cd4ce122dc))
* **health:** implementar verificación de disponibilidad de JWKS en el servicio de salud ([539b374](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/539b374007c3c18cbab9b565c4d835f3f628b782))
* Implement login functionality with session management ([cb851ab](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/cb851abb212ac991139b602aa9067a95a69ad68c))
* Implement OAuth2 token exchange flow with PKCE verification ([e190e17](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/e190e171a72b6e494e159180d2254a394420f2b2)), closes [#12](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/issues/12)
* **jwks:** implementar servicio, controlador y casos de uso para JWKS ([cb518a4](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/cb518a467519a918b45c962c1082249adad8e1b7)), closes [#13](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/issues/13)
* **session:** implement session management with in-memory repository and entity ([3ba4adb](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/3ba4adbe3afc67e123670e1125abd5175bcb080d))
* **test:** add unit tests for various DTOs, services, and use cases ([0f665f9](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/0f665f9a68a5f52d3d1900226eb8d385a303927c))
* **test:** improve drive testing for TokenController and ExchangeTokenUseCase ([e8ca94e](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/e8ca94e4fc1897a170913c762a025407b4bb8d8b))
* **user:** implement user repository and entity with in-memory storage ([7a0a8c3](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/7a0a8c307c0ffaa194d4c3d5dc2e697ed3eaae5e))

# 1.0.0 (2025-12-22)


### Features

* Add gitignore and editor config ([0cedefb](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/0cedefb55a54e8dcbba1016b53c08aa048741228))
* **ci:** Add PR-CI workflow for automated setup, quality checks, builds, tests, and security audits ([e026cd2](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/e026cd26def215fb749ebd40b068c19aa585fd81)), closes [#6](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/issues/6)
* **ci:** add release CI workflow for automated versioning, Docker builds, and synchronization with develop branch ([ecf266d](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/ecf266d83631b2ba96621532caed36d8fcd7b089)), closes [#7](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/issues/7)
* **ci:** update test command to use unit tests and add note for DB-dependent tests ([32fff37](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/32fff373baf54c987fe0514a1739b225af973b55))
* **container:** implement dependency injection container with service registration and resolution ([1b77fe4](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/1b77fe46a2b35389d93fef4bbe259ebe68e91e3e)), closes [#2](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/issues/2)
* Create clean architecture structure ([3cca1fa](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/3cca1fa88c58222cb2c32c94d35af5a58db13b60))
* **deps:** update 'tmp' package version in lockfiles to ensure compatibility ([85cd412](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/85cd4123f052dac3a863e55a648701902ef74881))
* **docker:** add Dockerfile and multi-arch build script; implement health check and version update scripts ([a8d761b](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/a8d761b38b84977229a8318a7e4e74b7a1964d92)), closes [#4](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/issues/4)
* **error:** add custom error handling middleware and integrate it into the HTTP server ([15f5f5b](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/15f5f5b05c9a81815d7181884cd882438661a48a))
* **errors:** simplify stack capture in container error classes ([9f62081](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/9f6208151cff621326fd57f45be20518e797804d))
* **health:** implement health check service and routes ([3ca63d4](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/3ca63d484270c5c239535b74d45d66eea7cc689b)), closes [#3](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/issues/3)
* Implement configuration management and error handling ([12aa7a4](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/12aa7a45382d20ca693130a936a9f4b987c00a6e))
* initialize project structure with TypeScript and Vitest configuration ([851d658](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/851d6582ad48f3d0645d0b21d9f2ca107c7b162b)), closes [#1](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/issues/1)
* **logging:** add Winston logger service and logger middleware ([059fcdf](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/059fcdf2f9da73ac1416b77555bf790b7fc60343))
* **test:** Add unit tests for middlewares, services, and routes; remove unused test file ([66e7cef](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/66e7cef7ea38341eb447343c07b8a47b91cf07dd)), closes [#5](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/issues/5)
