# [1.1.0](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/compare/v1.0.0...v1.1.0) (2025-12-12)


### Bug Fixes

*  change version variable in update script ([22c1ca7](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/22c1ca703a0eb3a33e9d8e19d56ea41f0b9afe6e))
* **ci:** set NODE_ENV to development for AMD64 image testing ([de757dc](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/de757dcdf793b680c87711d44c9175f6c2134dd6))
* rename all files for clean architecture ([5f1841e](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/5f1841eafe37a8375e1f126b8527ec1ea0148fb1))
* update settings to exclude coverage and logs, remove sourcemaps in production build ([be3815f](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/be3815fea42fb86e9690a42dd89d414bbb577488))
* update the Docker build script and version injection in package.json ([b7d0032](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/b7d00327474a2162a105446c43b64e8245bcd188))


### Features

* add RsaKeyLoaderService for managing RSA keys and update JWT service to use it ([c4b9464](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/c4b94641e722a82bf39a0a9625774fee95916e2b)), closes [#T059](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/issues/T059) [#16](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/issues/16)
* **health:** add JWKS health check and response interface ([84427a2](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/84427a264ea2eea95275edeec3fc276865953547)), closes [#T066](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/issues/T066) [#20](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/issues/20)
* implement JWKS retrieval functionality with JwksService and GetJwksUseCase ([b6bde41](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/b6bde418476d31a1e283c14811173d47fd012925)), closes [#T060](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/issues/T060) [#17](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/issues/17)
* Implement OAuth2 Authorization Code Flow with PKCE ([8a8eecd](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/8a8eecdb1782aa448db136702478f9e6713fde10)), closes [#T057](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/issues/T057)
* Implement OAuth2 Token Exchange Flow with PKCE Verification ([48a7e5b](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/48a7e5b26b9edb3c7803d8f50ae3ac60bea7987b)), closes [#T059](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/issues/T059) [#14](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/issues/14)
* **tests:** add comprehensive unit tests for error handling and hashing services ([be35f83](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/be35f83f401007fa0bc4869046788ced0f0c3a04)), closes [#T062](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/issues/T062) [#19](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/issues/19)
* **tests:** add step to generate JWT test keys in CI workflow ([565b5b1](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/565b5b13575f7773e4be39c26fb1982a9751aeb6))
* **tests:** add step to generate JWT test keys in CI workflow ([71488c3](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/71488c3834d06bab23e6917a506a120a5a55bfe7))
* **tests:** enhance CI workflow to run unit and integration tests separately with coverage ([d5f4de9](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/d5f4de9c58bca25325dd9dde7822090e8f2f7509))
* **tests:** update CI workflow to run all tests in a single step ([07abd92](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/07abd9260fe60e4c8631f3190910987c0a0127d1))
* update Dockerfile and scripts for improved key management and entry point configuration ([2949f10](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/commit/2949f10d8ac5092c17ba2de51e9ec5de63746b5f))

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
