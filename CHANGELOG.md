# [1.3.0](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/compare/v1.2.0...v1.3.0) (2025-10-06)


### Features

* **ci:** update package.json version during build ([549cee6](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/549cee61febd517e23c59950200b1a7017eb97ad))

# [1.2.0](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/compare/v1.1.0...v1.2.0) (2025-10-06)


### Features

* **ci:** add release type input and enhance logging ([acc6da1](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/acc6da11de6d9a276a9eb7455dbeeed12e42be63))

# [1.1.0](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/compare/v1.0.1...v1.1.0) (2025-10-06)


### Features

* **ci:** add pnpm setup and install step ([c5b9c09](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/c5b9c09f7e13e21bf0dbba08019cd84511a2b8c2))
* **ci:** add semantic release version planning step ([1b8e621](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/1b8e62161017fe783b752cbc9f4020d63b0b6386))
* **ci:** change registry from ghcr.io to docker.io ([ab097e1](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/ab097e11790498d31e61d10f6a740be529f542ef))
* **ci:** clean up job conditions in release workflow ([e0652f2](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/e0652f20e21adad8940fb137af2d0123e1be77eb))
* **ci:** enhance Docker workflow with multi-arch support ([314c6b7](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/314c6b7cbc90d6e9178d7b7e34905eb6c5a79e50))
* **ci:** enhance validation and improve release checks ([9a51949](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/9a51949bcf1d73c47dcfef2a3002e0d80989da09))
* **ci:** force create image ([2fb1008](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/2fb10089aa399ecea00803edbda45ebc559df29b))
* **ci:** remove PNPM_VERSION from CI workflows ([339eed2](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/339eed28b4442b6b4ecb8573f96bd9c84727c2e3))
* **ci:** simplify release workflow and improve validation ([e338855](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/e338855662149f396fbf6dab8857b4bbe4798a69))
* **ci:** update image name configuration in CI workflow ([b0af465](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/b0af465347ec0a2665b6f5136ede0ad185013abb))
* **ci:** update image name in release CI workflow ([17a36a7](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/17a36a7df039d08e64eadec909abcd03e9f35313))
* **pnpm:** remove pnpm-workspace.yaml file and its configuration for built dependencies ([dbac0f0](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/dbac0f00815342beb0056a9d87a5a92953b7bc21))
* **release:** add JRM signature at the end of the file ([ff6d145](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/ff6d1458b49fedef6acb98b5c07c39b1c37407ac))

## [1.0.1](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/compare/v1.0.0...v1.0.1) (2025-10-02)


### Bug Fixes

* **ci:** correct CORS_ORIGINS syntax and enhance test steps ([fb05517](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/fb05517907c76984f2b1a2aa7089c2ad78f4c4dc))
* **ci:** improve environment variable handling in workflows ([ebf2ea9](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/ebf2ea989d1c0d07f06b9f5e3399131c19f79648))
* **ci:** streamline test steps and update coverage command ([ba9517b](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/ba9517bd04a619eba3076c8d10edb2d042bc60b0))
* **ci:** update CORS_ORIGINS to use secrets ([cada933](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/cada93373bfa8bfedef87f0b9a9a58a548938bd0))

# 1.0.0 (2025-10-02)


### Bug Fixes

* **health:** improve error handling and response structure ([dfa7292](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/dfa72927a020386559ff48ef135f50c1f606d8c8))
* **http:** correct CORS middleware name and improve error handling ([8d7c759](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/8d7c75980e3112fb248637edf880106f9b996910))


### Features

* **bootstrap:** implement graceful shutdown and error handling ([7bca88e](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/7bca88e987466945abb5d196d12ac5ef22d27d70))
* **ci:** add CORS_ORIGINS environment variable for tests ([4b6099b](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/4b6099b4ed7863c348ce328429e3dc8ab0299439))
* **ci:** add environment variables for full validation ([40e138d](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/40e138d1bd8e7bc00d611fa790cf933c7a723509))
* **config:** add environment configuration and error handling ([4e224c7](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/4e224c773ff73a1a7fccccb4a2ac91ca39aed220))
* **config:** improve environment variable handling and error reporting and implement tests ([fa226af](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/fa226af62ebddf8911f9073b145495b62584b9aa)), closes [#4](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/issues/4)
* **container:** add Winston logger service factory ([10812ae](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/10812ae29919f6bbfcf239fe8fae4dbf7875393b))
* **container:** implement dependency injection container and services ([409d34c](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/409d34c99fe154377d8d02d3a4a41fb9ff439d75))
* create clean architecture directory structure ([484c680](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/484c680cd8b8e4a87dc735bc147cb4c4d22b60e4)), closes [#2](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/issues/2) [#3](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/issues/3)
* **docker:** add Docker support with build and test scripts ([f2b8243](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/f2b82433374797fb039153066b36fcfb22518f63))
* **docs:** add contributing guidelines and code of conduct ([12951dc](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/12951dc97277728c474f13ac3a66876f51fa7a41))
* **document:** remove extraneous text from README ([6384c65](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/6384c65aacd38f38e191acf03bf0ecd1e1add515))
* **health:** implement health check controller and routes ([7252382](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/7252382e1d54ceaf1828903fb587d03160501a02))
* Implement HTTP server with middleware and routing ([12f2b16](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/12f2b16435cdf17c7d4214243fca64ef4be786f3))
* initialize project with TypeScript configuration, basic app structure, and smoke test ([740d3f4](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/740d3f492a9a600913e1b2a674b8e759fb9d91e0)), closes [#1](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/issues/1)
* **logging:** integrate Winston logger for structured logging ([f08a6fb](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/f08a6fb7a4eaacb53db421491a9409f9ce2272b1))
* **release:** add semantic release configuration ([31349b6](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/31349b62203f53dfef7e1b234ecc8ce976b238a9))
* **tests:** add integration tests for bootstrap and graceful shutdown ([ba726dd](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/ba726ddea763d30025de9d9fa4da614dca789910)), closes [#6](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/issues/6) [#7](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/issues/7)
* **tests:** add integration tests for HealthController ([d4ce6d1](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/d4ce6d10135c84c4e5ae9a7cabc64de2abb85ef4)), closes [#8](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/issues/8)
* **tests:** add unit tests for container and services ([52c4423](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/52c4423ab95bc546a3317e22f2919b9a86862710)), closes [#5](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/issues/5)
* **tests:** add unit tests for CORS and error handling middlewares ([80cbd42](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/80cbd429aef31ac357dccad276bdc3f4284714e2))
* **tests:** add unit tests for WinstonLoggerService ([2e9a2f5](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/2e9a2f56c8227517bd14998cc84992be3980f643))
* **tests:** register health controller in factories tests ([d69a3bd](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/d69a3bd9e6f62d40cd363354f1a41884c6a4aaf1))
* update README with author name ([03aa364](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/commit/03aa3649846be1474b4e77217628c078d5a42612))
