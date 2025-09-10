# Gitflow Workflow

We are following the Gitflow workflow to manage branches and collaboration.

## Branches
- **main**: Production-ready code only (final presentation, stable releases).
- **develop**: Integration branch where features are merged before release.
- **feature/**: For new features. Always branch off `develop`.
  - Example: `feature/authentication`, `feature/attendance-tracking`
- **hotfix/**: For urgent fixes on production (`main`).
  - Example: `hotfix/login-bug`

## Workflow Rules
1. No direct commits to `main` or `develop`.
2. All new work must be done in a `feature/*` branch.
3. Open a Pull Request (PR) into `develop` when ready.
4. At least one team member must review and approve a PR before merging.
5. `develop` is merged into `main` only for release or presentations.

## Commit Message Guidelines
- Use clear and descriptive commit messages.
- Format: `type(scope): description`
  - **feat**: A new feature (`feat(auth): add login page`)
  - **fix**: A bug fix (`fix(api): resolve 500 error on /login`)
  - **docs**: Documentation only changes (`docs: update README`)
  - **style**: Formatting, missing semi colons, etc.
  - **refactor**: Code change that neither fixes a bug nor adds a feature.
  - **test**: Adding or updating tests.
