# Deployment Guide - Together Game

This guide covers how to deploy the Together game to production using free/affordable hosting services.

## Table of Contents
1. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
2. [Backend Deployment (Railway)](#backend-deployment-railway)
3. [Backend Deployment (Render)](#backend-deployment-render)
4. [Database Setup (Optional - Redis)](#database-setup-optional)
5. [Post-Deployment Checklist](#post-deployment-checklist)

---

## Frontend Deployment (Vercel)

Vercel is the easiest option for deploying React apps. It has seamless integration with GitHub and automatic deployments.

### Step 1: Prepare for GitHub

```bash
# Initialize git in your repository
git init
git add .
git commit -m "Initial commit: Together game"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/together-game.git
git push -u origin main
```

### Step 2: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub account
3. Authorize Vercel to access your repositories

### Step 3: Import Project

1. Click "New Project"
2. Select your `together-game` repository
3. Import the project

### Step 4: Configure Project

In the Vercel dashboard:

1. **Root Directory**: Set to `frontend`
2. **Framework**: Select `Vite`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Install Command**: `npm install`

### Step 5: Environment Variables

Add these environment variables in Vercel dashboard:

```
VITE_SOCKET_URL = https://your-backend-url.com
```

⚠️ **Important**: Replace `https://your-backend-url.com` with your actual backend URL (from Railway/Render)

### Step 6: Deploy

1. Click "Deploy"
2. Wait for build to complete (2-3 minutes)
3. Your app will be live at: `https://together-game.vercel.app` (or custom domain)

### Custom Domain (Optional)

1. Go to "Settings" → "Domains"
2. Add your custom domain
3. Follow DNS configuration steps

---

## Backend Deployment (Railway)

Railway is perfect for Node.js backends with excellent WebSocket support.

### Step 1: Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create a new project

### Step 2: Connect Repository

1. Click "New"
2. Select "GitHub Repo"
3. Choose your `together-game` repository
4. Select `backend` as the service

### Step 3: Configure Service

In the Railway dashboard:

1. **Service**: Node.js should auto-detect
2. **Root Directory**: Set to `backend` (if not auto-detected)

### Step 4: Set Environment Variables

In Environment tab, add:

```
NODE_ENV=production
PORT=5000
```

### Step 5: Add Deployment Trigger

1. Go to "Deployments" tab
2. Enable automatic deployments from main branch

### Step 6: Build & Start Commands

Configure in `railway.toml`:

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"
restartPolicyType = "on_failure"
healthcheckPath = "/api/health"
```

Or set in Railway dashboard:
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### Step 7: Generate Domain URL

1. Go to your project settings
2. Note the URL: `https://<project>-production.up.railway.app`
3. Use this URL as `VITE_SOCKET_URL` in Vercel

### Custom Domain (Optional)

1. Go to "Settings" → "Custom Domain"
2. Enter your domain
3. Configure DNS records

---

## Backend Deployment (Render)

Render is another excellent free option for Node.js backends.

### Step 1: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Create new account

### Step 2: Create Web Service

1. Click "New +"
2. Select "Web Service"
3. Connect your GitHub repository
4. Select `together-game` repository

### Step 3: Configure Service

In Render dashboard, fill in:

**Basic Information:**
- **Name**: together-backend
- **Environment**: Node
- **Region**: Choose closest to your users
- **Branch**: main

**Build Settings:**
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### Step 4: Environment Variables

Click "Environment" and add:

```
NODE_ENV=production
PORT=5000
```

### Step 5: Auto-Deploy Setup

1. Enable "Auto-Deploy"
2. Select "yes" for redeploy on push

### Step 6: Deploy

1. Click "Create Web Service"
2. Wait for deployment (2-5 minutes)
3. Note the service URL: `https://together-backend.onrender.com`
4. Use this as `VITE_SOCKET_URL` in Vercel

### Step 7: Keep Dyno Awake (Free Tier Limitation)

Render puts services to sleep after 15 minutes of inactivity. To prevent this:

1. Install [uptimerobot.com](https://uptimerobot.com)
2. Create a monitor for your backend URL
3. Ping every 5 minutes to keep awake

---

## Database Setup (Optional)

For production-grade state management, consider adding Redis:

### Redis Cloud (Free Tier Available)

1. Go to [redis.com/cloud](https://redis.com/cloud)
2. Create free account
3. Create new database
4. Get connection URL

### Add to Backend

Install Redis client:

```bash
npm install redis
```

Update `roomManager.js` to use Redis:

```javascript
const redis = require('redis');

const client = redis.createClient({
    url: process.env.REDIS_URL
});

client.connect();

// Store rooms in Redis instead of Map
```

Add to environment variables:

```
REDIS_URL=redis://default:password@host:port
```

---

## Production Checklist

### Frontend (Vercel)

- [ ] Environment variable `VITE_SOCKET_URL` set correctly
- [ ] Custom domain configured (optional)
- [ ] SSL certificate enabled (auto)
- [ ] CORS properly configured in backend
- [ ] Test socket.io connection in browser console

### Backend (Railway/Render)

- [ ] `NODE_ENV` set to `production`
- [ ] Health check endpoint working (`/api/health`)
- [ ] CORS configured for your frontend domain
- [ ] Logging enabled for debugging
- [ ] Error handling implemented

### Socket.io Configuration

Verify in backend `server.js`:

```javascript
const io = new socketIO.Server(server, {
    cors: {
        origin: ['https://your-vercel-domain.vercel.app'],
        methods: ['GET', 'POST']
    }
});
```

### Domain Configuration

Update `VITE_SOCKET_URL` in Vercel to backend domain:

```
VITE_SOCKET_URL=https://your-railway-domain.com
```

Or for Render:

```
VITE_SOCKET_URL=https://your-render-domain.onrender.com
```

---

## Monitoring & Logs

### View Logs

**Railway:**
```bash
railway logs
```

**Render:**
Go to "Logs" tab in dashboard

**Vercel:**
Go to "Deployments" → Select deployment → "Logs"

### Monitor Performance

- Use Vercel Analytics for frontend
- Use Railway/Render dashboards for backend
- Monitor Socket.io connections

---

## Troubleshooting Deployment

### "Cannot find module" errors

```bash
# In backend folder
npm install
git add package-lock.json
git commit -m "Update dependencies"
git push
```

### Socket.io connection fails

1. Check `VITE_SOCKET_URL` matches backend domain
2. Verify CORS origins in backend
3. Check WebSocket is enabled (auto on Railway/Render)
4. Look for SSL/HTTPS mismatches

### Heroku alternative (if needed)

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create together-backend

# Set environment
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

---

## Cost Breakdown

| Service | Cost | Notes |
|---------|------|-------|
| Vercel | Free | 100GB bandwidth/month |
| Railway | Free | $5/month credit, ~100 hours free |
| Render | Free | Spins down after inactivity |
| Redis Cloud | Free | Limited to 30MB |
| **Total** | **Free** | Sufficient for small games |

### For Higher Traffic

- Vercel Pro: $20/month
- Railway Pro: $7/month minimum + usage
- Render Pro: $12/month minimum

---

## SSL/HTTPS Enforcement

Both Vercel and Railway/Render provide automatic SSL:

1. **Vercel**: Auto HTTPS on `*.vercel.app`
2. **Railway/Render**: Auto HTTPS on service domains
3. Custom domains: Use Let's Encrypt (auto)

---

## Performance Tips

### Frontend Optimization

1. Vite automatically optimizes bundles
2. Enable gzip compression in Vercel
3. Use TailwindCSS PurgeCSS for smaller CSS

### Backend Optimization

1. Use clusters for multi-core
2. Implement Redis for caching
3. Server-side compression for socket.io

### Socket.io Optimization

```javascript
const io = new socketIO.Server(server, {
    transports: ['websocket'],
    pingInterval: 10000,
    pingTimeout: 5000,
    maxHttpBufferSize: 1e6
});
```

---

## Next Steps

1. Deploy backend first (takes 2-5 min)
2. Update Vercel with backend URL
3. Deploy frontend (takes 1-2 min)
4. Test the full application
5. Share your game URL!

---

**Happy Deploying!** 🚀

Need help? Check the logs in your deployment dashboard or open an issue on GitHub.
