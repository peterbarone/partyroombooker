# Deployment Guide

## Prerequisites

- VPS with Docker and Docker Compose installed
- Domain name pointing to your VPS
- SSL certificate (Let's Encrypt recommended)

## Setup Steps

### 1. Clone Repository on VPS

```bash
cd /var/www
git clone https://github.com/peterbarone/partyroombooker.git
cd partyroombooker
```

### 2. Environment Configuration

```bash
# Copy and edit production environment
cp .env.production.example .env.production
nano .env.production
```

Update with your production values:

- Supabase production URLs and keys
- Clover production credentials
- Your domain name
- SMTP settings

### 3. SSL Certificate Setup

```bash
# Create SSL directory
mkdir ssl

# Copy your SSL certificates
cp /path/to/your/cert.pem ssl/
cp /path/to/your/key.pem ssl/
```

### 4. Update Nginx Configuration

Edit `nginx.conf` and replace `your-domain.com` with your actual domain.

### 5. Deploy

```bash
# Make deploy script executable
chmod +x deploy.sh

# Deploy
./deploy.sh
```

## Development with Docker

### Hot Reload Development

```bash
# Start development environment with hot reload
npm run dev:docker

# Stop development environment
npm run dev:docker-stop

# Force rebuild if needed
npm run dev:docker-rebuild
```

### Features

- ✅ **Instant changes** - Edit code locally, see changes immediately
- ✅ **Consistent environment** - Same Docker environment as production
- ✅ **No rebuilds** - Container stays running between changes

## Updating Clover Webhook URL

After deployment, update your Clover webhook URL to:
`https://your-domain.com/api/clover-webhook`

## Git Commands for Master Branch

```bash
# Add all files and commit
git add .
git commit -m "Initial commit: Party Room Booker with Next.js and Clover integration"

# Ensure we're on master branch
git branch -M master

# Add remote and push to master
git remote add origin https://github.com/peterbarone/partyroombooker.git
git push -u origin master
```

## Monitoring

```bash
# View logs
docker-compose logs -f

# Check status
docker-compose ps

# View development logs
docker-compose -f docker-compose.dev.yml logs -f
```

## Auto-Deployment

The repository includes GitHub Actions for automatic deployment:

- Triggers on push to `master` branch
- Runs tests and builds the application
- Deploys to your VPS automatically

Make sure to set these secrets in your GitHub repository:

- `VPS_HOST`: Your VPS IP address
- `VPS_USERNAME`: SSH username
- `VPS_SSH_KEY`: SSH private key
