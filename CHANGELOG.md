# 1.0.0 (2025-12-06)


### Bug Fixes

* improve SSH authentication and pnpm configuration in the CI workflow ([cf1163f](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/cf1163f8f090ccf8f566d161d3b33a346800b5cc))
* reorder pnpm configuration steps in the CI workflow ([a21cccb](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/a21cccb1bc33e52fce5ec8e820ef8a0616fd1ae3))
* reorder pnpm settings in the CI workflow ([d4e4131](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/d4e4131aeba46f8936b287648e8ff14ca03ea68b))
* update CI workflow to use GitHub App token for authentication and remove SSH-related steps ([3f864ef](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/3f864ef4bc3d72052c6807cfffed9978fa5ee152))


### Features

* add GitHub Actions workflow for PR CI pipeline ([49baeb5](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/49baeb5254cef0060969de2a07d608f0af008755)), closes [#T011](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/issues/T011) [#12](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/issues/12)
* add Node.js and pnpm configuration to CI workflow ([a0e6cf7](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/a0e6cf7e474ef379e278ad83d4966bab8ae62d5d))
* add typedoc-plugin-markdown and update eslint config; improve UUID interface documentation and export HasResolve type ([e032345](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/e03234558a9512bec48e7e5c92659c587b9b5851))
* agregar flujo de trabajo de CI para la publicación y sincronización de ramas ([4546e00](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/4546e003609e2f392351e0fbf338d951f1adbe5b)), closes [#T012](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/issues/T012) [#13](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/issues/13)
* agregar flujo de trabajo para sincronizar develop con main ([7ff659d](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/7ff659db096fbfa41c64f97084833d555f0f8eb3))
* comentar paso de copia de archivo de entorno en el flujo de trabajo de CI ([6c9d49b](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/6c9d49b85b9a341785a87de011b3566f7fef063c))
* comment out Prisma Client generation step in CI workflow and adjust build verification steps ([4a378e9](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/4a378e933f66160aa3e05d24dafbc4a2d61d3de0))
* **container:** implement dependency injection container with service registration and resolution ([db225cf](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/db225cfd41ef85e393e9b747c147f422783632ec)), closes [#T005](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/issues/T005) [#6](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/issues/6)
* **docker:** add multi-arch Docker build support and health check script ([d422bf9](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/d422bf919913907d2a31244f826aa848d3e3fee3)), closes [#T09](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/issues/T09) [#10](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/issues/10)
* **envs:** enhance configuration management and logging ([c481896](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/c4818961d638e6b74ce973f8001f7423a122eca5)), closes [#T004](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/issues/T004) [#5](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/issues/5)
* **errors:** enhance error handling by introducing AppError and updating error classes ([41d9c11](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/41d9c11bb839f358d2ad77529a81b44515621c80))
* **errors:** improve error logging to include stack trace conditionally based on NODE_ENV ([3a1c46f](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/3a1c46fbd01281239d895bc59afa11d44c1d4e78))
* implement custom HTTP server with CORS support ([fc453ae](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/fc453ae8862d5d8b82896e019d4ab56bf8c9ad93))
* improve SSH authentication and debugging in CI workflow ([0eba0a6](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/0eba0a6b7e705f4cfa49af725ecd451bb3de27a3))
* **logger:** implement ClockService, WinstonLoggerService, container proxy, and logger decorators ([ac094df](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/ac094df010f3cf8aeed86527a34837163015f808)), closes [#T007](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/issues/T007) [#8](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/issues/8)
* **logging:** invert loggerRequests condition in middleware and update related tests ([33412a4](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/33412a4ff2ba5d31db6386c4f34bd726df7e2681))
* **routes:** implement endpoint GET /health ([b80a994](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/b80a994bd803b5fc87a642b5af25264fca17055b)), closes [#T008](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/issues/T008) [#9](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/issues/9)
* **shutdown:** implement GracefulShutdown service for managing application shutdown processes ([2fca744](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/2fca744b9cd8d52c6bb25c1b18af2ffea2d53285)), closes [#T006](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/issues/T006) [#7](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/issues/7)
* **template:** add pull request template with detailed checklist and guidelines ([108cf9b](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/108cf9ba387c7340b743c9069a6291ad6f7b8b01))
* **tests:** add integration tests for health endpoint and bootstrap process ([b383acf](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/b383acf74f9fabd3e7c629a2b138eb555df5d371)), closes [#T010](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/issues/T010) [#11](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/issues/11)
