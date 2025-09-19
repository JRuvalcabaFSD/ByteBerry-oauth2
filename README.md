# 🔐 ByteBerry OAuth2 Service

[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/JRuvalcabaFSD/ByteBerry-oauth2/pr-ci.yml?branch=main&logo=githubactions&logoColor=white&label=CI%2FCD)](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/actions/workflows/pr-ci.yml)
[![tests](https://img.shields.io/github/actions/workflow/status/JRuvalcabaFSD/ByteBerry-oauth2/tests.yml?branch=main&label=tests&logo=jest&logoColor=white)](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/actions/workflows/tests.yml)
[![Node Engine](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2FJRuvalcabaFSD%2FByteBerry-oauth2%2Fmain%2Fpackage.json&query=%24.engines.node&label=Node&logo=node.js&logoColor=white&color=339933)](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/blob/main/package.json)
[![GitHub Release](https://img.shields.io/github/v/release/JRuvalcabaFSD/ByteBerry-oauth2?sort=semver&display_name=release&logo=semanticrelease&logoColor=white&label=Version)](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/releases)
[![Docker Image Version](https://img.shields.io/docker/v/jruvalcabafsd/ByteBerry-oauth2?sort=semver&logo=docker&logoColor=white&label=Image%20Version)](https://hub.docker.com/repositories/jruvalcabafsd)
[![GitHub License](https://img.shields.io/github/license/JRuvalcabaFSD/ByteBerry-oauth2)](./LICENSE)

Servidor de autenticación OAuth2 completo con Authorization Code + PKCE, JWT RS256, refresh tokens y JWKS. Implementado con Clean Architecture, principios SOLID y Dependency Injection Container. Optimizado para Raspberry Pi 5 (ARM64).

## 📋 Descripción

El servicio OAuth2 de ByteBerry proporciona autenticación y autorización completa para el sistema de gestión de gastos. Implementa los estándares OAuth2 modernos con enfoque en seguridad y escalabilidad.

### 🎯 Características Principales

- **OAuth2 Authorization Code + PKCE**: Flujo seguro para aplicaciones públicas
- **JWT RS256**: Tokens firmados con clave asimétrica
- **Refresh Tokens**: Renovación segura de sesiones
- **JWKS Endpoint**: Distribución automática de claves públicas
- **Clean Architecture**: Separación clara de responsabilidades
- **SOLID Principles**: Código mantenible y extensible
- **DI Container**: Gestión automática de dependencias

## 🏗️ Arquitectura

### Clean Architecture Layers
```
Presentation → Application → Domain ← Infrastructure
     ↓            ↓            ↑           ↑
Controllers → Use Cases → Entities ← Repositories
```

### Dependency Injection
- **Transient**: Nueva instancia por resolución
- **Singleton**: Instancia única compartida
- **Factory Pattern**: Construcción compleja de dependencias
- **Constructor Injection**: Dependencias inyectadas automáticamente

## 🚀 Getting Started

### Prerrequisitos
- **Node.js**: 22.x LTS
- **pnpm**: 10.15.1
- **Docker**: 24.x+ (opcional)
- **PostgreSQL**: 15+ (para producción)

### Instalación Local

```bash
# Clonar repositorio
git clone https://github.com/JRuvalcabaFSD/ByteBerry-oauth2.git
cd ByteBerry-oauth2

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Ejecutar migraciones de base de datos
pnpm prisma:migrate

# Iniciar en desarrollo
pnpm dev
```

### Docker (Recomendado)

```bash
# Construir imagen
docker build -t byteberry-oauth2 .

# Ejecutar contenedor
docker run -p 4000:4000 \
  -e NODE_ENV=development \
  -e PORT=4000 \
  -e DATABASE_URL="postgresql://..." \
  byteberry-oauth2
```

### Docker Compose (Sistema Completo)

```bash
# Desde el repositorio infra
git clone https://github.com/JRuvalcabaFSD/ByteBerry-infra.git
cd ByteBerry-infra
docker-compose up oauth2-service
```

## 📡 API Documentation

### Endpoints OAuth2

#### Authorization Endpoint
```http
GET /authorize?response_type=code&client_id={client_id}&redirect_uri={uri}&code_challenge={challenge}&code_challenge_method=S256&state={state}
```

#### Token Endpoint
```http
POST /token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&code={code}&redirect_uri={uri}&client_id={client_id}&code_verifier={verifier}
```

#### JWKS Endpoint
```http
GET /.well-known/jwks.json
```

#### Health Check
```http
GET /health
GET /health/deep  # Incluye dependencias
GET /health/metrics  # Métricas de performance
```

### Response Examples

#### Token Response
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 900,
  "refresh_token": "rt_1234567890abcdef",
  "scope": "read write"
}
```

#### Error Response
```json
{
  "error": "INVALID_CLIENT",
  "message": "Client authentication failed",
  "timestamp": "2025-01-01T12:00:00Z",
  "requestId": "req_1234567890"
}
```

## 🧪 Testing

### Ejecutar Tests

```bash
# Unit tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage

# Integration tests
pnpm test:integration
```

### Test Strategy
- **Unit Tests**: Domain y Application layers (>80% cobertura)
- **Integration Tests**: Infrastructure layer con DB real
- **Contract Tests**: Pact con BFF y otros servicios
- **E2E Tests**: Flujos OAuth2 completos

## 🚢 Deployment

### Raspberry Pi 5 (ARM64)

```bash
# Construir para ARM64
docker buildx build --platform linux/arm64 -t byteberry-oauth2:arm64 .

# Deploy con Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

### Performance Targets (RPi5)
- **Response Time**: < 500ms (P95)
- **Memory Usage**: < 256MB
- **CPU Usage**: < 80% sustained
- **Throughput**: 50+ req/sec

## 🔧 Configuration

### Environment Variables

```bash
# Server
NODE_ENV=development|production
PORT=4000
LOG_LEVEL=debug|info|warn|error

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/oauth2_db

# JWT Configuration
JWT_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----...
JWT_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----...
JWT_EXPIRES_IN=15m
JWT_ISSUER=https://ByteBerry.auth.jrmdev.org

# OAuth2 Settings
OAUTH2_AUTHORIZATION_CODE_EXPIRES_IN=10m
OAUTH2_REFRESH_TOKEN_EXPIRES_IN=7d
OAUTH2_ALLOWED_REDIRECT_URIS=https://ByteBerry.app.jrmdev.org/callback
```

## 📊 Monitoring

### Health Endpoints
- `/health`: Status básico del servicio
- `/health/deep`: Estado de dependencias (DB, Redis)
- `/health/metrics`: Métricas de performance y uso

### Logs Estructurados
```json
{
  "timestamp": "2025-01-01T12:00:00Z",
  "level": "info",
  "service": "oauth2",
  "requestId": "req_1234567890",
  "message": "Token generated successfully",
  "data": {
    "userId": "user_123",
    "clientId": "client_456",
    "grantType": "authorization_code"
  }
}
```

## 🔗 Enlaces del Ecosistema

- **BFF Service**: https://github.com/JRuvalcabaFSD/ByteBerry-BFF
- **Expenses API**: https://github.com/JRuvalcabaFSD/ByteBerry-Expenses
- **Frontend**: https://github.com/JRuvalcabaFSD/ByteBerry-Frontend
- **Infrastructure**: https://github.com/JRuvalcabaFSD/ByteBerry-infra
- **Docker Hub**: https://hub.docker.com/r/jruvalcabafsd/byteberry-oauth2

## 📈 Roadmap

- ✅ **F0**: Bootstrap inicial con health endpoints
- 🔄 **F1**: OAuth2 básico con JWT y PKCE
- 📋 **F2**: Persistencia en PostgreSQL
- 🔗 **F3**: Contract testing con Pact
- 🔄 **F4**: Logout y revocación de tokens
- 📊 **F6**: Integración con Redis para blacklist
- 🚀 **F10**: Rotación automática de claves

## 🤝 Contributing

Por favor lee [CONTRIBUTING.md](CONTRIBUTING.md) para detalles sobre el código de conducta y el proceso para enviar pull requests.

## 📄 License

Este proyecto está licenciado bajo la MIT License - ver [LICENSE](LICENSE) para detalles.

## 👨‍💻 Autor

**JRuvalcabaFSD**
- GitHub: [@JRuvalcabaFSD](https://github.com/JRuvalcabaFSD)
- Email: support@jrmdev.org

## ⭐ Acknowledgments

- Proyecto educativo enfocado en microservicios y arquitectura limpia
- Optimizado específicamente para Raspberry Pi 5
- Parte del ecosistema ByteBerry de gestión de gastos