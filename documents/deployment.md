# Deployment Guide

## Overview

Jifunze uses a multi-environment deployment strategy with automated CI/CD pipelines powered by GitHub Actions and hosted on Render.

## Deployment Environments

### 1. **Staging Environment** (develop branch)
- **Purpose**: Pre-production testing and validation
- **Frontend URL**: `https://jifunze-staging.onrender.com` (to be configured)
- **Backend URL**: `https://jifunze-staging-api.onrender.com` (to be configured)
- **Trigger**: Automatic deployment on push to `develop` branch
- **Database**: Staging PostgreSQL database

### 2. **Production Environment** (main branch)
- **Purpose**: Live production application
- **Frontend URL**: `https://phase-5-group-4-jifunze.onrender.com`
- **Backend URL**: `https://jifunze-31gc.onrender.com`
- **Trigger**: Automatic deployment on push to `main` branch
- **Database**: Production PostgreSQL database

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     GitHub Repository                        │
│                                                              │
│  develop branch ──────────► Staging Environment             │
│                              ├─ Frontend (Static Site)       │
│                              └─ Backend (Web Service)        │
│                                                              │
│  main branch ─────────────► Production Environment          │
│                              ├─ Frontend (Static Site)       │
│                              └─ Backend (Web Service)        │
└─────────────────────────────────────────────────────────────┘
```

---

## Frontend Deployment

### Technology Stack
- **Build Tool**: Vite
- **Hosting**: Render (Static Site)
- **Build Command**: `cd client && npm install && npm run build`
- **Publish Directory**: `./client/dist`

### Environment Variables
| Variable | Staging | Production |
|----------|---------|------------|
| `VITE_API_URL` | `https://jifunze-staging-api.onrender.com` | `https://jifunze-31gc.onrender.com` |

### Deployment Process
1. Code pushed to `develop` or `main` branch
2. GitHub Actions workflow triggered
3. Dependencies installed via `npm ci`
4. Application built with environment-specific API URL
5. Build artifacts verified
6. Render deploy hook triggered (if configured)
7. Render pulls latest code and serves static files

### Manual Deployment
```bash
# Build locally
cd client
npm ci
npm run build

# Deploy to Render
# Option 1: Push to GitHub (automatic)
git push origin develop  # for staging
git push origin main     # for production

# Option 2: Use Render deploy hooks
curl -X POST $RENDER_DEPLOY_HOOK_URL
```

---

## Backend Deployment

### Technology Stack
- **Framework**: Flask
- **Server**: Gunicorn
- **Hosting**: Render (Web Service)
- **Database**: PostgreSQL
- **Build Command**: `cd server && pip install -r requirements.txt`
- **Start Command**: `cd server && gunicorn -w 4 -b 0.0.0.0:$PORT wsgi:app`

### Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SECRET_KEY` | Yes | Flask secret key |
| `JWT_SECRET_KEY` | Yes | JWT token signing key |
| `FLASK_ENV` | Yes | `production` or `staging` |

### Deployment Process
1. Code pushed to `develop` or `main` branch
2. GitHub Actions workflow triggered
3. Backend files verified
4. Render deploy hook triggered (if configured)
5. Render pulls latest code
6. Dependencies installed from `Pipfile`
7. Database migrations run automatically
8. Gunicorn server starts

### Database Migrations
Migrations run automatically on deployment via Render's build process:
```bash
# Render runs these commands automatically
cd server
pipenv install
pipenv run flask db upgrade
```

### Manual Deployment
```bash
# Deploy to Render
# Option 1: Push to GitHub (automatic)
git push origin develop  # for staging
git push origin main     # for production

# Option 2: Use Render deploy hooks
curl -X POST $RENDER_BACKEND_DEPLOY_HOOK_URL
```

---

## Setting Up Deployment

### Prerequisites
1. Render account
2. GitHub repository access
3. PostgreSQL database provisioned on Render

### Step 1: Configure Render Services

#### Frontend Service (Static Site)
1. Go to Render Dashboard → New → Static Site
2. Connect GitHub repository
3. Configure:
   - **Name**: `jifunze-frontend` (production) or `jifunze-staging-frontend`
   - **Branch**: `main` (production) or `develop` (staging)
   - **Build Command**: `cd client && npm install && npm run build`
   - **Publish Directory**: `./client/dist`
   - **Environment Variables**:
     - `VITE_API_URL`: Backend URL
4. Add rewrite rule for SPA routing:
   - Source: `/*`
   - Destination: `/index.html`

#### Backend Service (Web Service)
1. Go to Render Dashboard → New → Web Service
2. Connect GitHub repository
3. Configure:
   - **Name**: `jifunze-api` (production) or `jifunze-staging-api`
   - **Branch**: `main` (production) or `develop` (staging)
   - **Runtime**: Python 3
   - **Build Command**: `cd server && pip install -r requirements.txt`
   - **Start Command**: `cd server && gunicorn -w 4 -b 0.0.0.0:$PORT wsgi:app`
   - **Environment Variables**:
     - `DATABASE_URL`: From Render PostgreSQL
     - `SECRET_KEY`: Generate secure key
     - `JWT_SECRET_KEY`: Generate secure key
     - `FLASK_ENV`: `production` or `staging`
4. Add health check path: `/api/health`

#### Database (PostgreSQL)
1. Go to Render Dashboard → New → PostgreSQL
2. Configure:
   - **Name**: `jifunze-db` (production) or `jifunze-staging-db`
   - **Database**: `jifunze_db`
   - **User**: Auto-generated
3. Copy `Internal Database URL` to backend service's `DATABASE_URL`

### Step 2: Configure GitHub Secrets

Add the following secrets in GitHub repository settings:

#### Staging Secrets
- `RENDER_STAGING_FRONTEND_DEPLOY_HOOK`: Staging frontend deploy hook URL
- `RENDER_STAGING_BACKEND_DEPLOY_HOOK`: Staging backend deploy hook URL
- `STAGING_FRONTEND_URL`: Staging frontend URL
- `STAGING_API_URL`: Staging backend URL

#### Production Secrets
- `RENDER_FRONTEND_DEPLOY_HOOK`: Production frontend deploy hook URL
- `RENDER_BACKEND_DEPLOY_HOOK`: Production backend deploy hook URL

To get deploy hook URLs:
1. Go to Render service settings
2. Navigate to "Deploy" section
3. Copy "Deploy Hook" URL

### Step 3: Enable Auto-Deploy

Both staging and production environments are configured for automatic deployment:

- **Staging**: Deploys automatically when code is pushed to `develop`
- **Production**: Deploys automatically when code is pushed to `main`

Render will automatically:
1. Pull latest code from GitHub
2. Install dependencies
3. Run build commands
4. Start services
5. Run database migrations

---

## Deployment Workflow

### Feature Development → Staging
```bash
# 1. Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/your-feature

# 2. Develop and commit changes
git add .
git commit -m "feat: your feature description"

# 3. Push and create PR to develop
git push origin feature/your-feature
# Create PR on GitHub targeting develop branch

# 4. After PR approval and merge
# Staging deployment triggers automatically
```

### Staging → Production
```bash
# 1. Test thoroughly on staging environment
# 2. Create PR from develop to main
# 3. After approval and merge to main
# Production deployment triggers automatically
```

---

## Monitoring Deployments

### Check Deployment Status
1. Go to Render Dashboard
2. Select service (frontend or backend)
3. View "Events" tab for deployment logs
4. Check "Logs" tab for runtime logs

### Verify Deployment
```bash
# Check frontend
curl https://your-frontend-url.onrender.com

# Check backend health
curl https://your-backend-url.onrender.com/api/health

# Expected response:
# {"status": "healthy", "database": "connected"}
```

### Rollback Deployment
If issues occur in production:

1. **Quick Rollback** (via Render):
   - Go to service → Events
   - Click "Rollback" on previous successful deployment

2. **Git Rollback**:
   ```bash
   # Revert to previous commit
   git revert HEAD
   git push origin main
   ```

---

## Troubleshooting

### Common Issues

#### Build Failures
**Problem**: Build fails during deployment
**Solution**:
- Check build logs in Render dashboard
- Verify all dependencies are in `package.json` or `Pipfile`
- Ensure environment variables are set correctly

#### Database Connection Errors
**Problem**: Backend can't connect to database
**Solution**:
- Verify `DATABASE_URL` is set correctly
- Check database is running in Render dashboard
- Ensure database accepts connections from backend service

#### Frontend Can't Reach Backend
**Problem**: API calls fail from frontend
**Solution**:
- Verify `VITE_API_URL` points to correct backend URL
- Check CORS settings in backend
- Ensure backend service is running

#### Deployment Hook Not Triggering
**Problem**: Automatic deployment doesn't start
**Solution**:
- Verify GitHub secrets are set correctly
- Check webhook URLs are valid
- Ensure branch names match workflow configuration

---

## Security Best Practices

1. **Never commit secrets** to repository
2. **Use environment variables** for all sensitive data
3. **Rotate keys regularly** (SECRET_KEY, JWT_SECRET_KEY)
4. **Enable HTTPS** (automatic on Render)
5. **Use strong database passwords**
6. **Limit database access** to backend service only
7. **Review deployment logs** for suspicious activity

---

## Cost Optimization

### Render Free Tier Limitations
- Services spin down after 15 minutes of inactivity
- First request after spin-down takes 30-50 seconds
- 750 hours/month free tier

### Recommendations
- Use paid tier for production ($7/month per service)
- Keep staging on free tier for testing
- Monitor usage in Render dashboard

---

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [Flask Deployment Guide](https://flask.palletsprojects.com/en/latest/deploying/)
- [Vite Production Build](https://vitejs.dev/guide/build.html)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

## Support

For deployment issues:
1. Check Render service logs
2. Review GitHub Actions workflow runs
3. Contact team members (see README)
4. Refer to project documentation in `/documents`
