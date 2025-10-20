# Contributing to Kryzon CTF Platform

Thank you for your interest in contributing to Kryzon! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Set up the development environment following the README instructions
4. Create a new branch for your feature or bugfix

## Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/kryzon.git
cd kryzon

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
npm run dev
```

## Code Style

- Use TypeScript for all new code
- Follow the existing code style and patterns
- Use meaningful variable and function names
- Add comments for complex logic
- Keep components focused and reusable

## Commit Guidelines

- Use clear, descriptive commit messages
- Follow conventional commits format:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation changes
  - `style:` for code style changes
  - `refactor:` for code refactoring
  - `test:` for adding tests

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes with appropriate tests
3. Update documentation if needed
4. Ensure all tests pass and code builds successfully
5. Submit a pull request with a clear description of changes

## Feature Requests

- Open an issue with the "feature request" label
- Describe the feature and its use case
- Discuss implementation approaches before starting work

## Bug Reports

- Check existing issues before creating a new one
- Provide clear steps to reproduce the bug
- Include system information and error messages
- Add screenshots if applicable

## Code Review

- All contributions require code review
- Address feedback promptly and constructively
- Be open to suggestions and improvements

## Questions?

- Open an issue for general questions
- Contact the maintainer for sensitive matters

Thank you for contributing to Kryzon!