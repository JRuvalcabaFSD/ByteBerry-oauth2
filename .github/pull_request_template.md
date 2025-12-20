# 🔀 Pull Request - ByteBerry Expenses API

## 📋 Description

Brief description of the changes introduced by this PR.

## 🎯 Type of Change

- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📚 Documentation update
- [ ] 🔧 Refactoring (no functional changes)
- [ ] ⚡ Performance improvement
- [ ] 🧪 Test addition or improvement
- [ ] 🏗️ Build/CI improvement
- [ ] 🔒 Security improvement

## 🧪 Testing

- [ ] Tests pass locally with my changes
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] I have tested this change manually (if applicable)
- [ ] Docker build and health checks pass locally

## 📋 Checklist

- [ ] My code follows the Clean Architecture principles of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that cover my changes
- [ ] All new and existing tests pass
- [ ] Any dependent changes have been merged and published
- [ ] My commit messages follow conventional commits format

## 🏗️ Architecture Compliance

- [ ] Changes follow Clean Architecture patterns (Domain → Application → Infrastructure → Presentation)
- [ ] Dependency injection is used appropriately
- [ ] SOLID principles are respected
- [ ] Error handling follows project standards
- [ ] Logging is implemented where appropriate

## 🔗 Related Issues

Closes #(issue_number)
Related to #(issue_number)

## 📊 Screenshots/Output (if applicable)

Add screenshots, logs, or terminal output to help explain your changes.

## 🚀 Deployment Notes

Any special deployment considerations or steps required.

## ⚠️ Breaking Changes (if applicable)

List any breaking changes and migration steps required.

---

### 📝 Commit Message Format

This PR should be merged with a conventional commit message:

```
type(scope): description

Examples:
- feat(expenses): add CRUD operations for expense management
- fix(health): resolve deep health check dependency validation
- docs(readme): update API documentation
- test(container): add comprehensive DI container tests
- chore(deps): update dependencies to latest versions
```

### 🔍 CI/CD Pipeline Status

The following checks will run automatically:

- ✅ **Code Quality:** ESLint + TypeScript (Prettier included in ESLint)
- ✅ **Build:** TypeScript compilation
- ✅ **Tests:** Jest with coverage reporting
- ✅ **Security:** pnpm audit for vulnerabilities
- ✅ **Docker:** Multi-arch image build verification

### 📋 Manual Testing Commands

```bash
# Install dependencies
pnpm install

# Run all checks locally
pnpm ci:all

# Test Docker build
pnpm docker:build && pnpm docker:test
```
