# AzCuts — Server Deployment Guide

## Quick Start (Development)

```bash
cd server
pnpm install
pnpm dev        # → http://localhost:5000
```

## Prerequisites

- **Node.js** >= 18
- **MongoDB** >= 6.0 (local or Atlas)
- **pnpm** (or npm)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/azeubarbersalondb` |
| `JWT_ACCESS_SECRET` | Access token secret | (required) |
| `JWT_REFRESH_SECRET` | Refresh token secret | (required) |
| `ACCESS_TOKEN_TTL` | Access token lifetime | `15m` |
| `REFRESH_TOKEN_TTL` | Refresh token lifetime | `7d` |
| `CLIENT_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |
| `DEFAULT_TZ` | Default timezone | `Asia/Manila` |

## First Boot

On first boot, the server automatically:
1. Creates the `settings` singleton (seeded from `seed/settings.seed.json`)
2. Creates the admin account if none exists (from `seed/admin.seed.json`)

**Admin credentials:** `admin@azcuts.com` / `Admin@123` — **change after first login.**

---

## Production Deployment

### Option 1: PM2 (Recommended for VPS)

```bash
# Install PM2 globally
pnpm add -g pm2

# Create production .env
cp .env.example .env
# Edit .env with production values (strong secrets, production MongoDB URI)

# Start with PM2
pm2 start ecosystem.config.cjs --env production

# Save process list & enable startup
pm2 save
pm2 startup
```

Useful PM2 commands:
```bash
pm2 status          # Check status
pm2 logs azcuts-server  # View logs
pm2 restart azcuts-server
pm2 stop azcuts-server
```

### Option 2: Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --prod
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

```bash
docker build -t azcuts-server .
docker run -d -p 5000:5000 --env-file .env --name azcuts azcuts-server
```

### Option 3: Railway / Render / Fly.io

1. Push server folder to GitHub
2. Connect repo in your platform
3. Set environment variables
4. Set **Start command** to `node server.js`
5. Deploy

---

## MongoDB Production Setup

### MongoDB Atlas (Recommended)

1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a database user
3. Whitelist your server IP
4. Copy the connection string to `MONGO_URI`:
   ```
   mongodb+srv://user:password@cluster.mongodb.net/azeubarbersalondb?retryWrites=true&w=majority
   ```

### Local MongoDB Backup

```bash
# Backup
mongodump --db azeubarbersalondb --out ./backup/$(date +%Y%m%d)

# Restore
mongorestore --db azeubarbersalondb ./backup/20260715/azeubarbersalondb
```

---

## Security Checklist

- [ ] Strong `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` (32+ random chars)
- [ ] `CLIENT_ORIGIN` set to production client URL only
- [ ] MongoDB authentication enabled (username + password)
- [ ] Server firewall: only ports 80, 443, 22 open
- [ ] HTTPS via reverse proxy (Nginx/Caddy/Cloudflare)
- [ ] Rate limiting active (built-in: 20 auth attempts/15min, 100 req/min general)
- [ ] Admin password changed from default

## CORS

The server only accepts requests from `CLIENT_ORIGIN`. Set this to your production client URL:
```
CLIENT_ORIGIN=https://your-domain.com
```

## Health Check

```
GET /api/health
→ { "success": true, "data": { "status": "ok", "uptime": ... } }
```
