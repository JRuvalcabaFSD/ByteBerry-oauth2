# Contributing to ByteBerry OAuth2

¡Gracias por tu interés en contribuir a ByteBerry OAuth2! Este documento proporciona pautas y procedimientos para contribuir al proyecto.

## Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [Cómo Contribuir](#cómo-contribuir)
- [Configuración del Entorno](#configuración-del-entorno)
- [Flujo de Desarrollo](#flujo-de-desarrollo)
- [Estándares de Código](#estándares-de-código)
- [Conventional Commits](#conventional-commits)
- [Testing](#testing)
- [Pull Requests](#pull-requests)
- [Arquitectura del Proyecto](#arquitectura-del-proyecto)

## Código de Conducta

Este proyecto se adhiere a los estándares de respeto mutuo y colaboración profesional. Esperamos que todos los contribuyentes:

- Sean respetuosos y constructivos en las comunicaciones
- Proporcionen feedback útil y específico
- Enfoquen las críticas en el código, no en las personas
- Colaboren de manera inclusiva

## Cómo Contribuir

### Tipos de Contribuciones

- **Bug Reports**: Reporta errores usando GitHub Issues
- **Feature Requests**: Propón nuevas funcionalidades
- **Code Contributions**: Implementa features o arregla bugs
- **Documentation**: Mejora la documentación existente
- **Testing**: Añade o mejora tests

### Proceso de Contribución

1. **Fork** el repositorio
2. **Clone** tu fork localmente
3. **Crea una branch** para tu contribución
4. **Implementa** tus cambios
5. **Ejecuta tests** y verifica que pasen
6. **Commit** tus cambios usando Conventional Commits
7. **Push** a tu fork
8. **Abre un Pull Request**

## Configuración del Entorno

### Prerequisitos

- **Node.js**: Version 22 o superior
- **pnpm**: Version 10.15.1 (requerida)
- **Docker**: Para testing multi-arch
- **Git**: Para control de versiones

### Instalación

```bash
# 1. Clone el repositorio
git clone https://github.com/JRuvalcabaFSD/ByteBerry-oauth2.git
cd ByteBerry-oauth2

# 2. Instala dependencias
pnpm install

# 3. Copia variables de entorno
cp .env.example .env

# 4. Ejecuta en modo desarrollo
pnpm dev
```

### Verificación de Instalación

```bash
# Verifica que todo funcione
pnpm lint          # Debe pasar sin errores
pnpm build         # Debe compilar correctamente
pnpm test          # Debe ejecutar tests
curl http://localhost:4000/health  # Debe retornar 200
```

## Flujo de Desarrollo

### Branch Strategy

- **main**: Rama de producción, protegida
- **develop**: Rama de desarrollo (si existe)
- **feature/**: Nuevas funcionalidades
- **fix/**: Corrección de bugs
- **chore/**: Tareas de mantenimiento

### Naming Convention

```bash
# Features
feature/auth-middleware
feature/jwt-validation

# Bug fixes
fix/health-endpoint-timeout
fix/container-resolution-error

# Chores
chore/update-dependencies
chore/improve-documentation
```

## Estándares de Código

### Principios Arquitectónicos

Este proyecto sigue **Clean Architecture** con **principios SOLID**:

- **Single Responsibility**: Cada clase tiene una responsabilidad
- **Open/Closed**: Abierto a extensión, cerrado a modificación
- **Liskov Substitution**: Las implementaciones son intercambiables
- **Interface Segregation**: Interfaces específicas y granulares
- **Dependency Inversion**: Dependencias hacia abstracciones

### Estructura de Dependencias

```
Presentation → Application → Domain
Infrastructure → Application → Domain
```

**NUNCA:**
- Domain no puede depender de capas externas
- Application no puede depender de Infrastructure o Presentation

### Naming Conventions

```typescript
// Files: kebab-case
user-repository.ts
create-user-use-case.ts

// Classes: PascalCase
export class UserRepository { }

// Interfaces: PascalCase con prefijo I
export interface IUserRepository { }

// Methods/Variables: camelCase
const userName = 'john';
getUserById()

// Constants: UPPER_SNAKE_CASE
const DEFAULT_PORT = 4000;

// Environment Variables: UPPER_SNAKE_CASE
PORT=4000
LOG_LEVEL=info
```

### Code Style

```typescript
// ✅ CORRECTO: Dependency Injection
export class CreateUserUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly logger: ILogger
  ) {}
}

// ❌ INCORRECTO: Violación DIP
export class CreateUserUseCase {
  constructor() {
    this.userRepo = new PostgreSQLUserRepository(); // Dependencia concreta
  }
}
```

### Error Handling

```typescript
// Formato estándar de respuesta de error
interface ErrorResponse {
  error: string;           // ERROR_CODE
  message: string;         // Mensaje legible
  timestamp: string;       // ISO 8601
  requestId: string;       // UUID para tracking
}

// Excepciones de dominio
export class UserNotFoundError extends DomainError {
  constructor(userId: string) {
    super('USER_NOT_FOUND', `User with ID ${userId} not found`);
  }
}
```

## Conventional Commits

### Formato

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

- **feat**: Nueva funcionalidad
- **fix**: Corrección de bug
- **docs**: Cambios en documentación
- **style**: Cambios de formato (no afectan lógica)
- **refactor**: Refactoring de código
- **test**: Añadir o corregir tests
- **chore**: Tareas de mantenimiento

### Scopes

- **auth**: Autenticación y autorización
- **health**: Health checks y monitoring
- **container**: Dependency Injection Container
- **config**: Configuración
- **logging**: Sistema de logs
- **docker**: Configuración Docker
- **ci**: CI/CD pipelines

### Ejemplos

```bash
feat(auth): add JWT token validation middleware
fix(health): resolve database connection timeout
docs(readme): update installation instructions
test(container): add unit tests for DI resolution
chore(deps): update typescript to 5.3.0
```

### Breaking Changes

```bash
feat(auth)!: change JWT payload structure

BREAKING CHANGE: JWT payload now includes 'roles' array instead of 'role' string
```

## Testing

### Testing Strategy

```
Domain Layer:     >90% coverage
Application Layer: >85% coverage
Infrastructure:   >75% coverage
Presentation:     >70% coverage
```

### Test Types

#### Unit Tests
```typescript
// Domain entities y services
describe('User Entity', () => {
  it('should_CreateUser_When_ValidEmailProvided', () => {
    // Given
    const email = new Email('test@example.com');
    
    // When
    const user = new User(email);
    
    // Then
    expect(user.getEmail()).toEqual(email);
  });
});
```

#### Integration Tests
```typescript
// Infrastructure layer
describe('PostgreSQLUserRepository', () => {
  let repository: UserRepository;
  let testDb: Database;
  
  beforeEach(async () => {
    testDb = await createTestDatabase();
    repository = new PostgreSQLUserRepository(testDb);
  });
  
  afterEach(async () => {
    await cleanupTestDatabase(testDb);
  });
});
```

### Running Tests

```bash
# Todos los tests
pnpm test

# Tests en modo watch
pnpm test:watch

# Coverage report
pnpm test:coverage

# Tests específicos
pnpm test user-repository
```

## Pull Requests

### PR Template

```markdown
## Descripción
Breve descripción de los cambios implementados.

## Tipo de Cambio
- [ ] Bug fix (cambio que arregla un issue)
- [ ] Nueva funcionalidad (cambio que añade funcionalidad)
- [ ] Breaking change (cambio que rompe compatibilidad)
- [ ] Documentación

## Testing
- [ ] Tests unitarios añadidos/actualizados
- [ ] Tests de integración añadidos/actualizados
- [ ] Tests manuales ejecutados

## Checklist
- [ ] Mi código sigue los estándares del proyecto
- [ ] He ejecutado self-review de mi código
- [ ] He comentado código complejo o difícil de entender
- [ ] He actualizado documentación si es necesario
- [ ] Mis cambios no generan nuevos warnings
- [ ] Tests existentes siguen pasando
- [ ] Nuevos tests cubren mis cambios
```

### PR Guidelines

- **Una responsabilidad por PR**: Cada PR debe tener un propósito claro
- **Tamaño manejable**: PRs grandes deben dividirse
- **Descripción clara**: Explica qué, por qué y cómo
- **Tests incluidos**: Nuevas funcionalidades deben incluir tests
- **Documentation updated**: Actualiza docs si es necesario

### Review Process

1. **Automated checks**: CI debe pasar
2. **Code review**: Al menos 1 approval requerido
3. **Manual testing**: Verificar funcionalidad si es necesario
4. **Merge**: Squash merge preferido

## Arquitectura del Proyecto

### Clean Architecture Layers

```
src/
├── config/           # Configuración de la aplicación
├── interfaces/       # Contratos entre capas
├── domain/          # Lógica de negocio pura
│   ├── entities/    # Entidades de dominio
│   ├── services/    # Servicios de dominio
│   └── value-objects/ # Value objects
├── application/     # Casos de uso
│   ├── use-cases/   # Implementación de casos de uso
│   └── dtos/        # Data Transfer Objects
├── infrastructure/ # Implementaciones técnicas
│   ├── database/    # Persistencia
│   ├── external/    # Servicios externos
│   └── logging/     # Sistema de logs
├── presentation/    # Interfaz HTTP
│   ├── controllers/ # Controllers HTTP
│   ├── routes/      # Definición de rutas
│   └── middleware/  # Middleware HTTP
├── shared/          # Utilidades compartidas
│   ├── errors/      # Excepciones personalizadas
│   ├── utils/       # Funciones auxiliares
│   └── constants/   # Constantes
└── container/       # Dependency Injection Container
```

### Dependency Injection Container

```typescript
// Registro de dependencias
container.registerSingleton('Config', () => new ConfigService());
container.registerSingleton('Logger', () => new LoggerService());
container.register('UserRepository', () => 
  new PostgreSQLUserRepository(container.resolve('DatabaseConnection'))
);

// Resolución en controllers
export class UserController {
  constructor(
    @inject('CreateUserUseCase') private createUser: CreateUserUseCase
  ) {}
}
```

## Deployment y Docker

### Docker Multi-Arch

```dockerfile
# Build para ARM64 y AMD64
FROM node:lts-slim AS builder

# Usuario no-root obligatorio
FROM node:lts-slim AS runtime
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs
```

### Environment Variables

```bash
# Desarrollo
NODE_ENV=development
PORT=4000
LOG_LEVEL=debug

# Producción
NODE_ENV=production
PORT=4000
LOG_LEVEL=info
```

## Recursos Adicionales

### Enlaces Útiles

- **Clean Architecture**: [Uncle Bob's Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- **SOLID Principles**: [SOLID Principles Explained](https://www.digitalocean.com/community/conceptual_articles/s-o-l-i-d-the-first-five-principles-of-object-oriented-design)
- **Conventional Commits**: [conventionalcommits.org](https://www.conventionalcommits.org/)
- **TypeScript**: [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Contacto

- **GitHub Issues**: Para bugs y feature requests
- **Email**: support@jrmdev.org
- **Project Lead**: JRuvalcabaFSD

---

¡Gracias por contribuir a ByteBerry OAuth2! Tu participación hace que este proyecto sea mejor para todos.