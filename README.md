# ByteBerry OAuth2 Service

Este repositorio contiene el servicio **OAuth2** del sistema de gestión de gastos **ByteBerry**.

## 📌 Descripción
Servicio encargado de la **autenticación y autorización** en el ecosistema ByteBerry, implementado con **TypeScript**, **Node.js** y **Clean Architecture**.

## 🚀 Características iniciales (F0)
- Arquitectura limpia (Domain, Application, Infrastructure, Presentation, Shared, Config, Interfaces)
- Endpoint `/health` básico
- Configuración de entornos con **dotenv 16.4.5 + env-var**
- Contenedor **Dependency Injection (DI)** custom
- Dockerfile multi-stage para amd64 y arm64
- CI/CD inicial con GitHub Actions (lint, build, test, buildx multi-arch)

## 📂 Estructura de carpetas
```
src/
 ├── domain/
 ├── application/
 ├── infrastructure/
 ├── presentation/
 ├── shared/
 ├── config/
 └── interfaces/
```

## 📜 Documentación
- [Contributing](./CONTRIBUTING.md)
- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [License](./LICENSE)

## 🛠️ Instalación y uso
```bash
# Instalar dependencias
yarn install --frozen-lockfile

# Variables de entorno
cp .env.example .env

# Compilar y correr
yarn build
yarn start
```

## 🐳 Docker
```bash
docker buildx build --platform linux/amd64,linux/arm64 -t byteberry/oauth2 .
```

## 📄 Licencia
Este proyecto está bajo la licencia [MIT](./LICENSE).
