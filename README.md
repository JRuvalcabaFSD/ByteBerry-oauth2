# 🔐 ByteBerry OAuth2 Service

[![tests](https://img.shields.io/github/actions/workflow/status/JRuvalcabaFSD/ByteBerry-oauth2/tests.yml?branch=main&label=tests&logo=jest&logoColor=white)](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/actions/workflows/tests.yml)
[![Node Engine](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2FJRuvalcabaFSD%2FByteBerry-oauth2%2Fmain%2Fpackage.json&query=%24.engines.node&label=Node&logo=node.js&logoColor=white&color=339933)](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/blob/main/package.json)
[![GitHub Release](https://img.shields.io/github/v/release/JRuvalcabaFSD/ByteBerry-oauth2?sort=semver&display_name=release&logo=semanticrelease&logoColor=white&label=Version)](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/releases)
[![Docker Image Version](https://img.shields.io/docker/v/jruvalcabafsd/ByteBerry-oauth2?sort=semver&logo=docker&logoColor=white&label=Image%20Version)](https://hub.docker.com/repositories/jruvalcabafsd)
[![GitHub License](https://img.shields.io/github/license/JRuvalcabaFSD/ByteBerry-oauth2)](./LICENSE)

Servicio de autenticación y autorización OAuth2 para el Sistema de Gestión de Gastos ByteBerry. Implementa flujos OAuth2 seguros con Authorization Code + PKCE, manejo de JWT RS256 y endpoint JWKS para validación distribuida.

## 📋 Descripción

El servicio OAuth2 de ByteBerry es el centro de identidad y autenticación del ecosistema. Proporciona:

- **OAuth2 Authorization Server** completo con flujos estándar
- **JWT Token Management** con claves RS256 y rotación automática
- **JWKS Endpoint** para validación distribuida por otros servicios
- **User Management** básico para autenticación
- **Security Headers** y rate limiting integrado

### 🎯 Características Principales

- ✅ **OAuth2 Flows**: Authorization Code + PKCE
- ✅ **JWT RS256**: Tokens seguros con claves asimétricas
- ✅ **JWKS**: Endpoint público para validación de tokens
- ✅ **Refresh Tokens**: Renovación segura de sesiones
- ✅ **Rate Limiting**: Protección contra ataques
- ✅ **Clean Architecture**: Código mantenible y testeable
- ✅ **Multi-arch Docker**: ARM64 + AMD64 para Raspberry Pi

## 🏗️ Arquitectura

### Clean Architecture Implementation

```
src/
├── config/                 # Configuraciones centralizadas
├── interfaces/             # Contratos compartidos entre capas
├── domain/                 # 🔵 Lógica de negocio pura
│   ├── entities/          # User, OAuthApplication, AuthorizationCode
│   ├── services/          # AuthorizationService, TokenService
│   └── value-objects/     # Email, UserId, ClientId
├── application/           # 🟢 Casos de uso de la aplicación
│   ├── use-cases/         # AuthorizeUser, GenerateToken, RevokeToken
│   └── dtos/              # DTOs para transferencia entre capas
├── infrastructure/        # 🟡 Detalles técnicos
│   ├── database/          # Conexiones, migraciones, modelos
│   ├── repositories/      # Implementaciones de repositorios
│   ├── external/          # Servicios externos (email, etc.)
│   └── security/          # JWT, crypto, key management
├── presentation/          # 🔴 Interfaz HTTP
│   ├── controllers/       # AuthController, TokenController, JWKSController
│   ├── routes/            # Definición de rutas Express
│   ├── middleware/        # Auth, validation, logging
│   └── validators/        # Validación de entrada
├── shared/                # 🟠 Utilidades transversales
│   ├── errors/            # Excepciones del dominio
│   ├── utils/             # Funciones auxiliares
│   └── constants/         # Constantes de aplicación
└── container/             # 🟣 Dependency Injection
    └── Container.ts       # DI Container custom
```

### 🔄 Dependency Flow

```
Presentation ──→ Application ──→ Domain
     ↑                              ↑
Infrastructure ──────────────────────┘
```

- **Domain**: Núcleo del negocio, sin dependencias externas
- **Application**: Orquestación de casos de uso
- **Infrastructure**: Implementaciones técnicas
- **Presentation**: Controladores HTTP y middleware

## 🚀 Getting Started

### Prerequisites

- **Node.js**: >= 22.0.0
- **pnpm**: 10.15.1
- **Docker**: >= 20.10.0 (opcional)
- **PostgreSQL**: >= 14.0 (desde F2)

### Installation

```bash
# Clone el repositorio
git clone https://github.com/JRuvalcabaFSD/ByteBerry-oauth2.git
cd ByteBerry-oauth2

# Instalar dependencias con pnpm
pnpm install

# Copiar y configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Generar claves JWT (desarrollo)
pnpm run generate-keys

# Iniciar en modo desarrollo
pnpm dev
```

### 🐳 Docker Setup

```bash
# Build imagen local
docker build -t ByteBerry-oauth2 .

# O usar imagen pre-built
docker pull jruvalcabafsd/ByteBerry-oauth2:latest

# Ejecutar contenedor
docker run -p 4000:4000 \
  -e NODE_ENV=production \
  -e PORT=4000 \
  jruvalcabafsd/ByteBerry-oauth2:latest
```

### Environment Variables

```bash
# Server Configuration
NODE_ENV=development          # development | production
PORT=4000                     # Puerto del servidor
LOG_LEVEL=info               # debug | info | warn | error

# JWT Configuration (F1+)
JWT_PRIVATE_KEY=             # RSA private key (PEM format)
JWT_PUBLIC_KEY=              # RSA public key (PEM format)
JWT_ALGORITHM=RS256          # Algoritmo JWT
JWT_EXPIRES_IN=15m           # Expiración access tokens
JWT_REFRESH_EXPIRES_IN=7d    # Expiración refresh tokens

# Database (F2+)
DATABASE_URL=                # PostgreSQL connection string

# Security
ALLOWED_ORIGINS=             # CORS allowed origins (comma separated)
RATE_LIMIT_WINDOW=900000     # Rate limit window (15 min)
RATE_LIMIT_MAX=100           # Max requests per window
```

## 📡 API Documentation

### Health Check

```http
GET /health
```

**Response** (200 OK):
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00Z",
  "version": "1.0.0",
  "service": "oauth2",
  "dependencies": {
    "database": "healthy",
    "jwt_keys": "available"
  }
}
```

### OAuth2 Endpoints (F1+)

#### Authorization Endpoint

```http
GET /authorize?response_type=code&client_id=CLIENT_ID&redirect_uri=REDIRECT_URI&code_challenge=CHALLENGE&code_challenge_method=S256&state=STATE
```

#### Token Endpoint

```http
POST /token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&code=CODE&client_id=CLIENT_ID&code_verifier=VERIFIER&redirect_uri=REDIRECT_URI
```

#### JWKS Endpoint

```http
GET /.well-known/jwks.json
```

**Response**:
```json
{
  "keys": [
    {
      "kty": "RSA",
      "use": "sig",
      "kid": "key-id",
      "alg": "RS256",
      "n": "...",
      "e": "AQAB"
    }
  ]
}
```

### Error Format

Todos los errores siguen el formato estándar:

```json
{
  "error": "ERROR_CODE",
  "message": "Human readable message",
  "timestamp": "2025-01-15T10:30:00Z",
  "requestId": "uuid-request-id"
}
```

## 🧪 Testing

### Running Tests

```bash
# Tests unitarios
pnpm test

# Tests con coverage
pnpm test:coverage

# Tests en modo watch
pnpm test:watch

# Tests de integración
pnpm test:integration

# Tests E2E
pnpm test:e2e
```

### Test Structure

```
tests/
├── unit/                   # Tests unitarios
│   ├── domain/            # Entities y domain services
│   ├── application/       # Use cases
│   └── container/         # DI Container
├── integration/           # Tests de integración
│   ├── infrastructure/    # Repositories, database
│   └── presentation/      # Controllers, middleware
└── e2e/                   # Tests end-to-end
    └── oauth-flows/       # Flujos OAuth2 completos
```

### Coverage Requirements

- **Domain Layer**: > 90%
- **Application Layer**: > 85%
- **Infrastructure Layer**: > 80%
- **Presentation Layer**: > 75%

## 🚀 Deployment

### Production Build

```bash
# Build para producción
pnpm build

# Verificar build
pnpm start

# Ejecutar con PM2
pm2 start ecosystem.config.js
```

### Docker Deployment

```bash
# Multi-arch build
docker buildx build --platform linux/amd64,linux/arm64 \
  -t jruvalcabafsd/ByteBerry-oauth2:latest \
  --push .

# Deploy en Raspberry Pi
docker-compose up -d oauth2-service
```

### Environment-Specific Configuration

#### Development
- Logs en formato texto con colores
- JWT keys generadas automáticamente
- Rate limiting relajado
- CORS permisivo

#### Production
- Logs en formato JSON estructurado
- JWT keys desde variables de entorno seguras
- Rate limiting estricto
- CORS restrictivo
- SSL/TLS obligatorio

## 🔧 Configuration

### DI Container

El servicio usa un DI Container custom para gestionar dependencias:

```typescript
// Registro de dependencias
container.registerSingleton('Logger', () => createLogger());
container.registerSingleton('Config', () => new EnvironmentConfig());
container.register('AuthService', () => 
  new AuthService(container.resolve('UserRepository'))
);
```

### Logging

Formato estándar con correlación por request:

```json
{
  "timestamp": "2025-01-15T10:30:00Z",
  "level": "info",
  "service": "oauth2",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Authorization request processed",
  "data": {
    "clientId": "client123",
    "userId": "user456"
  }
}
```

## 🔐 Security

### JWT Security

- **Algorithm**: RS256 (asymmetric)
- **Key Rotation**: Cada 30 días en producción
- **Grace Period**: 24 horas para keys anteriores
- **Secure Headers**: HttpOnly, Secure, SameSite

### Rate Limiting

- **Auth endpoints**: 10 requests/minuto por IP
- **General endpoints**: 100 requests/minuto por IP
- **JWKS endpoint**: 1000 requests/minuto por IP

### CORS Policy

```javascript
{
  origin: process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true,
  optionsSuccessStatus: 200
}
```

## 📊 Monitoring

### Health Checks

- **Endpoint**: `GET /health`
- **Timeout**: < 100ms
- **Dependencies**: Database, JWT keys
- **Format**: JSON estándar

### Metrics (Planned)

- Request rate per endpoint
- Response time percentiles
- Error rate by type
- JWT token generation rate
- Authentication success/failure rate

## 🔄 CI/CD

### PR Pipeline

```yaml
- Lint (ESLint + Prettier)
- Build (TypeScript compilation)
- Test (Unit + Integration with coverage)
- Security Audit (npm audit)
- Docker Build (multi-arch test)
```

### Release Pipeline

```yaml
- Semantic Release (conventional commits)
- Docker Build (linux/amd64,linux/arm64)
- Push to Docker Hub
- GitHub Release creation
- Documentation update
```

### Conventional Commits

```bash
feat(auth): add PKCE support for OAuth2 flow
fix(jwt): resolve key rotation memory leak
docs(api): update JWKS endpoint documentation
test(oauth): add integration tests for authorization flow
```

## 🤝 Contributing

Por favor lee [CONTRIBUTING.md](CONTRIBUTING.md) para detalles sobre nuestro código de conducta y proceso para enviar pull requests.

## 📄 License

Este proyecto está bajo la Licencia MIT - ver [LICENSE](LICENSE) para detalles.

## 🌟 Roadmap

### F0 - Bootstrap (Actual)
- [x] Clean Architecture setup
- [x] DI Container implementation
- [x] Health endpoint
- [x] Docker multi-arch
- [x] CI/CD pipelines

### F1 - OAuth2 Básico
- [ ] Authorization Code + PKCE flow
- [ ] JWT RS256 token generation
- [ ] JWKS endpoint
- [ ] Basic user management

### F2 - Persistencia
- [ ] PostgreSQL integration
- [ ] User and client persistence
- [ ] Migration system

### F3+ - Features Avanzadas
- [ ] Refresh token rotation
- [ ] Scope-based authorization
- [ ] Multi-factor authentication
- [ ] OAuth2 device flow

## 📞 Support

- **Email**: support@jrmdev.org
- **Issues**: [GitHub Issues](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/issues)
- **Discussions**: [GitHub Discussions](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/discussions)

## 📚 Enlaces Útiles

- [OAuth2 RFC 6749](https://tools.ietf.org/html/rfc6749)
- [PKCE RFC 7636](https://tools.ietf.org/html/rfc7636)
- [JWT RFC 7519](https://tools.ietf.org/html/rfc7519)
- [JWKS RFC 7517](https://tools.ietf.org/html/rfc7517)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

**🏆 ByteBerry OAuth2 Service** - Parte del Sistema de Gestión de Gastos  
**👨‍💻 Desarrollado por**: [JRuvalcabaFSD](https://github.com/JRuvalcabaFSD)  
**🐳 Docker Hub**: [jruvalcabafsd/ByteBerry-oauth2](https://hub.docker.com/r/jruvalcabafsd/ByteBerry-oauth2)
