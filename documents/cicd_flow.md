# CI/CD Flow Documentation

## Overview

Jifunze application implements a comprehensive CI/CD pipeline using GitHub Actions to ensure code quality, run automated tests, and deploy to staging and production environments.

---

## CI/CD Architecture

![CICD](./CICD.png)

## Workflow Files

### 1. Frontend CI (`frontend-ci.yml`)

**Triggers:**
- Pull requests to `develop` or `main` branches
- Pushes to `develop` or `main` branches
- Only when files in `client/**` are modified

**Jobs:**
```yaml
test:
  - Checkout code
  - Setup Node.js 22
  - Install dependencies (npm ci)
  - Run Vitest tests with coverage
  - Upload coverage to Codecov
  - Build application
  - Verify build artifacts
```

**Environment:**
- Node.js 22
- npm package manager
- Vitest for testing
- Coverage reporting enabled

**Success Criteria:**
- All tests pass
- Build completes successfully
- `dist/index.html` exists

---

### 2. Backend CI (`backend-ci.yml`)

**Triggers:**
- Pull requests to `develop` or `main` branches
- Pushes to `develop` or `main` branches
- Only when files in `server/**` are modified

**Jobs:**
```yaml
test:
  - Setup PostgreSQL test database
  - Checkout code
  - Setup Python 3.12
  - Install pipenv
  - Cache dependencies
  - Install dependencies with pipenv
  - Lint with flake8
  - Run pytest with coverage
  - Upload coverage to Codecov
  - Generate coverage summary
```

**Test Database Configuration:**
```yaml
services:
  postgres:
    image: postgres:15
    env:
      POSTGRES_USER: test_user
      POSTGRES_PASSWORD: test_password
      POSTGRES_DB: test_jifunze_db
    ports:
      - 5432:5432
    health_checks: enabled
```

**Environment Variables:**
- `SECRET_KEY`: test-secret-key
- `JWT_SECRET_KEY`: test-jwt-secret-key
- `FLASK_ENV`: testing
- `DATABASE_URL`: postgresql://test_user:test_password@localhost:5432/test_jifunze_db

**Success Criteria:**
- Linting passes (flake8)
- All tests pass
- Database fixtures work correctly
- Coverage report generated

---

### 3. Staging Deployment (`deploy-staging.yml`)

**Triggers:**
- Push to `develop` branch
- Manual workflow dispatch

**Jobs:**

#### deploy-staging-frontend
```yaml
- Checkout code
- Setup Node.js 22
- Install and build with staging API URL
- Verify build artifacts
- Trigger Render deploy hook (if configured)
```

#### deploy-staging-backend
```yaml
- Checkout code
- Setup Python 3.12
- Verify backend files
- Trigger Render deploy hook (if configured)
```

#### test-staging-deployment
```yaml
- Display staging URLs
- Provide verification instructions
```

**Environment Variables:**
- `VITE_API_URL`: Staging backend URL
- `RENDER_STAGING_FRONTEND_DEPLOY_HOOK`: Deploy hook for frontend
- `RENDER_STAGING_BACKEND_DEPLOY_HOOK`: Deploy hook for backend

---

### 4. Production Deployment (`deploy-production.yml`)

**Triggers:**
- Push to `main` branch
- Manual workflow dispatch

**Jobs:**

#### deploy-frontend
```yaml
- Checkout code
- Setup Node.js 22
- Install and build with production API URL
- Verify build artifacts
- Trigger Render deploy hook (commented until configured)
```

#### deploy-backend
```yaml
- Checkout code
- Verify backend files
- Trigger Render deploy hook (commented until configured)
```

#### test-deployment-readiness
```yaml
- Display deployment completion
- Show next steps for configuration
```

**Environment Variables:**
- `VITE_API_URL`: Production backend URL (https://jifunze-31gc.onrender.com)
- `RENDER_FRONTEND_DEPLOY_HOOK`: Deploy hook for frontend
- `RENDER_BACKEND_DEPLOY_HOOK`: Deploy hook for backend

---

## Test Coverage

### Frontend Testing
- **Framework**: Vitest
- **Coverage Tool**: Vitest built-in coverage (c8)
- **Reports**: 
  - Terminal output
  - JSON format for Codecov
- **Upload**: Automatic to Codecov with `frontend` flag

### Backend Testing
- **Framework**: Pytest
- **Coverage Tool**: pytest-cov
- **Reports**:
  - Terminal with missing lines
  - XML format for Codecov
  - HTML format for local viewing
- **Upload**: Automatic to Codecov with `backend` flag

### Coverage Reports Location
- Frontend: `./client/coverage/`
- Backend: `./server/coverage.xml`, `./server/htmlcov/`

---

## Database Testing

### Test Database Setup
The CI pipeline uses PostgreSQL 15 as a service container:

```yaml
services:
  postgres:
    image: postgres:15
    env:
      POSTGRES_USER: test_user
      POSTGRES_PASSWORD: test_password
      POSTGRES_DB: test_jifunze_db
    ports:
      - 5432:5432
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
```

### Test Fixtures
Located in `server/tests/conftest.py`:

- **`app`**: Creates Flask app with testing config
- **`client`**: Provides Flask test client
- **`setup_database`**: Recreates database before each test
- **`sample_data`**: Creates test school and users
- **`auth_headers`**: Generates JWT tokens for different roles

### Database Lifecycle
1. PostgreSQL container starts
2. Health checks ensure database is ready
3. Flask app connects to test database
4. Each test gets fresh database via fixtures
5. Database dropped after each test
6. Container cleaned up after job

---

## Branch Protection Rules

### Recommended Settings

#### `develop` branch
- ✅ Require pull request reviews (1 reviewer)
- ✅ Require status checks to pass:
  - `Frontend CI / test`
  - `Backend CI / test`
- ✅ Require branches to be up to date
- ✅ Require conversation resolution
- ❌ Allow force pushes (disabled)
- ❌ Allow deletions (disabled)

#### `main` branch
- ✅ Require pull request reviews (2 reviewers)
- ✅ Require status checks to pass:
  - `Frontend CI / test`
  - `Backend CI / test`
- ✅ Require branches to be up to date
- ✅ Require conversation resolution
- ✅ Require linear history
- ❌ Allow force pushes (disabled)
- ❌ Allow deletions (disabled)

---

## Workflow Execution Flow

### Pull Request Workflow

```
1. Developer creates PR to develop/main
   │
   ▼
2. GitHub Actions triggered
   │
   ├─► Frontend CI (if client/** changed)
   │   ├─ Install dependencies
   │   ├─ Run tests
   │   ├─ Generate coverage
   │   └─ Build app
   │
   └─► Backend CI (if server/** changed)
       ├─ Start PostgreSQL
       ├─ Install dependencies
       ├─ Lint code
       ├─ Run tests with DB
       └─ Generate coverage
   │
   ▼
3. Status checks reported to PR
   │
   ├─►  All pass → Allow merge
   └─►  Any fail → Block merge
   │
   ▼
4. PR merged
   │
   ▼
5. Deployment triggered (if develop/main)
```

### Deployment Workflow

```
1. Code merged to develop/main
   │
   ▼
2. Deployment workflow triggered
   │
   ├─► Staging (develop)
   │   ├─ Build frontend with staging API
   │   ├─ Trigger Render deploy hooks
   │   └─ Display staging URLs
   │
   └─► Production (main)
       ├─ Build frontend with production API
       ├─ Trigger Render deploy hooks
       └─ Verify deployment
   │
   ▼
3. Render pulls code and deploys
   │
   ├─► Frontend
   │   ├─ Install dependencies
   │   ├─ Build static files
   │   └─ Serve via CDN
   │
   └─► Backend
       ├─ Install dependencies
       ├─ Run migrations
       └─ Start Gunicorn
   │
   ▼
4. Services live and accessible
```

---

## Monitoring and Debugging

### View Workflow Runs
1. Go to GitHub repository
2. Click "Actions" tab
3. Select workflow run
4. View job logs

### Check Test Results
- Test results appear in workflow logs
- Failed tests show detailed error messages
- Coverage reports uploaded to Codecov

### Debug Failed Workflows

#### Frontend CI Failures
```bash
# Run locally to reproduce
cd client
npm ci
npm test
npm run build
```

#### Backend CI Failures
```bash
# Run locally with test database
cd server
docker run -d -p 5432:5432 \
  -e POSTGRES_USER=test_user \
  -e POSTGRES_PASSWORD=test_password \
  -e POSTGRES_DB=test_jifunze_db \
  postgres:15

export DATABASE_URL="postgresql://test_user:test_password@localhost:5432/test_jifunze_db"
export SECRET_KEY="test-secret-key"
export JWT_SECRET_KEY="test-jwt-secret-key"
export FLASK_ENV="testing"

pipenv install --dev
pipenv run pytest tests/ -v --cov=app
```

---

## Performance Optimization

### Caching Strategy

#### Frontend
```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'npm'
    cache-dependency-path: client/package-lock.json
```
- Caches `node_modules` based on `package-lock.json`
- Speeds up dependency installation

#### Backend
```yaml
- uses: actions/cache@v3
  with:
    path: ~/.cache/pipenv
    key: ${{ runner.os }}-pipenv-${{ hashFiles('server/Pipfile.lock') }}
```
- Caches pipenv dependencies
- Reduces installation time

### Parallel Execution
- Frontend and backend CI run in parallel
- Staging frontend and backend deploy in parallel
- Reduces total workflow time

---

## Security Considerations

### Secrets Management
All sensitive data stored as GitHub Secrets:
- `RENDER_STAGING_FRONTEND_DEPLOY_HOOK`
- `RENDER_STAGING_BACKEND_DEPLOY_HOOK`
- `RENDER_FRONTEND_DEPLOY_HOOK`
- `RENDER_BACKEND_DEPLOY_HOOK`
- `STAGING_API_URL`
- `STAGING_FRONTEND_URL`

### Access Control
- Only maintainers can modify workflows
- Secrets not exposed in logs
- Deploy hooks require authentication

### Dependency Security
- Regular dependency updates
- Automated security scanning (recommended: Dependabot)
- Lock files committed to repository

---

## Maintenance

### Regular Tasks
- [ ] Review and update dependencies monthly
- [ ] Monitor coverage trends
- [ ] Check workflow execution times
- [ ] Update Python/Node versions as needed
- [ ] Rotate deploy hook URLs if compromised

### Workflow Updates
When updating workflows:
1. Test changes in feature branch
2. Create PR with workflow changes
3. Review workflow run results
4. Merge only after successful test

---

## Troubleshooting Guide

### Common Issues

#### Issue: Tests pass locally but fail in CI
**Cause**: Environment differences
**Solution**: 
- Check environment variables
- Verify database connection
- Review Python/Node versions

#### Issue: Coverage upload fails
**Cause**: Codecov token not configured
**Solution**: 
- Add `CODECOV_TOKEN` to GitHub Secrets
- Or use `fail_ci_if_error: false` (current setup)

#### Issue: Deployment hook doesn't trigger
**Cause**: Secret not configured
**Solution**:
- Add deploy hook URL to GitHub Secrets
- Verify secret name matches workflow

#### Issue: PostgreSQL service not ready
**Cause**: Health checks timing out
**Solution**:
- Increase health check intervals
- Add wait step before tests
---

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Pytest Documentation](https://docs.pytest.org/)
- [Vitest Documentation](https://vitest.dev/)
- [Codecov Documentation](https://docs.codecov.com/)
- [Render CI/CD Guide](https://render.com/docs/deploy-hooks)

---

## Support

For CI/CD issues:
1. Check workflow logs in GitHub Actions
2. Review this documentation
3. Contact team members (see README)
4. Refer to project documentation in `/documents`
