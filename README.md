# ByteBerry OAuth2

[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/JRuvalcabaFSD/ByteBerry-oauth2/ci-cd.yml?branch=main&logo=githubactions&logoColor=white&label=CI%2FCD&labelColor=blue)](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/actions/new)
[![GitHub Release](https://img.shields.io/github/v/release/JRuvalcabaFSD/ByteBerry-oauth2?display_name=release&logo=semanticrelease&logoColor=blue&label=Versi%C3%B3n)
]()
[![Node Version](https://img.shields.io/badge/dynamic/json?label=Node&query=$.engines.node&url=https://raw.githubusercontent.com/JRuvalcabaFSD/ByteBerry-oauth2/main/package.json&logo=node.js&logoColor=white&style=flat)](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2)
[![Docker Image Version](https://img.shields.io/docker/v/jruvalcabafsd/ByteBerry-oauth2?sort=semver&logo=docker&label=Image%20versi%C3%B3n)
]()
[![GitHub License](https://img.shields.io/github/license/JRuvalcabaFSD/ByteBerry-oauth2?label=License)](./LICENSE)


## Descripción
Servicio **OAuth2** del sistema ByteBerry. Implementa autenticación con OAuth2 (Authorization Code + PKCE, refresh tokens, logout y JWKS) siguiendo **Clean Architecture**, principios **SOLID** y **Dependency Injection Container**.  
Preparado con CI/CD, Docker multi-arch (ARM64/AMD64) y despliegue seguro en Raspberry Pi.

## Arquitectura
- **Carpetas principales**: config, interfaces, domain, application, infrastructure, presentation, shared, container.
- **Patrones**: Clean Architecture, SOLID, Repository, Adapter, DI Container.
- **Endpoints**:
  - `GET /health`
  - `POST /authorize`
  - `POST /token`
  - `POST /logout`
  - `GET /.well-known/jwks.json`
  - `GET /events` (admin)

## Requisitos
- Node.js 22+
- pnpm 10.15.1
- Docker con soporte multi-arch

## Scripts
```bash
pnpm install
pnpm build
pnpm start
pnpm test
```

## CI/CD
- **PR-CI**: lint, build, test, audit
- **Release-CI**: semantic-release, Docker multi-arch buildx, push a Docker Hub

## Contribución
Consulta el archivo [CONTRIBUTING.md](CONTRIBUTING.md).

## Licencia
Este proyecto está bajo la licencia MIT. Consulta [LICENSE](LICENSE).
