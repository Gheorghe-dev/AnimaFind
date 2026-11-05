# 🤝 Contributing to AnimaFind

Thank you for your interest in contributing to **AnimaFind (Critter Codex)**! We welcome bug reports, gameplay enhancements, accessibility improvements, and documentation updates.

---

## 🧭 Code of Conduct

All contributors and maintainers are expected to uphold our [Code of Conduct](./CODE_OF_CONDUCT.md). Please treat all community members with empathy, respect, and kindness.

---

## 🌿 Wildlife Ethics First

AnimaFind is built around the celebration and protection of living wildlife:
- Never implement features that encourage harassing, cornering, baiting, or disturbing real-world animals.
- Accurate coordinate preservation for sensitive or protected species is strictly forbidden on public feeds. All coordinates must pass through our fuzzing filters (`src/lib/geo.ts`).

---

## 🛠️ Development Workflow

### 1. Branch Naming Conventions
Create a feature branch from `main`:
- `feat/feature-name` — for new features or gameplay mechanics
- `fix/bug-description` — for bug fixes
- `refactor/module-name` — for code restructuring without behavioral change
- `docs/topic` — for documentation updates
- `test/test-description` — for unit or integration test suites

### 2. Commit Message Guidelines
We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
- `feat(scanner): add auto-exposure compensation to viewfinder`
- `fix(album): provide reset button when filters match zero cards`
- `test(vision): add unit tests for moiré frequency detector`
- `docs(setup): update JDK 21 installation commands`

### 3. Pre-Commit Verification Checklist
Before submitting a pull request, verify that all local checks pass cleanly:

```bash
# 1. Automated unit test suite
npm test

# 2. TypeScript compilation
npm run typecheck

# 3. ESLint style check
npm run lint

# 4. Mobile static export & Capacitor synchronization
npm run build:mobile
```

---

## 📬 Pull Request Process

1. Open a pull request against the `main` branch.
2. Fill out the provided [Pull Request Template](./.github/PULL_REQUEST_TEMPLATE.md).
3. Ensure automated CI checks (Android build, lint, and test suites) pass.
4. Address review comments promptly.
5. Once approved by maintainers, your changes will be merged into `main`.
