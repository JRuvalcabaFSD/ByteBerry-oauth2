# Contributing Guidelines

Thank you for considering contributing to ByteBerry OAuth2!

## How to Contribute
1. Fork the repository.
2. Create a new branch (`git checkout -b feat/my-feature`).
3. Make your changes following Clean Architecture & SOLID principles.
4. Write tests (unit/integration as appropriate).
5. Ensure all checks pass (`pnpm lint && pnpm test`).
6. Commit using [Conventional Commits](https://www.conventionalcommits.org/).
7. Push to your branch and open a Pull Request.

## Development Setup
- Node.js 22+
- pnpm 10.15.1
- Docker (multi-arch enabled)

## Commit Messages
- Format: `type(scope): description`
- Types: feat, fix, docs, style, refactor, test, chore
- Example: `feat(auth): add PKCE validation`

## Code of Conduct
Please follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## License
By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
