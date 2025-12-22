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
