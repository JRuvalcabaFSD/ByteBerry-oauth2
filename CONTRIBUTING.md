# 🤝 Contributing to ByteBerry OAuth2 Service

¡Gracias por tu interés en contribuir al proyecto ByteBerry! Este documento proporciona las pautas y procesos para contribuir efectivamente al servicio OAuth2.

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [Empezando](#empezando)
- [Proceso de Desarrollo](#proceso-de-desarrollo)
- [Arquitectura y Estándares](#arquitectura-y-estándares)
- [Testing](#testing)
- [Documentación](#documentación)
- [Proceso de Pull Request](#proceso-de-pull-request)
- [Versionado y Releases](#versionado-y-releases)

## 🤝 Código de Conducta

### Nuestro Compromiso
Este es un proyecto educativo enfocado en el aprendizaje de microservicios, Clean Architecture y buenas prácticas de desarrollo. Mantenemos un ambiente respetuoso y colaborativo.

### Estándares
- Usar lenguaje inclusivo y respetuoso
- Respetar diferentes puntos de vista y experiencias
- Aceptar críticas constructivas de manera profesional
- Enfocar en lo que es mejor para la comunidad
- Mostrar empatía hacia otros miembros

## 🚀 Empezando

### Prerrequisitos
- **Node.js**: 22.x LTS
- **pnpm**: 10.15.1 (obligatorio)
- **Docker**: 24.x+
- **Git**: 2.40+
- **PostgreSQL**: 15+ (para desarrollo local)

### Setup del Entorno de Desarrollo

```bash
# 1. Fork el repositorio
# 2. Clonar tu fork
git clone https://github.com/[tu-usuario]/ByteBerry-oauth2.git
cd ByteBerry-oauth2

# 3. Agregar upstream remoto
git remote add upstream https://github.com/JRuvalcabaFSD/ByteBerry-oauth2.git

# 4. Instalar dependencias
pnpm install

# 5. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones locales

# 6. Ejecutar migraciones
pnpm prisma:migrate

# 7. Ejecutar tests
pnpm test

# 8. Iniciar servidor de desarrollo
pnpm dev
```

### Verificación del Setup

```bash
# Verificar que el servicio esté funcionando
curl http://localhost:4000/health

# Verificar linting
pnpm lint

# Verificar build
pnpm build
```

## 🔄 Proceso de Desarrollo

### Git Flow Simplificado
Usamos un Git Flow simplificado con dos ramas principales:
- **`main`**: Código estable y releases
- **`develop`**: Integración continua y nuevas características

### Workflow de Desarrollo

1. **Sincronizar con upstream**
   ```bash
   git checkout develop
   git pull upstream develop
   ```

2. **Crear rama de feature**
   ```bash
   git checkout -b feature/[T001]-descripcion-breve
   # Formato: feature/[ID-TAREA]-descripcion-kebab-case
   ```

3. **Desarrollo iterativo**
   ```bash
   # Hacer cambios
   # Ejecutar tests
   pnpm test
   
   # Verificar linting
   pnpm lint:fix
   
   # Commit con formato convencional
   git commit -m "feat(auth): implement JWT token generation [T001]"
   ```

4. **Push y PR**
   ```bash
   git push origin feature/[T001]-descripcion-breve
   # Crear PR desde GitHub UI
   ```

### Conventional Commits (OBLIGATORIO)

Formato: `<type>(<scope>): <description> [<task-id>]`

#### Types
- **feat**: Nueva funcionalidad
- **fix**: Corrección de bug
- **docs**: Solo documentación
- **style**: Cambios de formato (no afectan lógica)
- **refactor**: Refactorización sin cambio de funcionalidad
- **test**: Agregar o corregir tests
- **chore**: Mantenimiento (deps, config, etc.)

#### Scopes Comunes
- **auth**: Lógica de autenticación
- **jwt**: Operaciones JWT
- **db**: Base de datos
- **api**: Endpoints y controllers
- **config**: Configuración
- **container**: Dependency Injection
- **tests**: Testing

#### Ejemplos
```bash
feat(auth): implement authorization code flow [T002]
fix(jwt): resolve token expiration validation [T008] 
docs(api): add JWKS endpoint documentation [T010]
test(container): add DI container unit tests [T011]
```

## 🏗️ Arquitectura y Estándares

### Clean Architecture (OBLIGATORIO)
```
src/
├── config/           # Configuraciones
├── interfaces/       # Contratos/Interfaces
├── domain/          # Entidades y lógica de negocio
├── application/     # Casos de uso
├── infrastructure/  # Implementaciones técnicas
├── presentation/    # Controllers y routes
├── shared/         # Utilidades transversales
└── container/      # Dependency Injection
```

### Principios SOLID (OBLIGATORIO)
- **SRP**: Cada clase una responsabilidad
- **OCP**: Extensible sin modificar código existente
- **LSP**: Implementaciones intercambiables
- **ISP**: Interfaces específicas, no genéricas
- **DIP**: Depender de abstracciones

### Naming Conventions (OBLIGATORIO)
- **Files**: kebab-case (`user-repository.ts`)
- **Classes**: PascalCase (`UserRepository`)
- **Interfaces**: PascalCase con prefijo I (`IUserRepository`)
- **Methods/Variables**: camelCase (`createUser`)
- **Constants**: UPPER_SNAKE_CASE (`DEFAULT_PORT`)

### Dependency Injection Pattern (OBLIGATORIO)

#### Registrar Dependencias
```typescript
// En container/bootstrap.ts
container.registerSingleton('Config', () => new Config());
container.registerSingleton('Logger', () => new LoggerService(
  container.resolve('Config')
));
container.register('UserRepository', () => new UserRepository(
  container.resolve('DatabaseConnection')
));
```

#### Usar Constructor Injection
```typescript
export class AuthController implements IAuthController {
  constructor(
    @inject('AuthorizeUserUseCase') private authorizeUser: IAuthorizeUser,
    @inject('Logger') private logger: ILogger
  ) {}
}
```

### Error Handling Pattern (OBLIGATORIO)
```typescript
// Formato de error estándar
{
  "error": "ERROR_CODE",
  "message": "Human readable message",
  "timestamp": "2025-01-01T12:00:00Z",
  "requestId": "req_uuid"
}
```

## 🧪 Testing

### Estrategia de Testing
- **Unit Tests**: Domain y Application layers (>80% cobertura)
- **Integration Tests**: Infrastructure layer
- **Contract Tests**: Pact con otros servicios
- **E2E Tests**: Flujos OAuth2 completos

### Ejecutar Tests

```bash
# Todos los tests
pnpm test

# Watch mode
pnpm test:watch