# 🔐 ByteBerry OAuth2 Service

> **Servidor OAuth2 con Authorization Code + PKCE, JWT RS256, refresh tokens y JWKS**  
> **Implementa Clean Architecture con TypeScript, PostgreSQL y Docker multi-arch para Raspberry Pi 5**


[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/JRuvalcabaFSD/ByteBerry-OAuth2/pr-ci.yml?logo=github&logoColor=white&label=Tests)](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/actions)
[![GitHub Tag](https://img.shields.io/github/v/tag/JRuvalcabaFSD/ByteBerry-OAuth2?sort=semver&logo=semanticrelease&logoColor=White&label=Versi%C3%B3n)](https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2/tags)
[![Node](https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen.svg?logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?logo=open-source-initiative&logoColor=white)](LICENSE)
[![Docker Image Version](https://img.shields.io/docker/v/jruvalcabafsd/byteberry-oauth2?sort=semver&logo=docker&logoColor=white&label=Image%20Version)](https://hub.docker.com/r/jruvalcabafsd/byteberry-oauth2)

**Current Phase:** F0 (Bootstrap) ✅ Complete | **Next:** F1 (OAuth2 básico) 📋 Planned
---

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Project](#running-the-project)
- [Available Scripts](#available-scripts)
- [Testing](#testing)
- [Docker](#docker)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [Troubleshooting](#troubleshooting)

---

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed:

| Tool | Version | Required | Download |
|------|---------|----------|----------|
| **Node.js** | 22.x or higher | ✅ Yes | [Download](https://nodejs.org/) |
| **pnpm** | 10.15.1 or higher | ✅ Yes | [Install Guide](https://pnpm.io/installation) |
| **Git** | Latest | ✅ Yes | [Download](https://git-scm.com/) |
| **Docker** | Latest | ⚪ Optional | [Download](https://www.docker.com/) |

### Verify Installation

```bash
# Check Node.js version
node --version
# Should output: v22.x.x or higher

# Check pnpm version
pnpm --version
# Should output: 10.15.1 or higher

# Check Git version
git --version

# Check Docker version (optional)
docker --version
```

---

## 📥 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/JRuvalcabaFSD/ByteBerry-oauth2.git
cd ByteBerry-oauth2
```

### 2. Install Dependencies

```bash
pnpm install
```

This will install all required dependencies listed in `package.json`.

**Expected output:**
```
Lockfile is up to date, resolution step is skipped
Packages: +XXX
++++++++++++++++++++++++++++++++++++++++++++++++
Progress: resolved XXX, reused XXX, downloaded 0, added XXX, done
Done in Xs
```

---

## 🔧 Configuration

### 1. Create Environment File

Copy the example environment file:

```bash
cp .env.example .env
```

### 2. Configure Environment Variables

Edit `.env` with your preferred text editor:

```bash
# Using nano
nano .env

# Using vim
vim .env

# Using VS Code
code .env
```

### 3. Environment Variables Reference

#### **Development Configuration (.env)**

```bash
# Application
NODE_ENV=development
PORT=4000

# Logging
LOG_LEVEL=debug

# JWT (F1+ - Not required for F0)
# JWT_PRIVATE_KEY=
# JWT_PUBLIC_KEY=

# Database (F2+ - Not required for F0)
# DATABASE_URL=postgresql://user:password@localhost:5432/oauth2_dev
```

#### **Production Configuration (.env.production)**

```bash
# Application
NODE_ENV=production
PORT=4000

# Logging
LOG_LEVEL=info

# JWT (F1+)
JWT_PRIVATE_KEY=your_private_key_here
JWT_PUBLIC_KEY=your_public_key_here

# Database (F2+)
DATABASE_URL=postgresql://user:password@db_host:5432/oauth2_prod
```

### Environment Variables Explained

| Variable | Description | Values | Default |
|----------|-------------|--------|---------|
| `NODE_ENV` | Runtime environment | `development`, `production`, `test` | `development` |
| `PORT` | HTTP server port | `1024-65535` | `4000` |
| `LOG_LEVEL` | Logging verbosity | `debug`, `info`, `warn`, `error` | `info` |
| `JWT_PRIVATE_KEY` | RSA private key (F1+) | Base64 string | - |
| `JWT_PUBLIC_KEY` | RSA public key (F1+) | Base64 string | - |
| `DATABASE_URL` | PostgreSQL connection (F2+) | Connection string | - |

---

## 🚀 Running the Project

### Development Mode

Start the development server with hot-reload:

```bash
pnpm dev
```

**Expected output:**
```
[INFO] Server started on port 4000
[INFO] Environment: development
[INFO] Log level: debug
```

The server will automatically restart when you make changes to the code.

**Access the service:**
- Health check: http://localhost:4000/health
- Deep health: http://localhost:4000/health/deep

### Production Mode

Build and run the production version:

```bash
# 1. Build the project
pnpm build

# 2. Start production server
pnpm start
```

**Expected output:**
```
[INFO] Server started on port 4000
[INFO] Environment: production
[INFO] Log level: info
```

### Verify It's Running

```bash
# Check health endpoint
curl http://localhost:4000/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2025-12-06T...",
  "service": "oauth2-service",
  "version": "1.0.0"
}

# Check deep health
curl http://localhost:4000/health/deep

# Expected response:
{
  "status": "healthy",
  "timestamp": "2025-12-06T...",
  "service": "oauth2-service",
  "version": "1.0.0",
  "dependencies": [
    {
      "name": "config",
      "status": "healthy",
      "responseTime": 0
    }
  ]
}
```

---

## 📜 Available Scripts

All scripts are defined in `package.json` and run with `pnpm`:

### Development

```bash
# Start development server with hot-reload
pnpm dev

# Start development server with debugging
pnpm dev:debug
```

### Building

```bash
# Build for production
pnpm build

# Clean build artifacts
pnpm clean

# Clean and rebuild
pnpm clean && pnpm build
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run only unit tests
pnpm test:unit

# Run only integration tests
pnpm test:integration

# Run only e2e tests
pnpm test:e2e
```

### Code Quality

```bash
# Lint code
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code with Prettier
pnpm format

# Type check
pnpm type-check
```

### Documentation

```bash
# Generate TypeDoc documentation
pnpm docs:build

# Serve documentation locally
pnpm docs:serve
```

### Production

```bash
# Start production server (after build)
pnpm start

# Start with PM2 (process manager)
pnpm start:pm2

# Stop PM2 instance
pnpm stop:pm2
```

---

## 🧪 Testing

### Run All Tests

```bash
pnpm test
```

**Expected output:**
```
✓ src/__tests__/unit/container/container.test.ts (25 tests)
✓ src/__tests__/unit/shared/logger.test.ts (15 tests)
✓ src/__tests__/integration/health.test.ts (10 tests)

Test Files  25 passed (25)
Tests  400+ passed (400+)
Duration  5.23s

% Coverage report from c8
------------------------------|---------|----------|---------|---------|
File                          | % Stmts | % Branch | % Funcs | % Lines |
------------------------------|---------|----------|---------|---------|
All files                     |   85.2  |   82.7   |  88.4   |  86.1   |
------------------------------|---------|----------|---------|---------|
```

### Run Specific Test Suites

```bash
# Unit tests only
pnpm test:unit

# Integration tests only
pnpm test:integration

# Specific file
pnpm test src/__tests__/unit/container/container.test.ts

# With pattern
pnpm test container
```

### Coverage Report

```bash
# Generate coverage report
pnpm test:coverage

# Open HTML coverage report
open coverage/index.html  # macOS
xdg-open coverage/index.html  # Linux
start coverage/index.html  # Windows
```

### Watch Mode (Development)

```bash
# Re-run tests on file changes
pnpm test:watch
```

---

## 🐳 Docker

### Quick Start with Docker

```bash
# Build image
docker build -t byteberry-oauth2 .

# Run container
docker run -p 4000:4000 --env-file .env byteberry-oauth2

# Access service
curl http://localhost:4000/health
```

### Multi-Architecture Build

Build for both AMD64 (x86_64) and ARM64 (Raspberry Pi):

```bash
# Create buildx builder (first time only)
docker buildx create --name mybuilder --use

# Build for multiple platforms
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t jruvalcabafsd/byteberry-oauth2:latest \
  --push \
  .
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  oauth2:
    image: jruvalcabafsd/byteberry-oauth2:latest
    container_name: byteberry-oauth2
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - PORT=4000
      - LOG_LEVEL=info
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

Run with Docker Compose:

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and start
docker-compose up -d --build
```

### Docker Commands Reference

```bash
# Build
docker build -t byteberry-oauth2:dev .

# Run detached
docker run -d -p 4000:4000 --name oauth2 byteberry-oauth2:dev

# View logs
docker logs oauth2
docker logs -f oauth2  # Follow logs

# Stop container
docker stop oauth2

# Remove container
docker rm oauth2

# Execute command in container
docker exec -it oauth2 /bin/sh

# Inspect container
docker inspect oauth2
```

---

## 📁 Project Structure

```
ByteBerry-oauth2/
├── src/
│   ├── bootstrap/              # Application initialization
│   │   ├── bootstrap.ts        # Main bootstrap logic
│   │   └── shutdown.ts         # Graceful shutdown
│   ├── config/                 # Configuration management
│   │   ├── env.config.ts       # Environment variables
│   │   └── index.ts
│   ├── container/              # Dependency Injection
│   │   ├── container.ts        # DI Container implementation
│   │   ├── tokens.ts           # Injection tokens
│   │   ├── registry.ts         # Service registration
│   │   └── index.ts
│   ├── domain/                 # Business logic
│   │   ├── entities/           # Domain entities
│   │   ├── value-objects/      # Value objects
│   │   ├── services/           # Domain services
│   │   └── index.ts
│   ├── application/            # Use cases
│   │   ├── use-cases/          # Application use cases
│   │   ├── dtos/               # Data Transfer Objects
│   │   ├── interfaces/         # Application interfaces
│   │   └── index.ts
│   ├── infrastructure/         # External integrations
│   │   ├── database/           # Database connections (F2+)
│   │   ├── repositories/       # Repository implementations
│   │   ├── http-server/        # HTTP server (Express)
│   │   └── index.ts
│   ├── presentation/           # HTTP layer
│   │   ├── controllers/        # Request handlers
│   │   ├── routes/             # Route definitions
│   │   ├── middleware/         # Express middleware
│   │   └── index.ts
│   ├── shared/                 # Cross-cutting concerns
│   │   ├── errors/             # Custom errors
│   │   ├── decorators/         # Logging decorators
│   │   ├── utils/              # Utilities
│   │   └── index.ts
│   ├── interfaces/             # TypeScript types
│   │   ├── config/
│   │   ├── logger/
│   │   ├── http/
│   │   └── index.ts
│   └── main.ts                 # Entry point
├── __tests__/                  # Test suites
│   ├── unit/                   # Unit tests (70%)
│   ├── integration/            # Integration tests (20%)
│   ├── e2e/                    # E2E tests (10%)
│   └── setup.ts                # Test setup
├── dist/                       # Compiled output (generated)
├── coverage/                   # Coverage reports (generated)
├── docs/                       # TypeDoc output (generated)
├── .env.example                # Example environment file
├── .env                        # Your environment (not in git)
├── .gitignore                  # Git ignore rules
├── .editorconfig               # Editor configuration
├── .eslintrc.js                # ESLint configuration
├── .prettierrc                 # Prettier configuration
├── tsconfig.json               # TypeScript configuration
├── vitest.config.ts            # Vitest configuration
├── Dockerfile                  # Docker image definition
├── docker-compose.yml          # Docker Compose config
├── package.json                # Dependencies and scripts
├── pnpm-lock.yaml              # Lock file
└── README.md                   # This file
```

---

## 📚 Documentation

### TypeDoc API Documentation

**📖 [View Full Documentation](https://byteberry.jrmdev.org/docs/oauth2/)**

Generate documentation locally:

```bash
# Build TypeDoc documentation
pnpm docs:build

# Serve documentation at http://localhost:3000
pnpm docs:serve
```

### Additional Documentation

- **[Technical Specification](./Ficha_técnica.md)** - Complete technical details
- **[Architecture Guide](./ARQUITECTURA_NETWORKING.md)** - System architecture
- **[Barrel Exports Guide](./GUIA_BARREL_EXPORTS.md)** - Import/export patterns
- **[Roadmap](./Roadmap-ByteBerry.md)** - Project phases (F0-F10)
- **[Project State](./PROJECT_STATE.md)** - Current status
- **[Code State](./CODE_STATE.md)** - Implementation details

---

## 🐛 Troubleshooting

### Common Issues

#### ❌ Port 4000 already in use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::4000
```

**Solution:**
```bash
# Find process using port 4000
lsof -i :4000  # macOS/Linux
netstat -ano | findstr :4000  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or use a different port
PORT=4001 pnpm dev
```

#### ❌ pnpm not found

**Error:**
```bash
pnpm: command not found
```

**Solution:**
```bash
# Install pnpm globally
npm install -g pnpm@10.15.1

# Verify installation
pnpm --version
```

#### ❌ Node version mismatch

**Error:**
```
Error: The engine "node" is incompatible with this module
```

**Solution:**
```bash
# Check your Node version
node --version

# Install Node 22.x from https://nodejs.org/
# Or use nvm:
nvm install 22
nvm use 22
```

#### ❌ TypeScript compilation errors

**Error:**
```
TSError: ⨯ Unable to compile TypeScript
```

**Solution:**
```bash
# Clean and reinstall
pnpm clean
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Rebuild
pnpm build
```

#### ❌ Tests failing

**Solution:**
```bash
# Clear test cache
pnpm test:clear-cache

# Run tests with verbose output
pnpm test -- --reporter=verbose

# Run single test file
pnpm test src/__tests__/unit/container/container.test.ts
```

#### ❌ Docker build fails

**Solution:**
```bash
# Clear Docker cache
docker builder prune

# Build without cache
docker build --no-cache -t byteberry-oauth2 .

# Check Docker daemon
docker info
```

### Getting Help

If you encounter issues not listed here:

1. **Check existing issues:** [GitHub Issues](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/issues)
2. **Create new issue:** Provide error messages, environment details, and steps to reproduce
3. **Email support:** support@jrmdev.org

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

### Quick Contribution Guide

1. Fork the repository
2. Create feature branch: `git checkout -b feature/my-feature`
3. Make your changes with tests
4. Run quality checks:
   ```bash
   pnpm lint
   pnpm test
   pnpm build
   ```
5. Commit using Conventional Commits:
   ```bash
   git commit -m "feat(auth): add PKCE validation"
   ```
6. Push and create Pull Request to `develop`

### Commit Convention

```
feat: New feature
fix: Bug fix
docs: Documentation changes
test: Test updates
refactor: Code refactoring
chore: Maintenance tasks
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🔗 Related Projects

- **[ByteBerry-Expenses](https://github.com/JRuvalcabaFSD/ByteBerry-Expenses)** - Expenses API
- **[ByteBerry-BFF](https://github.com/JRuvalcabaFSD/ByteBerry-BFF)** - Backend for Frontend
- **[ByteBerry-Frontend](https://github.com/JRuvalcabaFSD/ByteBerry-Frontend)** - React UI
- **[ByteBerry-infra](https://github.com/JRuvalcabaFSD/ByteBerry-infra)** - Infrastructure

---

<div align="center">

**[Documentation](https://byteberry.jrmdev.org/docs/oauth2/)** • 
**[Issues](https://github.com/JRuvalcabaFSD/ByteBerry-oauth2/issues)** • 
**[Roadmap](./Roadmap-ByteBerry.md)**

Built with ❤️ for learning by [JRuvalcabaFSD](https://github.com/JRuvalcabaFSD)

</div>
