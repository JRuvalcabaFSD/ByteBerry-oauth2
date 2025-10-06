# 🔐 ByteBerry OAuth2 Service

[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/JRuvalcabaFSD/ByteBerry-oauth2/pr-ci.yml?logo=jest&label=Quality%20%26%20Test)](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/actions/workflows/pr-ci.yml)
[![Node Engine](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2FJRuvalcabaFSD%2FByteBerry-oauth2%2Fmain%2Fpackage.json&query=%24.engines.node&label=Node&logo=node.js&logoColor=white&color=339933)](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/blob/main/package.json)
[![GitHub Release](https://img.shields.io/github/v/release/JRuvalcabaFSD/ByteBerry-oauth2?sort=semver&display_name=release&logo=semanticrelease&logoColor=white&label=Version)](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/releases)
[![Docker Image Version](https://img.shields.io/docker/v/jruvalcabafsd/byteberry-oauth2?logo=docker&logoColor=white&label=Image%20version)](https://hub.docker.com/r/jruvalcabafsd/byteberry-oauth2)
[![GitHub License](https://img.shields.io/github/license/JRuvalcabaFSD/ByteBerry-oauth2?cacheSeconds=60)](./LICENSE)

Servidor OAuth2 con Authorization Code + PKCE, JWT RS256, refresh tokens y JWKS. Implementa Clean Architecture con TypeScript, PostgreSQL y Docker multi-arch para Raspberry Pi 5.

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [Docker](#-docker)
- [CI/CD](#-cicd)
- [Testing](#-testing)
- [API Documentation](#-api-documentation)
- [Desarrollo](#-desarrollo)
- [Contribución](#-contribución)
- [Licencia](#-licencia)

---

## ✨ Características

- 🔐 **OAuth2 Authorization Code + PKCE**: Implementación completa del flujo OAuth2 con protección PKCE
- 🔑 **JWT RS256**: Tokens JWT firmados con algoritmo RS256
- 🔄 **Refresh Tokens**: Soporte para renovación de tokens de acceso
- 🌐 **JWKS Endpoint**: Publicación de llaves públicas para validación de tokens
- 🏗️ **Clean Architecture**: Separación clara de responsabilidades con DDD
- 💉 **Dependency Injection**: Container personalizado para gestión de dependencias
- 📝 **Logging Estructurado**: Logs JSON en producción, legibles en desarrollo
- 🐳 **Multi-arch Docker**: Soporte para AMD64 y ARM64 (Raspberry Pi 5)
- 🚀 **CI/CD Automatizado**: GitHub Actions con semantic-release
- 🧪 **Testing Completo**: Unit, integration y E2E tests
- 🔒 **Seguridad**: Helmet, CORS, rate limiting y headers de seguridad

---

## 🏛️ Arquitectura

### Estructura de Directorios

```
src/
├── config/              # Configuración y variables de entorno
├── container/           # Dependency Injection Container
├── domain/              # Entidades y lógica de negocio
├── application/         # Casos de uso
├── infrastructure/      # Implementaciones técnicas
│   ├── http/           # Express server y middlewares
│   ├── services/       # Clock, UUID, Logger
│   └── controller/     # Health controller
├── presentation/        # Controllers y routes
├── shared/             # Utilidades y errores compartidos
└── interfaces/         # Contratos y tipos TypeScript
```



### Principios SOLID Aplicados

- **Single Responsibility**: Cada clase tiene una única responsabilidad
- **Open/Closed**: Abierto para extensión, cerrado para modificación
- **Liskov Substitution**: Las implementaciones son intercambiables
- **Interface Segregation**: Interfaces específicas y cohesivas
- **Dependency Inversion**: Dependencias hacia abstracciones

### Clean Architecture

**Flujo de Dependencias:**

Presentation → Application → Domain ← Infrastructure

**Capas:**

1. **Domain (Núcleo)**
   - Entidades de negocio
   - Value Objects
   - Domain Services
   - Sin dependencias externas

2. **Application (Casos de Uso)**
   - Orquestación de lógica de negocio
   - DTOs para transferencia de datos
   - Interfaces de repositorios

3. **Infrastructure (Detalles Técnicos)**
   - Implementaciones de repositorios
   - Servicios externos
   - Base de datos
   - HTTP Server

4. **Presentation (Capa HTTP)**
   - Controllers
   - Routes
   - Middlewares
   - Validadores

### Patrones de Diseño

- **Repository Pattern**: Abstracción de acceso a datos
- **Adapter Pattern**: Adaptación de interfaces externas
- **Factory Pattern**: Creación de instancias complejas
- **Dependency Injection**: Inyección de dependencias vía container
- **Singleton Pattern**: Servicios compartidos (Config, Logger)

## **Principios aplicados:**

- **SOLID**: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
- **Clean Architecture**: Dependencias hacia el dominio
- **DDD**: Entities, Value Objects, Domain Services
- **Patterns**: Repository, Adapter, Factory

---

## 📦 Requisitos Previos

- **Node.js**: >= 22.18.0
- **pnpm**: >= 10.17.1
- **Docker**: >= 20.10 (opcional, para containerización)
- **Git**: Para clonar el repositorio

---

## 🚀 Instalación

### Clonar el repositorio
```bash
git clone https://github.com/JRuvalcabaFSD/ByteBerry-oauth2.git
cd ByteBerry-oauth2
```

### Instalar dependencias

bash

```bash
# Habilitar pnpm si no está disponible
corepack enable pnpm

# Instalar dependencias
pnpm install
```

------

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

env

```env
# Server Configuration
NODE_ENV=development
PORT=4000

# Logging Configuration
LOG_LEVEL=info

# Application Metadata
SERVICE_NAME=byteberry-oauth2

# CORS Configuration (comma-separated list)
CORS_ORIGINS=http://localhost:5173,http://localhost:4002,http://localhost:4003
```

### Configuración por Entorno

**Development:**

- Logs legibles y colorized en consola
- Hot reload con `ts-node-dev`
- Validaciones estrictas

**Production:**

- Logs estructurados en JSON
- Daily rotating files
- Optimizaciones de rendimiento

**Test:**

- Logs minimizados
- Mocks y stubs habilitados
- Coverage tracking

------

## 💻 Uso

### Desarrollo Local

bash

```bash
# Modo desarrollo con hot reload
pnpm dev

# El servidor estará disponible en http://localhost:4000
```

### Producción

bash

```bash
# Build del proyecto
pnpm build

# Iniciar servidor
pnpm start
```

### Scripts Disponibles

bash

```bash
pnpm dev              # Desarrollo con hot reload
pnpm build            # Compilar TypeScript
pnpm start            # Iniciar servidor (producción)
pnpm test             # Ejecutar tests
pnpm test:watch       # Tests en modo watch
pnpm test:coverage    # Tests con coverage
pnpm lint             # Verificar código con ESLint
pnpm lint:fix         # Corregir problemas de linting
pnpm type-check       # Verificar tipos TypeScript
pnpm ci:all           # Ejecutar todos los checks (CI)
pnpm commit           # Commit interactivo (Conventional Commits)
pnpm release          # Generar release (solo CI)
```

------

## 🐳 Docker

### Imágenes Multi-arch

Las imágenes Docker están disponibles para múltiples arquitecturas:

bash

```bash
# Pull imagen (auto-detecta arquitectura)
docker pull jruvalcabafsd/byteberry-oauth2:latest

# Pull específico para Raspberry Pi 5 (ARM64)
docker pull --platform linux/arm64 jruvalcabafsd/byteberry-oauth2:latest

# Pull específico para AMD64
docker pull --platform linux/amd64 jruvalcabafsd/byteberry-oauth2:latest
```

### Docker Hub

🐳 **Docker Hub**: [jruvalcabafsd/byteberry-oauth2](https://hub.docker.com/r/jruvalcabafsd/byteberry-oauth2)

**Tags disponibles:**

- `latest`: Última versión estable
- `vX.Y.Z`: Versiones específicas (SemVer)
- `X.Y`: Major.Minor version
- `X`: Major version

### Ejecutar con Docker

bash

```bash
# Ejecutar container
docker run -d \
  --name oauth2-service \
  -p 4000:4000 \
  -e NODE_ENV=production \
  -e PORT=4000 \
  -e LOG_LEVEL=info \
  -e CORS_ORIGINS=http://localhost:5173,http://localhost:4002 \
  jruvalcabafsd/byteberry-oauth2:latest

# Ver logs
docker logs -f oauth2-service

# Detener container
docker stop oauth2-service
```

### Docker Compose

yaml

```yaml
version: '3.9'

services:
  oauth2-service:
    image: jruvalcabafsd/byteberry-oauth2:latest
    container_name: oauth2-service
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - PORT=4000
      - LOG_LEVEL=info
      - CORS_ORIGINS=http://localhost:5173,http://localhost:4002
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "scripts/healthCheck.js"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s
```

### Build Local

bash

```bash
# Build imagen local
pnpm docker:build

# Test imagen
pnpm docker:test

# Build multi-arch (requiere buildx)
./scripts/docker-build.sh prod
```

------

## 🔄 CI/CD

### GitHub Actions Workflows

**PR-CI** (`pr-ci.yml`): Se ejecuta en cada Pull Request

- ✅ Code Quality (ESLint + TypeScript)
- 🏗️ Build (TypeScript compilation)
- 🧪 Tests (Unit + Integration con coverage)
- 🔒 Security Audit (pnpm audit)
- 🐳 Docker Build (verificación)

**Release-CI** (`release-ci.yml`): Se ejecuta en push a `main`

- 📦 Semantic Release (versionado automático)
- 🐳 Docker Multi-arch Build (AMD64 + ARM64)
- 📤 Push to Docker Hub
- 🏷️ GitHub Release creation
- 🔄 Sync develop branch

### Conventional Commits

El proyecto usa [Conventional Commits](https://www.conventionalcommits.org/) para versionado automático:

bash

```bash
# Helper interactivo
pnpm commit

# Tipos de commits:
feat:     # Nueva funcionalidad (minor version bump)
fix:      # Bug fix (patch version bump)
docs:     # Cambios en documentación
style:    # Formateo, espacios, etc.
refactor: # Refactorización de código
test:     # Agregar o modificar tests
chore:    # Mantenimiento, deps, etc.
perf:     # Mejoras de performance
ci:       # Cambios en CI/CD

# Breaking changes (major version bump)
feat!: cambio incompatible
```

### Semantic Versioning

El proyecto sigue [SemVer](https://semver.org/):

- **MAJOR** (1.x.x): Breaking changes
- **MINOR** (x.1.x): Nuevas features (backwards compatible)
- **PATCH** (x.x.1): Bug fixes

------

## 🧪 Testing

### Estructura de Tests

```
tests/
├── unit/             # Tests unitarios (domain, application)
├── integration/      # Tests de integración (infrastructure)
└── e2e/             # Tests end-to-end
```

### Ejecutar Tests

bash

```bash
# Todos los tests
pnpm test

# Tests con coverage
pnpm test:coverage

# Tests en modo watch
pnpm test:watch

# Tests específicos
pnpm test -- health.controller

# Tests con output verbose
pnpm test:verbose
```

### Coverage

Objetivo de cobertura: **80%+**

bash

```bash
# Generar reporte de coverage
pnpm test:coverage

# Ver reporte en navegador
open coverage/lcov-report/index.html
```

------

## 📚 API Documentation

### Health Endpoints

#### GET /health

Health check básico (liveness probe).

**Response 200:**

json

```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "service": "byteberry-oauth2",
  "version": "1.0.0",
  "uptime": 3600000,
  "requestId": "req-123-456",
  "environment": "production"
}
```

#### GET /health/deep

Health check profundo (readiness probe) con validación de dependencias.

**Response 200:**

json

```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "service": "byteberry-oauth2",
  "version": "1.0.0",
  "uptime": 3600000,
  "requestId": "req-123-456",
  "environment": "production",
  "dependencies": {
    "Clock": {
      "status": "healthy",
      "message": "Clock service is available and operational",
      "responseTime": 1
    },
    "Config": {
      "status": "healthy",
      "message": "Config service is available and operational",
      "responseTime": 0
    }
  },
  "system": {
    "memory": {
      "used": 536870912,
      "free": 1073741824,
      "total": 1610612736,
      "percentage": 33
    },
    "uptime": 86400
  }
}
```

### Root Endpoint

#### GET /

Información del servicio y endpoints disponibles.

**Response 200:**

json

```json
{
  "service": "byteberry-oauth2",
  "version": "1.0.0",
  "status": "running",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "requestId": "req-123-456",
  "environment": "production",
  "endpoints": {
    "health": "/health",
    "deepHealth": "/health/deep"
  }
}
```

------

## 👨‍💻 Desarrollo

### Estructura del Proyecto

**Clean Architecture Layers:**

1. **Config**: Variables de entorno y configuración
2. **Container**: Dependency Injection
3. **Domain**: Entidades y lógica de negocio (sin dependencias externas)
4. **Application**: Casos de uso (orquestación)
5. **Infrastructure**: Implementaciones técnicas (DB, HTTP, servicios)
6. **Presentation**: Controllers y routes (capa HTTP)
7. **Shared**: Utilidades y tipos compartidos
8. **Interfaces**: Contratos TypeScript

### Convenciones de Código

**Naming:**

- Files: `kebab-case` (user-repository.ts)
- Classes: `PascalCase` (UserRepository)
- Interfaces: `PascalCase` con prefix `I` (IUserRepository)
- Methods/Variables: `camelCase` (createUser)
- Constants: `UPPER_SNAKE_CASE` (DEFAULT_PORT)

**Error Handling:**

typescript

```typescript
// Errores específicos del dominio
throw new ConfigError('Invalid config', { key: 'PORT' });
throw new ContainerError('Service not found', token);
throw new BootstrapError('Startup failed', context);
```

### Agregar Nueva Funcionalidad

1. **Domain Layer**: Define entidades y value objects
2. **Application Layer**: Crea casos de uso
3. **Infrastructure Layer**: Implementa repositorios y servicios
4. **Presentation Layer**: Crea controllers y routes
5. **Container**: Registra dependencias
6. **Tests**: Agrega tests para cada capa

------

## 🤝 Contribución

### Proceso de Contribución

1. Fork del repositorio
2. Crear feature branch: `git checkout -b feat/nueva-funcionalidad`
3. Commit con Conventional Commits: `pnpm commit`
4. Push: `git push origin feat/nueva-funcionalidad`
5. Crear Pull Request

### Pull Request Guidelines

- ✅ Seguir Clean Architecture
- ✅ Tests con coverage > 80%
- ✅ Linting sin errores: `pnpm lint`
- ✅ Type checking sin errores: `pnpm type-check`
- ✅ Conventional Commits
- ✅ Actualizar documentación si es necesario

### Code Review Process

Los PRs requieren:

- ✅ PR-CI workflow en verde
- ✅ Al menos 1 approval
- ✅ Sin conflictos con `main`

------

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](./LICENSE) para más detalles.

------

## 📞 Contacto y Soporte

- **Desarrollador**: JRuvalcabaFSD
- **GitHub**: [@JRuvalcabaFSD](https://github.com/JRuvalcabaFSD)
- **Docker Hub**: [jruvalcabafsd](https://hub.docker.com/u/jruvalcabafsd)
- **Email**: [support@jrmdev.org](mailto:support@jrmdev.org)

------

## 🔗 Enlaces Útiles

- [GitHub Repository](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2)
- [Docker Hub](https://hub.docker.com/r/jruvalcabafsd/byteberry-oauth2)
- [Issues](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/issues)
- [Pull Requests](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/pulls)
- [Releases](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/releases)
- [Changelog](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/blob/main/CHANGELOG.md)

------

## 🎯 Roadmap

Ver [Roadmap-ByteBerry.md](https://github.com/JRuvalcabaFSD/ByteBerry-infra/blob/main/Roadmap-ByteBerry.md) para el plan completo del proyecto.

**Fase Actual**: F0 - East Blue Saga (Bootstrap inicial) ✅

**Próximas Fases**:

- F1 - Arabasta Saga: Autenticación básica OAuth2
- F2 - Sky Island Saga: Persistencia con PostgreSQL
- F3 - Water 7 Saga: Contract testing con Pact

------

## 🙏 Agradecimientos

Este proyecto es parte del sistema ByteBerry de gestión de gastos, desarrollado con fines educativos para aprender microservicios, Clean Architecture, CI/CD y despliegue en Raspberry Pi 5.

------

<div align="center">
**Hecho con ❤️ por JRuvalcabaFSD**

⭐ Si este proyecto te resulta útil, considera darle una estrella en GitHub