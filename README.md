# npm-package

A TypeScript npm package boilerplate for building, testing, and publishing scoped packages to GitHub Packages. It ships dual CommonJS and ESM bundles, enforces strict quality gates through git hooks and CI, and automates versioning and releases with Semantic Release.

Use this repository as a starting point for your own package. After cloning or forking, update `name`, `description`, `repository`, `author`, and `publishConfig` in `package.json` to match your project. The current example scope is `@xdigu/npm-package`.

## Features

- TypeScript with strict compiler options (`tsconfig.json`)
- Dual CJS/ESM bundle via [tsdown](https://github.com/rolldown/tsdown) with declaration files
- Jest unit tests with a 95% coverage threshold on `src/`
- ESLint 9 flat config with Prettier rules applied through `eslint-plugin-prettier`
- Husky git hooks for pre-commit, pre-push, and commit message validation
- lint-staged for ESLint fixes on staged source files
- Conventional Commits enforced by Commitlint
- GitHub Actions CI on pull requests
- Semantic Release: automated version bumps, CHANGELOG updates, GitHub Releases, and npm publish to GitHub Packages
- Protected-branch workflow that blocks direct pushes to `main`

## Tech Stack

| Category | Tool |
| --- | --- |
| Language | TypeScript |
| Runtime | Node.js 24.x |
| Package manager | Yarn |
| Bundler | tsdown |
| Testing | Jest, ts-jest |
| Linting | ESLint 9 (`typescript-eslint`) |
| Formatting | Prettier (via ESLint plugin; no standalone format script) |
| Git hooks | Husky, lint-staged |
| Commit validation | Commitlint (`@commitlint/config-conventional`) |
| Release automation | Semantic Release |
| CI/CD | GitHub Actions |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 24.x
- [Yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/)

### Installation

```bash
git clone https://github.com/xdigu/npm-package.git
cd npm-package
yarn install
```

The `prepare` script installs Husky hooks automatically after dependency installation.

### Local development

Build the package and run tests:

```bash
yarn build
yarn test
```

Run the full local quality check before opening a pull request:

```bash
yarn lint
yarn typecheck
yarn test:coverage
```

### Customize for your package

When adapting this template, update the following in `package.json`:

- `name` — use a scoped name such as `@your-org/your-package` for GitHub Packages
- `description`, `keywords`, `author`
- `repository.url`
- `publishConfig.registry` — defaults to `https://npm.pkg.github.com`

## Available Scripts

| Script | Command | What it does | When to use |
| --- | --- | --- | --- |
| `build` | `tsdown` | Produces `dist/` with CJS (`.cjs`), ESM (`.mjs`), and type declarations | Before testing a local pack; runs automatically during publish |
| `lint` | `eslint .` | Validates lint rules on files under `src/` | Manual check; CI runs this after auto-fix |
| `lint:fix` | `eslint --fix .` | Auto-fixes lint and formatting issues | Before committing; CI applies fixes then validates |
| `lint-staged` | `lint-staged` | Runs ESLint fix on staged `src/**/*.{ts,tsx}` | Invoked by the pre-commit hook |
| `prepare` | `husky` | Installs Husky git hooks | Runs automatically after `yarn install` |
| `typecheck` | `tsc --noEmit` | Type-checks library source without emitting files | Pre-commit and pre-push hooks; run manually before a PR |
| `test` | `jest` | Runs the full test suite | Local development |
| `test:coverage` | `jest --coverage` | Runs tests and enforces 95% coverage thresholds | Match CI locally before opening a PR |
| `test:watch` | `jest --watch` | Runs tests in watch mode | Active test-driven development |
| `test:related` | `node scripts/test-related.mjs` | Runs Jest with `--findRelatedTests` for changed source files | Used by git hooks with `--staged` or `--push` |

The `test:related` script ([`scripts/test-related.mjs`](scripts/test-related.mjs)) collects changed files under `src/`:

- `--staged` — files in the current commit index
- `--push` — files changed between the upstream branch (`@{u}`, or `origin/main` if unset) and `HEAD`

If no matching source files are found, the script exits successfully. Otherwise it runs related Jest tests with `--passWithNoTests`.

## Development Workflow

1. **Create a branch** — Work on a feature branch. Direct pushes to `main` are blocked by the pre-push hook.

   ```bash
   git checkout -b feat/my-change
   ```

2. **Make changes** — Edit source files in `src/`. Use `yarn test:watch` or `yarn test` while developing.

3. **Commit** — Staged commits trigger lint-staged, type checking, and related tests. Commit messages must follow Conventional Commits (validated by Commitlint).

   ```bash
   git add .
   git commit -m "feat: add new utility"
   ```

4. **Push** — The pre-push hook runs type checking and related tests for all files changed since the upstream branch.

   ```bash
   git push -u origin feat/my-change
   ```

5. **Open a pull request** — CI runs lint fixes, lint validation, and the full test suite with coverage.

6. **Release** — After a PR is merged to `main`, the publish workflow builds the package and runs Semantic Release to bump the version, update the changelog, publish to GitHub Packages, and create a GitHub Release.

## Git Hooks

Hooks are configured in [`.husky/`](.husky/) and installed via the `prepare` script.

### Pre-commit

File: [`.husky/pre-commit`](.husky/pre-commit)

Runs in order:

1. `yarn lint-staged` — ESLint with `--fix --max-warnings=0` on staged `src/**/*.{ts,tsx}`
2. `yarn typecheck` — TypeScript validation with `tsc --noEmit`
3. `yarn test:related --staged` — Jest tests related to staged source files

These checks catch lint, type, and test regressions before a commit is created.

### Pre-push

File: [`.husky/pre-push`](.husky/pre-push)

Runs in order:

1. **Branch guard** — Rejects the push if the current branch is `main`
2. `yarn typecheck`
3. `yarn test:related --push` — Jest tests related to files changed vs the upstream branch

This enforces the feature-branch workflow and validates the full set of changes being pushed.

### Commit message

File: [`.husky/commit-msg`](.husky/commit-msg)

Runs `yarn commitlint --edit "$1"` using the [Conventional Commits](https://www.conventionalcommits.org/) format via `@commitlint/config-conventional`.

Examples:

```
feat: add new utility
fix: correct validation logic
docs: update README
chore: adjust CI configuration
```

Semantic Release generates release commits automatically (for example, `chore(release): 1.2.3 [skip ci]`).

## Commit Convention

Commit messages must follow Conventional Commits. Commitlint validates every commit through the `commit-msg` hook.

| Type | Purpose |
| --- | --- |
| `feat` | New feature (minor version bump) |
| `fix` | Bug fix (patch version bump) |
| `docs` | Documentation only |
| `chore` | Maintenance tasks |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test` | Adding or updating tests |
| `ci` | CI configuration changes |

A `BREAKING CHANGE` footer or `!` after the type/scope triggers a major version bump during release.

## CI/CD

### CI — Lint, Test, and Coverage

File: [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

| Setting | Value |
| --- | --- |
| Trigger | Pull request opened, synchronized, or reopened |
| Concurrency | One run per PR; in-progress runs are cancelled |
| Node.js | 24.x |
| Package manager | Yarn with lockfile cache |

Steps:

1. Checkout repository
2. Install dependencies with `yarn install --frozen-lockfile`
3. Apply automatic lint fixes with `yarn lint:fix`
4. Validate lint with `yarn lint`
5. Run `yarn test:coverage` with a 95% coverage threshold
6. Publish a coverage summary table to the GitHub Actions job summary

CI does not run `yarn typecheck` or `yarn build`. Run those locally before merging.

### Publish — GitHub Packages

File: [`.github/workflows/publish.yml`](.github/workflows/publish.yml)

| Setting | Value |
| --- | --- |
| Trigger | Push to `main` |
| Node.js | 24.x |
| Permissions | `contents: write`, `packages: write` |

Steps:

1. Checkout repository
2. Install dependencies with `yarn`
3. Build with `yarn build`
4. Run `npx semantic-release` with `HUSKY=0` (hooks disabled in CI)

Environment variables:

- `GITHUB_TOKEN` — used for GitHub API access and GitHub Packages publish
- `NPM_TOKEN` — set to `GITHUB_TOKEN` for npm registry authentication

### Semantic Release configuration

File: [`.releaserc`](.releaserc)

Plugins run in this order:

1. `@semantic-release/commit-analyzer` — determines the next version from commit history on `main`
2. `@semantic-release/release-notes-generator` — generates release notes
3. `@semantic-release/changelog` — updates `CHANGELOG.md`
4. `@semantic-release/npm` — publishes to the configured npm registry
5. `@semantic-release/git` — commits `package.json` and `CHANGELOG.md`
6. `@semantic-release/github` — creates a GitHub Release

Releases require Conventional Commits merged to `main`. Commits such as `feat:` and `fix:` drive minor and patch bumps; breaking changes drive major bumps.

## Publishing

### How it works

1. A pull request with Conventional Commits is merged to `main`.
2. The publish workflow builds `dist/` with tsdown.
3. Semantic Release analyzes commits since the last release, determines the next version, and:
   - Updates `package.json` version
   - Appends to `CHANGELOG.md`
   - Publishes the package to GitHub Packages
   - Creates a Git tag and GitHub Release

Version numbers on `main` are managed by Semantic Release. Do not manually bump the version in pull requests intended for release.

### Registry and artifacts

- **Registry:** `https://npm.pkg.github.com` (configured in `publishConfig.registry`)
- **Published files:** Built output in `dist/`; source and development config are excluded via [`.npmignore`](.npmignore)
- **Authentication:** The workflow uses the repository `GITHUB_TOKEN` with `packages: write` permission

### Installing the package

Consumers must authenticate with GitHub Packages. Configure an `.npmrc` file:

```
@xdigu:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

Then install:

```bash
npm install @xdigu/npm-package
```

Replace `@xdigu` with your GitHub organization or user scope when using a fork of this template.

## Project Structure

```
.
├── src/                      # Library source code
│   ├── index.ts              # Public entry point
│   └── __tests__/            # Unit tests
├── dist/                     # Build output (gitignored; included in published package)
├── scripts/
│   └── test-related.mjs      # Hook helper for related Jest test runs
├── .github/
│   └── workflows/
│       ├── ci.yml            # Pull request validation
│       └── publish.yml       # Build and Semantic Release on main
├── .husky/                   # Git hook scripts
├── tsdown.config.ts          # Bundle configuration (CJS, ESM, DTS)
├── tsconfig.json             # Library TypeScript configuration
├── tsconfig.test.json        # TypeScript configuration for Jest
├── jest.config.js            # Test and coverage configuration
├── eslint.config.js          # ESLint flat configuration
├── commitlint.config.js      # Commit message rules
├── .releaserc                # Semantic Release configuration
├── .prettierrc               # Prettier formatting rules (via ESLint)
├── CHANGELOG.md              # Auto-maintained release history
└── package.json              # Package metadata and scripts
```

## Quality Gates

| Gate | Tool | Where enforced |
| --- | --- | --- |
| Lint | ESLint | lint-staged (pre-commit), CI |
| Format | ESLint `--fix` (Prettier rules) | lint-staged (pre-commit), CI (`lint:fix`) |
| Type checking | `tsc --noEmit` | pre-commit, pre-push (not CI) |
| Unit tests | Jest | pre-commit/pre-push (related), CI (full suite) |
| Coverage (95%) | Jest `coverageThreshold` | CI, local `test:coverage` |
| Commit format | Commitlint | commit-msg hook |
| Branch protection | pre-push script | local (blocks direct push to `main`) |
| Build | tsdown | publish workflow (not CI or pre-push) |

Before merging, run the checks that CI does not cover:

```bash
yarn typecheck
yarn build
```

## Contributing

1. Create a feature branch from `main`.
2. Make changes in `src/` with tests for new behavior.
3. Follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.
4. Ensure the following pass locally before pushing:

   ```bash
   yarn lint
   yarn typecheck
   yarn test:coverage
   ```

5. Open a pull request against `main`. Do not push directly to `main`.

## License

[MIT](LICENSE) — Copyright (c) 2026 xdigu
