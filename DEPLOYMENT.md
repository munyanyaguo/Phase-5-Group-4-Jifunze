# Deployment Guide - Render

## Prerequisites

- GitHub repository with your code
- Render account (free tier available)
- Backend API deployed first (get the URL)

## Step 1: Deploy Backend (If Not Done)

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `jifunze-api`
   - **Runtime**: Python 3
   - **Build Command**: `cd server && pip install -r requirements.txt`
   - **Start Command**: `cd server && gunicorn -w 4 -b 0.0.0.0:$PORT wsgi:app`
   - **Environment Variables**:
     - `FLASK_ENV=production`
     - `SECRET_KEY=<generate-random-string>`
     - `JWT_SECRET_KEY=<generate-random-string>`
     - `DATABASE_URL=<your-database-url>`

5. Click "Create Web Service"
6. **Copy the backend URL** (e.g., `https://jifunze-api.onrender.com`)

## Step 2: Update Frontend Environment

1. Update `client/.env.production`:
   ```bash
   VITE_API_URL=https://jifunze-api.onrender.com/api
   ```

2. Commit the change:
   ```bash
   git add client/.env.production
   git commit -m "config: update production API URL"
   git push
   ```

## Step 3: Deploy Frontend

### Option A: Using render.yaml (Recommended)

1. The `render.yaml` file is already configured
2. Go to Render Dashboard
3. Click "New +" → "Blueprint"
4. Connect your repository
5. Render will automatically detect `render.yaml` and deploy both services

### Option B: Manual Static Site

1. Go to Render Dashboard
2. Click "New +" → "Static Site"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `jifunze-frontend`
   - **Build Command**: `cd client && npm install && npm run build`
   - **Publish Directory**: `client/dist`
   - **Environment Variables**:
     - `VITE_API_URL=https://jifunze-api.onrender.com/api`

5. Click "Create Static Site"

## Step 4: Verify Deployment

1. Wait for build to complete (5-10 minutes)
2. Visit your frontend URL (e.g., `https://jifunze-frontend.onrender.com`)
3. Test:
   - Login functionality
   - Student dashboard
   - API calls working
   - All routes accessible

## Step 5: Custom Domain (Optional)

1. In Render Dashboard, go to your frontend service
2. Click "Settings" → "Custom Domain"
3. Add your domain (e.g., `jifunze.com`)
4. Update DNS records as instructed
5. Update `VITE_API_URL` if needed

## Troubleshooting

### Build Fails

**Issue**: "Module not found"
**Fix**: Ensure all dependencies are in `package.json`

**Issue**: "Out of memory"
**Fix**: Upgrade to paid plan or optimize build

### API Calls Fail

**Issue**: CORS errors
**Fix**: Check backend CORS configuration allows frontend domain

**Issue**: 404 on API calls
**Fix**: Verify `VITE_API_URL` includes `/api` at the end

### Routes Don't Work

**Issue**: 404 on refresh
**Fix**: Ensure `_redirects` file exists in `client/public/`

## Environment Variables Summary

### Backend (.env.production)
```
FLASK_ENV=production
SECRET_KEY=<random-string>
JWT_SECRET_KEY=<random-string>
DATABASE_URL=<database-url>
CORS_ORIGINS=https://jifunze-frontend.onrender.com
```

### Frontend (.env.production)
```
VITE_API_URL=https://jifunze-api.onrender.com/api
```

## Post-Deployment Checklist

- [ ] Backend deployed and healthy
- [ ] Frontend deployed and accessible
- [ ] Login works
- [ ] Student dashboard loads
- [ ] API calls successful
- [ ] All routes accessible (no 404s)
- [ ] Tests passing locally
- [ ] Environment variables set correctly
- [ ] CORS configured properly
- [ ] Database connected

## Monitoring

- Check Render logs for errors
- Monitor API response times
- Set up uptime monitoring (e.g., UptimeRobot)

## Rollback

If deployment fails:
```bash
# Revert to previous commit
git revert HEAD
git push

# Or rollback in Render Dashboard
# Go to service → Deploys → Click "Rollback" on previous deploy
```

## Support

- Render Docs: https://render.com/docs
- Vite Docs: https://vitejs.dev/guide/
- React Router: https://reactrouter.com/

---

**Deployment Date**: 2025-10-01
**Version**: 1.0.0
