# UGC Station — Deployment Guide

## Server Info

- **IP:** 173.212.239.43
- **OS:** Ubuntu 24.04 LTS
- **Domain:** ugcstation.org
- **SSH:** `ssh root@173.212.239.43`

## Architecture

```
Internet
  │
  ▼
Nginx (port 80/443)
  ├── Static files → /var/www/ugc-station/frontend/dist
  ├── /api/*       → proxy to backend (port 3002)
  └── /uploads/*   → proxy to backend (port 3002)

PM2 Processes:
  ├── ugc-backend  → Node.js Express API (port 3002)
  └── ugc-bot      → Telegram Bot (Telegraf)

PostgreSQL (port 5432)
  └── Database: ugcstation
```

## File Structure on Server

```
/var/www/ugc-station/
├── backend/
│   ├── .env                    # Environment variables
│   ├── src/
│   │   ├── index.js            # Express entry point
│   │   ├── routes/             # API routes (auth, ads, applications, users, reviews, upload)
│   │   ├── middleware/auth.js  # JWT auth middleware
│   │   └── utils/telegram.js   # Telegram helpers
│   ├── prisma/
│   │   └── schema.prisma       # Database schema (PostgreSQL)
│   ├── uploads/                # User uploaded files
│   └── node_modules/
├── bot/
│   ├── .env                    # Bot environment variables
│   ├── index.js                # Telegraf bot entry point
│   └── node_modules/
└── frontend/
    ├── dist/                   # Built static files (served by nginx)
    │   ├── index.html
    │   └── assets/
    └── src/                    # Source (not used in production)

/etc/nginx/sites-available/ugc-station   # Nginx config
/etc/nginx/sites-enabled/ugc-station     # Symlink to above
/etc/letsencrypt/live/ugcstation.org/    # SSL certificates (auto-renewed)
```

## Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Frontend | React 19, TypeScript, Vite | Telegram Mini App UI |
| Backend | Express.js, Node.js 20 | REST API |
| Database | PostgreSQL 16 | Data storage |
| ORM | Prisma 6.x | Database access |
| Bot | Telegraf 4.x | Telegram bot |
| Process Manager | PM2 | Keep services alive |
| Web Server | Nginx 1.24 | Reverse proxy, static files, SSL |
| SSL | Certbot (Let's Encrypt) | HTTPS certificates |

## Database

- **DB Name:** ugcstation
- **DB User:** ugcstation
- **DB Password:** ugcstation_pass_2024
- **Connection:** `postgresql://ugcstation:ugcstation_pass_2024@localhost:5432/ugcstation`

## Environment Variables

### Backend (.env)

| Variable | Value | Description |
|----------|-------|-------------|
| BOT_TOKEN | `8676258941:AAE...` | Telegram bot token |
| DATABASE_URL | `postgresql://...` | PostgreSQL connection string |
| JWT_SECRET | `ugcstation_secret_...` | JWT signing key |
| PORT | 3002 | Backend port |
| NODE_ENV | production | Environment |
| FRONTEND_URL | https://ugcstation.org | CORS origin |
| WEB_APP_URL | https://ugcstation.org | Telegram Mini App URL |

### Bot (.env)

| Variable | Value | Description |
|----------|-------|-------------|
| BOT_TOKEN | `8676258941:AAE...` | Telegram bot token |
| FRONTEND_URL | https://ugcstation.org | Web app URL for bot buttons |
| WEB_APP_URL | https://ugcstation.org | Web app URL for bot buttons |

## Common Commands

```bash
# SSH into server
ssh root@173.212.239.43

# View running services
pm2 list

# View logs
pm2 logs ugc-backend
pm2 logs ugc-bot

# Restart services
pm2 restart ugc-backend
pm2 restart ugc-bot
pm2 restart all

# Database
sudo -u postgres psql ugcstation

# Nginx
nginx -t                    # Test config
systemctl reload nginx      # Reload config
cat /etc/nginx/sites-available/ugc-station

# SSL certificate
certbot certificates        # Check cert status
certbot renew --dry-run     # Test renewal
# Auto-renewal is handled by certbot systemd timer
```

## Ports in Use

| Port | Service |
|------|---------|
| 22 | SSH |
| 80 | Nginx (redirects to 443) |
| 443 | Nginx (HTTPS) |
| 3001 | contentcoach-api (other project, do not touch) |
| 3002 | ugc-backend |
| 5432 | PostgreSQL |

## Deploy Scripts

See `scripts/` directory:
- `scripts/deploy-backend.sh` — Deploy backend only
- `scripts/deploy-frontend.sh` — Deploy frontend only
- `scripts/deploy-bot.sh` — Deploy bot only
- `scripts/deploy-all.sh` — Deploy everything

Usage from project root:
```bash
./scripts/deploy-all.sh        # Deploy everything
./scripts/deploy-frontend.sh   # Deploy frontend only
./scripts/deploy-backend.sh    # Deploy backend only
./scripts/deploy-bot.sh        # Deploy bot only
```
