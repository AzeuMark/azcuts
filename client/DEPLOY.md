# AzCuts — Client Deployment Guide

## Quick Start (Development)

```bash
cd client
pnpm install
pnpm dev        # → http://localhost:3000
```

## Production Build

```bash
pnpm build      # Outputs to dist/
pnpm preview    # Preview production build locally → http://localhost:4173
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api` |
| `VITE_SOCKET_URL` | Socket.io server URL | `http://localhost:5000` |

Create `.env.production` for production values:
```
VITE_API_URL=https://your-api-domain.com/api
VITE_SOCKET_URL=https://your-api-domain.com
```

---

## Deployment Options

### Option 1: Vercel (Recommended)

1. Push client folder to a GitHub repo
2. Import project in [vercel.com](https://vercel.com)
3. Set **Framework Preset** to `Vite`
4. Set **Root Directory** to `client`
5. Add environment variables (`VITE_API_URL`, `VITE_SOCKET_URL`)
6. Deploy

Add `vercel.json` in `client/` for SPA routing:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

### Option 2: Netlify

1. Push to GitHub
2. Import in [netlify.com](https://netlify.com)
3. Set **Build command** to `pnpm build`
4. Set **Publish directory** to `client/dist`
5. Add environment variables
6. Deploy

Add `client/public/_redirects` for SPA routing:
```
/*  /index.html  200
```

### Option 3: Nginx (Self-Hosted)

Build and copy `dist/` to your server:

```bash
pnpm build
# Copy dist/ contents to /var/www/azcuts/
```

Nginx config:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/azcuts;
    index index.html;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Proxy API if on same domain
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }

    # Proxy Socket.io
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }
}
```

### Option 4: Serve via Express (Same Server as API)

In the server's `server.js`, after API routes:

```js
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Serve client build
app.use(express.static(path.join(__dirname, '../client/dist')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});
```

Then build the client and start the server:
```bash
cd client && pnpm build
cd ../server && node server.js
```

---

## CORS Configuration

The server must allow the client origin. In the server's `.env`:
```
CLIENT_ORIGIN=https://your-client-domain.com
```

If serving from the same origin (Express serves both), CORS is not needed.

---

## Post-Deploy Checklist

- [ ] `VITE_API_URL` points to the production API
- [ ] `VITE_SOCKET_URL` points to the production Socket.io server
- [ ] Server `CLIENT_ORIGIN` matches the deployed client URL
- [ ] SPA routing works (all routes serve `index.html`)
- [ ] Static assets are cached (`/assets/*` with long expiry)
- [ ] HTTPS enabled on both client and API
- [ ] Theme toggle works (no flash on load)
- [ ] Login/logout flow works end-to-end
