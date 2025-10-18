# 🤝 Guía de Contribución - ByteBerry OAuth2 Service

¡Gracias por tu interés en contribuir al ByteBerry OAuth2 Service! Esta guía te ayudará a entender cómo participar efectivamente en el desarrollo del proyecto.

## 📋 Tabla de Contenidos

- [🎯 Código de Conducta](#-código-de-conducta)
- [🚀 Primeros Pasos](#-primeros-pasos)
- [🔧 Configuración del Entorno](#-configuración-del-entorno)
- [📝 Tipos de Contribución](#-tipos-de-contribución)
- [🌿 Flujo de Trabajo Git](#-flujo-de-trabajo-git)
- [💻 Estándares de Código](#-estándares-de-código)
- [🧪 Testing](#-testing)
- [📚 Documentación](#-documentación)
- [🔍 Proceso de Review](#-proceso-de-review)
- [🏷️ Conventional Commits](#️-conventional-commits)
- [🐛 Reporte de Bugs](#-reporte-de-bugs)
- [💡 Solicitudes de Features](#-solicitudes-de-features)
- [❓ Soporte](#-soporte)

## 🎯 Código de Conducta

Este proyecto adhiere al [Código de Conducta](CODE_OF_CONDUCT.md). Al participar, se espera que mantengas este código. Por favor, reporta comportamientos inaceptables a conduct@jrmdev.org.

## 🚀 Primeros Pasos

### ¿Nuevo en el Proyecto?

1. **Lee la documentación principal**: [README.md](README.md)
2. **Revisa los issues abiertos**: [Issues](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/issues)
3. **Busca issues etiquetados como** `good first issue` o `help wanted`
4. **Únete a las discusiones**: [GitHub Discussions](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/discussions)

### ¿Por Dónde Empezar?

#### 🟢 Para Principiantes
- Correcciones de documentación
- Tests unitarios simples
- Mejoras en mensajes de error
- Issues etiquetados como `good first issue`

#### 🟡 Para Intermedios
- Implementación de features menores
- Refactoring de código existente
- Mejoras de performance
- Issues etiquetados como `enhancement`

#### 🔴 Para Avanzados
- Features mayores de OAuth2
- Cambios de arquitectura
- Integración con otros servicios
- Issues etiquetados como `epic` o `major`

## 🔧 Configuración del Entorno

### Prerequisites

```bash
# Versiones requeridas
node --version    # >= 22.0.0
pnpm --version    # 10.15.1
docker --version  # >= 20.10.0
git --version     # >= 2.30.0
```

### Setup Local

```bash
# 1. Fork y clone el repositorio
git clone https://github.com/TU_USERNAME/ByteBerry-oauth2.git
cd ByteBerry-oauth2

# 2. Agregar upstream
git remote add upstream https://github.com/JRuvalcabaFSD/ByteBerry-oauth2.git

# 3. Instalar dependencias
pnpm install

# 4. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# 5. Verificar setup
pnpm lint          # Debe pasar sin errores
pnpm test          # Debe pasar todos los tests
pnpm build         # Debe compilar exitosamente
```

### 🐳 Setup con Docker

```bash
# Build imagen de desarrollo
docker build -f Dockerfile.dev -t byteberry-oauth2-dev .

# Ejecutar contenedor de desarrollo
docker run -p 4000:4000 -v $(pwd):/app byteberry-oauth2-dev
```

### 🛠️ Herramientas Recomendadas

#### Editor
- **VS Code** con extensiones:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - Docker
  - GitLens

#### CLI Tools
```bash
# Instalar herramientas globales
pnpm add -g @commitlint/cli
pnpm add -g semantic-release-cli
```

## 📝 Tipos de Contribución

### 🐛 Bug Fixes
- Corrección de errores existentes
- Mejoras en manejo de errores
- Fixes de seguridad

### ✨ Features
- Nuevas funcionalidades OAuth2
- Mejoras en API endpoints
- Optimizaciones de performance

### 📚 Documentación
- Actualizaciones de README
- Documentación de API
- Ejemplos de uso
- Guías de deployment

### 🧪 Testing
- Tests unitarios
- Tests de integración
- Tests E2E para flujos OAuth2
- Mejoras en coverage

### 🔧 Infraestructura
- Mejoras en CI/CD
- Docker optimizations
- Scripts de deployment
- Tooling improvements

### 🎨 UI/UX (si aplica)
- Mejoras en error pages
- OAuth2 consent screens
- Admin interfaces

## 🌿 Flujo de Trabajo Git

### Branching Strategy

```
main (protected)
├── develop
├── feature/T001-implement-oauth-flow
├── fix/T050-jwt-validation-bug
├── docs/update-api-documentation
└── release/v1.2.0
```

### Convención de Branches

```bash
# Features
feature/T[ID]-short-description
feature/T100-add-pkce-support

# Bug fixes
fix/T[ID]-short-description
fix/T150-jwt-memory-leak

# Documentation
docs/update-readme
docs/add-api-examples

# Releases
release/v[version]
release/v1.2.0

# Hotfixes
hotfix/critical-security-patch
```

### Workflow Completo

```bash
# 1. Sincronizar con upstream
git checkout main
git pull upstream main

# 2. Crear feature branch
git checkout -b feature/T100-add-refresh-tokens

# 3. Hacer cambios y commits
git add .
git commit -m "feat(auth): add refresh token rotation"

# 4. Push a tu fork
git push origin feature/T100-add-refresh-tokens

# 5. Crear Pull Request
# Via GitHub interface
```

### 🔄 Manteniendo tu Fork Actualizado

```bash
# Regularmente sincronizar
git checkout main
git pull upstream main
git push origin main

# Rebase feature branch
git checkout feature/my-feature
git rebase main
```

## 💻 Estándares de Código

### 🏗️ Arquitectura Clean

Seguimos **Clean Architecture** con estricta separación de capas:

```typescript
// ✅ CORRECTO: Domain entity
export class User {
  constructor(
    private readonly id: UserId,
    private readonly email: Email
  ) {}
  
  changeEmail(newEmail: Email): DomainEvent[] {
    // Pure business logic
  }
}

// ❌ INCORRECTO: Domain con dependencias externas
export class User {
  constructor(private database: Database) {} // NO!
}
```

### 🎯 Principios SOLID

#### Single Responsibility Principle
```typescript
// ✅ CORRECTO
class AuthorizationService {
  authorize(request: AuthRequest): AuthResult {
    // Solo lógica de autorización
  }
}

class TokenService {
  generateToken(user: User): Token {
    // Solo generación de tokens
  }
}

// ❌ INCORRECTO
class AuthService {
  authorize() { /* ... */ }
  generateToken() { /* ... */ }
  sendEmail() { /* ... */ } // Demasiadas responsabilidades
}
```

#### Dependency Inversion
```typescript
// ✅ CORRECTO
class AuthUseCase {
  constructor(
    @inject('UserRepository') private userRepo: IUserRepository
  ) {}
}

// ❌ INCORRECTO
class AuthUseCase {
  constructor() {
    this.userRepo = new PostgreSQLUserRepository(); // Dependencia concreta
  }
}
```

### 🏷️ Naming Conventions

```typescript
// Files: kebab-case
user-repository.ts
oauth-controller.ts

// Classes: PascalCase
class UserRepository {}
class OAuthController {}

// Interfaces: PascalCase con I prefix
interface IUserRepository {}
interface IOAuthService {}

// Methods/Variables: camelCase
const accessToken = generateAccessToken();
async function validateAuthCode() {}

// Constants: UPPER_SNAKE_CASE
const MAX_TOKEN_LIFETIME = 3600;
const DEFAULT_SCOPES = ['read'];

// Environment Variables: UPPER_SNAKE_CASE
NODE_ENV
JWT_PRIVATE_KEY
DATABASE_URL
```

### 📏 Code Style

#### TypeScript Configuration
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

#### ESLint Rules
```json
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/prefer-readonly": "error",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

#### Prettier Configuration
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

### 🛡️ Error Handling

```typescript
// ✅ CORRECTO: Error handling estándar
class AuthController {
  async authorize(req: Request, res: Response) {
    try {
      const result = await this.authUseCase.execute(req.body);
      res.json(result);
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: error.message,
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id']
        });
      }
      // Handle other error types...
    }
  }
}

// Custom domain errors
export class InvalidCredentialsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidCredentialsError';
  }
}
```

## 🧪 Testing

### 📊 Coverage Requirements

| Layer | Minimum Coverage |
|-------|------------------|
| Domain | 90% |
| Application | 85% |
| Infrastructure | 80% |
| Presentation | 75% |

### 🧪 Testing Strategy

#### Unit Tests
```typescript
// Domain entity test
describe('User', () => {
  it('should_ChangeEmail_When_ValidEmailProvided', () => {
    const user = new User(UserId.create(), Email.create('old@example.com'));
    const newEmail = Email.create('new@example.com');
    
    const events = user.changeEmail(newEmail);
    
    expect(user.getEmail()).toEqual(newEmail);
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(EmailChangedEvent);
  });
});
```

#### Integration Tests
```typescript
// Repository integration test
describe('UserRepository', () => {
  it('should_SaveAndRetrieveUser_When_ValidUserProvided', async () => {
    const user = User.create(Email.create('test@example.com'));
    
    await userRepository.save(user);
    const retrieved = await userRepository.findById(user.getId());
    
    expect(retrieved).toBeDefined();
    expect(retrieved.getEmail()).toEqual(user.getEmail());
  });
});
```

#### E2E Tests
```typescript
// OAuth flow E2E test
describe('OAuth2 Flow', () => {
  it('should_CompleteAuthorizationFlow_When_ValidCredentials', async () => {
    // 1. Authorization request
    const authResponse = await request(app)
      .get('/authorize')
      .query({
        response_type: 'code',
        client_id: 'test-client',
        redirect_uri: 'http://localhost:3000/callback',
        code_challenge: 'challenge',
        code_challenge_method: 'S256'
      });
    
    // 2. Token exchange
    const tokenResponse = await request(app)
      .post('/token')
      .send({
        grant_type: 'authorization_code',
        code: authResponse.body.code,
        client_id: 'test-client',
        code_verifier: 'verifier'
      });
    
    expect(tokenResponse.body.access_token).toBeDefined();
    expect(tokenResponse.body.token_type).toBe('Bearer');
  });
});
```

### 🏃 Running Tests

```bash
# Unit tests
pnpm test:unit

# Integration tests
pnpm test:integration

# E2E tests
pnpm test:e2e

# All tests with coverage
pnpm test:coverage

# Watch mode
pnpm test:watch

# Specific test file
pnpm test user.test.ts
```

### 🎭 Mocking Strategy

```typescript
// Mock external dependencies
const mockUserRepository = {
  save: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn()
} as jest.Mocked<IUserRepository>;

// Mock timers for JWT expiration tests
jest.useFakeTimers();

// Mock crypto for deterministic tests
jest.mock('crypto', () => ({
  randomBytes: jest.fn(() => Buffer.from('mock-random-bytes'))
}));
```

## 📚 Documentación

### 📝 Code Documentation

#### JSDoc Standards
```typescript
/**
 * Generates a JWT access token for the authenticated user.
 * 
 * @param user - The authenticated user entity
 * @param scopes - Array of OAuth2 scopes to include in token
 * @param expiresIn - Token expiration time in seconds
 * @returns Promise resolving to signed JWT token
 * 
 * @throws {InvalidUserError} When user is not valid for token generation
 * @throws {TokenGenerationError} When JWT signing fails
 * 
 * @example
 * ```typescript
 * const token = await tokenService.generateAccessToken(
 *   user, 
 *   ['read', 'write'], 
 *   3600
 * );
 * ```
 * 
 * @since 1.0.0
 * @author JRuvalcabaFSD
 */
async generateAccessToken(
  user: User, 
  scopes: string[], 
  expiresIn: number = 3600
): Promise<string> {
  // Implementation...
}
```

#### README Sections Required
- Purpose and scope
- Installation instructions
- Configuration examples
- API documentation
- Error handling examples
- Testing instructions

### 📖 API Documentation

#### OpenAPI/Swagger
```yaml
# oauth2-api.yaml
openapi: 3.0.0
info:
  title: ByteBerry OAuth2 API
  version: 1.0.0
  
paths:
  /authorize:
    get:
      summary: OAuth2 authorization endpoint
      parameters:
        - name: response_type
          in: query
          required: true
          schema:
            type: string
            enum: [code]
      responses:
        '302':
          description: Redirect to client with authorization code
        '400':
          description: Invalid request parameters
```

### 📋 Change Documentation

#### Pull Request Template
```markdown
## 🎯 Description
Brief description of changes made.

## 📋 Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## 🧪 Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## 📚 Documentation
- [ ] Code comments updated
- [ ] README updated (if needed)
- [ ] API docs updated (if needed)

## ✅ Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests added for new functionality
- [ ] No breaking changes (or documented)
```

## 🔍 Proceso de Review

### 📝 Criterios de Review

#### ✅ Code Quality
- [ ] Follows Clean Architecture principles
- [ ] Implements SOLID principles
- [ ] Has appropriate error handling
- [ ] Includes comprehensive tests
- [ ] Follows naming conventions
- [ ] Has proper documentation

#### 🔒 Security
- [ ] No hardcoded secrets
- [ ] Input validation implemented
- [ ] Proper error messages (no info leakage)
- [ ] Authentication/authorization checks
- [ ] SQL injection prevention
- [ ] XSS prevention

#### 🚀 Performance
- [ ] No obvious performance bottlenecks
- [ ] Appropriate use of async/await
- [ ] Efficient database queries
- [ ] Proper caching where applicable
- [ ] Memory leak prevention

#### 🧪 Testing
- [ ] Unit tests cover new functionality
- [ ] Integration tests for API changes
- [ ] E2E tests for user flows
- [ ] Mocks used appropriately
- [ ] Coverage meets requirements

### 🔄 Review Process

1. **Automated Checks**
   - CI pipeline must pass
   - All tests must pass
   - Coverage requirements met
   - Linting without errors

2. **Code Review**
   - At least 1 approval required
   - Focus on architecture and design
   - Security considerations
   - Performance implications

3. **Manual Testing**
   - Functional testing of changes
   - Integration with existing features
   - User experience validation

4. **Documentation Review**
   - Code documentation adequate
   - User-facing docs updated
   - API documentation current

### 🗣️ Review Guidelines

#### Para Reviewers
- **Ser constructivo**: Ofrecer sugerencias, no solo críticas
- **Explicar el "por qué"**: Justificar solicitudes de cambio
- **Priorizar**: Distinguir entre bloqueadores y sugerencias
- **Ser específico**: Referencias a líneas y archivos concretos

#### Para Autores
- **Responder a todos los comentarios**
- **Hacer cambios en commits separados**
- **Explicar decisiones de diseño**
- **Estar abierto al feedback**

## 🏷️ Conventional Commits

### 📋 Formato Estándar

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### 🎯 Types Permitidos

```bash
feat:     # Nueva funcionalidad
fix:      # Corrección de bug
docs:     # Cambios en documentación
style:    # Cambios de formato (no afectan código)
refactor: # Refactoring (no añade features ni corrige bugs)
test:     # Añadir o corregir tests
chore:    # Cambios en build, CI, etc.
perf:     # Mejoras de performance
ci:       # Cambios en CI/CD
build:    # Cambios en sistema de build
revert:   # Reverter commit previo
```

### 🎨 Scopes Sugeridos

```bash
auth      # Autenticación y autorización
jwt       # JWT token management
oauth     # OAuth2 flows
api       # API endpoints
db        # Database related
security  # Security features
config    # Configuration
deps      # Dependencies
docker    # Docker related
ci        # CI/CD related
docs      # Documentation
test      # Testing
```

### ✅ Ejemplos Correctos

```bash
# Feature
feat(oauth): add PKCE support for authorization code flow

# Bug fix
fix(jwt): resolve memory leak in token generation

# Breaking change
feat(api)!: change token endpoint response format

BREAKING CHANGE: Token endpoint now returns expires_in as number instead of string

# Documentation
docs(readme): add OAuth2 flow examples

# Refactor
refactor(auth): extract validation logic to separate service

# Test
test(oauth): add integration tests for refresh token flow

# Multiple paragraphs
feat(api): add user profile endpoint

This adds a new endpoint to retrieve user profile information
including email, name, and profile picture.

The endpoint requires a valid access token and returns user data
in JSON format.

Closes #123
```

### ❌ Ejemplos Incorrectos

```bash
# ❌ No conventional format
Added OAuth support

# ❌ Too vague
fix: bug fix

# ❌ Wrong type
add: new feature

# ❌ No scope when needed
feat: oauth stuff

# ❌ Not descriptive enough
fix(auth): fix
```

### 🔄 Semantic Versioning

Los commits siguen semantic versioning automático:

- `fix:` → **PATCH** (1.0.0 → 1.0.1)
- `feat:` → **MINOR** (1.0.0 → 1.1.0)  
- `feat!:` o `BREAKING CHANGE:` → **MAJOR** (1.0.0 → 2.0.0)

## 🐛 Reporte de Bugs

### 📝 Template de Bug Report

```markdown
## 🐛 Bug Description
Clear and concise description of the bug.

## 🔄 Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## ✅ Expected Behavior
What you expected to happen.

## ❌ Actual Behavior
What actually happened.

## 🌍 Environment
- OS: [e.g. Ubuntu 22.04]
- Node.js: [e.g. 22.1.0]
- pnpm: [e.g. 10.15.1]
- Docker: [e.g. 24.0.0]

## 📸 Screenshots/Logs
If applicable, add screenshots or log output.

## 🔧 Additional Context
Any other context about the problem.
```

### 🏷️ Bug Labels

```
bug           # General bug
critical      # Critical severity
security      # Security-related bug
performance   # Performance issue
regression    # Previously working feature
documentation # Documentation bug
```

### 🚨 Critical Bugs

Para bugs críticos de seguridad:
1. **NO crear issue público**
2. **Reportar a**: security@jrmdev.org
3. **Incluir**: Detailed steps, impact assessment
4. **Esperar**: Response within 24 hours

## 💡 Solicitudes de Features

### 📋 Template de Feature Request

```markdown
## 🎯 Feature Description
Clear description of the proposed feature.

## 💼 Business Justification
Why is this feature needed? What problem does it solve?

## 📋 Detailed Requirements
- Requirement 1
- Requirement 2
- Requirement 3

## 🎨 Proposed Solution
Describe your preferred solution approach.

## 🔄 Alternatives Considered
Other solutions you've considered.

## 📊 Success Criteria
How will we know this feature is successful?

## 🏷️ Priority
- [ ] High (blocking)
- [ ] Medium (important)  
- [ ] Low (nice to have)

## 📅 Timeline
When would you like to see this implemented?
```

### 🗳️ Feature Voting

- Usa 👍 reactions para votar por features
- Features con más votos tienen mayor prioridad
- Mantainers revisan features mensualmente

### 📋 Feature Labels

```
enhancement     # General enhancement
feature-request # New feature request
oauth          # OAuth2 related feature
security       # Security enhancement
performance    # Performance improvement
api            # API related feature
```

## 🔄 Release Process

### 📦 Semantic Versioning

Seguimos [SemVer](https://semver.org/):

- **MAJOR** (X.0.0): Breaking changes
- **MINOR** (x.Y.0): New features (backwards compatible)
- **PATCH** (x.y.Z): Bug fixes (backwards compatible)

### 🏷️ Release Schedule

- **Major releases**: Cada 6 meses
- **Minor releases**: Cada mes
- **Patch releases**: Según necesidad
- **Security patches**: Inmediato

### 📋 Release Checklist

#### Pre-Release
- [ ] All tests passing
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Security scan completed
- [ ] Performance benchmarks run

#### Release
- [ ] Create release branch
- [ ] Update version in package.json
- [ ] Create GitHub release
- [ ] Publish Docker images
- [ ] Deploy to staging
- [ ] Run smoke tests

#### Post-Release
- [ ] Merge to main
- [ ] Update develop branch
- [ ] Close related issues
- [ ] Communicate release notes
- [ ] Monitor for issues

## ❓ Soporte

### 🆘 Obteniendo Ayuda

#### 💬 GitHub Discussions
Para preguntas generales, ideas, y discusiones:
[GitHub Discussions](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/discussions)

#### 🐛 Issues
Para bugs y feature requests:
[GitHub Issues](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/issues)

#### 📧 Email
Para asuntos sensibles o privados:
- General: support@jrmdev.org
- Security: security@jrmdev.org
- Code of Conduct: conduct@jrmdev.org

### 📚 Recursos Adicionales

#### 📖 Documentación
- [OAuth2 RFC 6749](https://tools.ietf.org/html/rfc6749)
- [PKCE RFC 7636](https://tools.ietf.org/html/rfc7636)  
- [JWT RFC 7519](https://tools.ietf.org/html/rfc7519)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

#### 🛠️ Tools Documentation
- [pnpm Documentation](https://pnpm.io/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)
- [Docker Documentation](https://docs.docker.com/)

#### 🎓 Learning Resources
- [OAuth2 Simplified](https://oauth2simplified.com/)
- [JWT.io](https://jwt.io/)
- [Clean Code by Robert Martin](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)

### 🕐 Response Times

| Type | Response Time |
|------|---------------|
| Security Issues | 24 hours |
| Critical Bugs | 48 hours |
| Bug Reports | 3-5 days |
| Feature Requests | 1 week |
| General Questions | 3-5 days |

### 🌟 Recognition

Contribuidores destacados son reconocidos en:
- **README.md** contributors section
- **Release notes** special thanks
- **GitHub Discussions** community highlights
- **Annual contributor report**

---

## 🙏 Agradecimientos

Gracias por contribuir al ByteBerry OAuth2 Service. Tu participación ayuda a crear un mejor ecosistema de autenticación para todos.

### 🏆 Current Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

### 📞 Contacto

- **Maintainer**: [JRuvalcabaFSD](https://github.com/JRuvalcabaFSD)
- **Project**: [ByteBerry OAuth2](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2)
- **Email**: support@jrmdev.org

---

*¿Alguna pregunta sobre contribuir? ¡No dudes en [abrir una discussion](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/discussions) y te ayudaremos!*

---

*Última actualización: Enero 15, 2025*
